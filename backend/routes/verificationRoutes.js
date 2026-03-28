const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { runQuery } = require('../config/database');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/verification');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `verification-${req.body.userId || 'unknown'}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and PDF files are allowed'));
    }
  }
});

// Get user verification status
router.get('/users/:userId/verification-status', async (req, res) => {
  try {
    const { userId } = req.params;

    const verification = await runQuery(
      'SELECT status, submitted_at, reviewed_at, rejection_reason FROM user_verification WHERE user_id = ?',
      [userId]
    );

    if (verification.length === 0) {
      return res.json({ status: 'none' });
    }

    res.json({
      status: verification[0].status,
      submittedAt: verification[0].submitted_at,
      reviewedAt: verification[0].reviewed_at,
      rejectionReason: verification[0].rejection_reason
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ message: 'Failed to fetch verification status' });
  }
});

// Submit verification application
router.post('/users/:userId/verify', upload.array('documents', 5), async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      fullName,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      country,
      idType,
      idNumber,
      phoneNumber
    } = req.body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !address || !city || !state || !zipCode || !country || !idType || !idNumber || !phoneNumber) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if user already has a pending verification
    const existingVerification = await runQuery(
      'SELECT status FROM user_verification WHERE user_id = ? AND status IN (?, ?)',
      [userId, 'pending', 'verified']
    );

    if (existingVerification.length > 0) {
      return res.status(400).json({ 
        message: 'You already have a verification application in progress or verified' 
      });
    }

    // Save verification documents
    const documentPaths = req.files ? req.files.map(file => `/uploads/verification/${file.filename}`) : [];

    // Insert verification record
    await runQuery(`
      INSERT INTO user_verification 
      (user_id, full_name, date_of_birth, address, city, state, zip_code, country, 
       id_type, id_number, phone_number, documents, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      userId, fullName, dateOfBirth, address, city, state, zipCode, country,
      idType, idNumber, phoneNumber, JSON.stringify(documentPaths), 'pending'
    ]);

    // Update user's verification status in users table
    await runQuery(
      'UPDATE users SET verification_status = ? WHERE id = ?',
      ['pending', userId]
    );

    res.json({
      success: true,
      message: 'Verification submitted successfully',
      status: 'pending'
    });

  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ message: 'Failed to submit verification' });
  }
});

// Upload verification document (separate endpoint for drag-and-drop)
router.post('/upload/verification-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const documentUrl = `/uploads/verification/${req.file.filename}`;
    
    res.json({
      success: true,
      url: documentUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Admin: Get all pending verifications
router.get('/admin/verifications/pending', async (req, res) => {
  try {
    const pendingVerifications = await runQuery(`
      SELECT uv.*, u.username, u.email
      FROM user_verification uv
      JOIN users u ON uv.user_id = u.id
      WHERE uv.status = 'pending'
      ORDER BY uv.submitted_at ASC
    `);

    res.json(pendingVerifications);
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ message: 'Failed to fetch pending verifications' });
  }
});

// Admin: Approve verification
router.post('/admin/verifications/:verificationId/approve', async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { adminNote } = req.body;

    // Get verification details
    const verification = await runQuery(
      'SELECT user_id FROM user_verification WHERE id = ?',
      [verificationId]
    );

    if (verification.length === 0) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Update verification status
    await runQuery(`
      UPDATE user_verification 
      SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, admin_note = ?
      WHERE id = ?
    `, [adminNote || '', verificationId]);

    // Update user's verification status
    await runQuery(
      'UPDATE users SET verification_status = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['verified', verification[0].user_id]
    );

    res.json({
      success: true,
      message: 'Verification approved successfully'
    });

  } catch (error) {
    console.error('Error approving verification:', error);
    res.status(500).json({ message: 'Failed to approve verification' });
  }
});

// Admin: Reject verification
router.post('/admin/verifications/:verificationId/reject', async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Get verification details
    const verification = await runQuery(
      'SELECT user_id FROM user_verification WHERE id = ?',
      [verificationId]
    );

    if (verification.length === 0) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Update verification status
    await runQuery(`
      UPDATE user_verification 
      SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ?
      WHERE id = ?
    `, [rejectionReason, verificationId]);

    // Update user's verification status
    await runQuery(
      'UPDATE users SET verification_status = ? WHERE id = ?',
      ['rejected', verification[0].user_id]
    );

    res.json({
      success: true,
      message: 'Verification rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting verification:', error);
    res.status(500).json({ message: 'Failed to reject verification' });
  }
});

// Get verification details for admin
router.get('/admin/verifications/:verificationId', async (req, res) => {
  try {
    const { verificationId } = req.params;

    const verification = await runQuery(`
      SELECT uv.*, u.username, u.email, u.created_at as user_created_at
      FROM user_verification uv
      JOIN users u ON uv.user_id = u.id
      WHERE uv.id = ?
    `, [verificationId]);

    if (verification.length === 0) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    res.json(verification[0]);
  } catch (error) {
    console.error('Error fetching verification details:', error);
    res.status(500).json({ message: 'Failed to fetch verification details' });
  }
});

// User: Get own verification details
router.get('/users/:userId/verification-details', async (req, res) => {
  try {
    const { userId } = req.params;

    const verification = await runQuery(
      'SELECT * FROM user_verification WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1',
      [userId]
    );

    if (verification.length === 0) {
      return res.json({ message: 'No verification found' });
    }

    res.json(verification[0]);
  } catch (error) {
    console.error('Error fetching verification details:', error);
    res.status(500).json({ message: 'Failed to fetch verification details' });
  }
});

// Get verification statistics for admin
router.get('/admin/verification-stats', async (req, res) => {
  try {
    const stats = await runQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN submitted_at >= date('now', '-7 days') THEN 1 ELSE 0 END) as this_week
      FROM user_verification
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    res.status(500).json({ message: 'Failed to fetch verification stats' });
  }
});

module.exports = router;
