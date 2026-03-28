import React, { useEffect } from 'react';
import { BiSearchAlt } from "react-icons/bi";
import { FaBell, FaChevronDown, FaRightFromBracket } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import './Container';
import './TopContainer.css';
import ProfileImage from '../images/ProfileImage.jpg';

function TopContainer({ user, onSignOut }) {
    const navigate = useNavigate();

    const handleSignOut = () => {
        if (onSignOut) {
            onSignOut();
        }
    };

    useEffect(() => {
        const menuTarget = document.getElementById("menuChevron");
        const menuContainer = document.getElementById("menuContainer");

        if (menuTarget && menuContainer) {
            menuTarget.addEventListener('mouseenter', () => {
                menuTarget.style.transform = 'rotate(180deg)';
                menuContainer.style.transform = 'translateX(0px)';
            });

            menuContainer.addEventListener('mouseleave', () => {
                menuTarget.style.transform = 'rotate(0deg)';
                menuContainer.style.transform = 'translateX(300px)';
            });
        }

        return () => {
            if (menuTarget && menuContainer) {
                menuTarget.removeEventListener('mouseenter', () => {});
                menuContainer.removeEventListener('mouseleave', () => {});
            }
        };
    }, []);

    return (
        <div className='topContainer'>
            <div className='inputBox'>
                <input 
                    type='text' 
                    placeholder='Search items, collections' 
                    className='input search-input'
                />
                <i className='search-icon'><BiSearchAlt /></i>
            </div>

            <div className="profileContainer">
                {user ? (
                    <>
                        <div className="notification-container">
                            <i className="bell-icon">
                                <FaBell />
                                <span className="status-indicator status-online"></span>
                            </i>
                        </div>
                        <div className="profile-info">
                            <div className="profile-avatar">
                                {user.profilePicture ? (
                                    <img 
                                        src={`http://localhost:5000/${user.profilePicture}`} 
                                        alt="profile"
                                        className="avatar-image"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.username ? user.username[0].toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="user-details">
                                <span className="username">{user.username}</span>
                                <span className="user-status">
                                    {user.isAdmin ? (
                                        <span className="badge badge-gold">Admin</span>
                                    ) : (
                                        <span className="badge badge-silver">Member</span>
                                    )}
                                </span>
                            </div>
                        </div>
                        <i className="menuChevron" id="menuChevron">
                            <FaChevronDown />
                        </i>

                        <div className="menuContainer" id="menuContainer">
                            <div className="menu-header">
                                <h4>Account Menu</h4>
                            </div>
                            <ul className="menu-items">
                                <li className="menu-item">
                                    <Link to="/profile">My Profile</Link>
                                </li>
                                <li className="menu-item">
                                    <Link to="/bidding-history">Bidding History</Link>
                                </li>
                                <li className="menu-item">
                                    <Link to="/analytics">Analytics</Link>
                                </li>
                                {user.isAdmin && (
                                    <li className="menu-item">
                                        <Link to="/admin">Admin Panel</Link>
                                    </li>
                                )}
                                <li className="menu-divider"></li>
                                <li className="menu-item menu-logout" onClick={handleSignOut}>
                                    <FaRightFromBracket className="logout-icon" />
                                    Sign Out
                                </li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <div className="authButtons">
                        <Link to="/signin" className="btn btn-secondary">Sign In</Link>
                        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopContainer;
