import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

function SignIn({ onSignIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if it's admin login
        if (email === 'admin@bidquantum.com' && password === 'admin123') {
            const adminData = {
                id: 999,
                username: 'Admin',
                email: email,
                isAdmin: true
            };
            onSignIn(adminData);
            navigate('/');
        } else {
            // For regular users, fetch user data from backend
            fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('SignIn response data:', data);
                if (data.token && data.user) {
                    console.log('User data from sign in:', data.user);
                    onSignIn(data.user);
                    navigate('/');
                } else {
                    console.error('Sign in failed:', data.message || 'Invalid credentials');
                    alert(data.message || 'Invalid credentials');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error signing in');
            });
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <h2>Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Sign In</button>
                </form>
                <p className="signup-link">
                    Don't have an account? <a href="/signup">Sign Up!</a>
                </p>
            </div>
        </div>
    );
}

export default SignIn;
