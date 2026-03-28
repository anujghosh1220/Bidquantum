import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import axios from 'axios';

function SignUp({ onSignUp }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('city', city);
            formData.append('phone', phone);
            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }

            const response = await axios.post('http://localhost:5000/api/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                onSignUp(response.data.user);
                navigate('/');
            } else {
                alert('Signup failed: ' + response.data.error);
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Error during signup: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="login-box">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <div className="textbox">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="textbox">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength="8"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title="Password must contain at least one number and one upper case and one lowercase letter and 8 characters"
                        required
                    />
                </div>
                <div className="textbox">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        pattern="[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+\.[a-z]{2,4}"
                        title="Invalid Email"
                        required
                    />
                </div>
                <div className="textbox">
                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />
                </div>
                <div className="textbox">
                    <input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyPress={(e) => {
                            if (!/[0-9]/i.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        maxLength="10"
                        pattern="([0-9]){10,}"
                        required
                    />
                </div>
                <div className="textbox">
                    <label>Profile Picture</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                    />
                    {previewUrl && (
                        <img 
                            src={previewUrl} 
                            alt="Profile preview" 
                            style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }}
                        />
                    )}
                </div>
                <center>
                    <button className="glow-on-hover btn" type="submit">
                        Sign Up
                    </button>
                </center>
                <center>
                    <a href="/signin">Already have an account?</a>
                </center>
            </form>
        </div>
    );
}

export default SignUp;
