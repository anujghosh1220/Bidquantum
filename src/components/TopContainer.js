import React, { useEffect } from 'react';
import { BiSearchAlt } from "react-icons/bi";
import { FaBell, FaChevronDown, FaRightFromBracket } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import './Container';
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
                <input type='text' placeholder='Search items, collections' />
                <i><BiSearchAlt /></i>
            </div>

            <div className="profileContainer">
                {user ? (
                    <>
                        <i className="bellIcon">
                            <FaBell />
                        </i>
                        <div className="profileImage">
                            {user.profilePicture ? (
                                <img 
                                    src={`http://localhost:5000/${user.profilePicture}`} 
                                    alt="profile"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div className="defaultAvatar" style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#b1147d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '18px'
                                }}>
                                    {user.username ? user.username[0].toUpperCase() : 'U'}
                                </div>
                            )}
                            <span style={{
                                marginLeft: '10px',
                                color: '#fff',
                                fontSize: '14px'
                            }}>
                                {user.username}
                            </span>
                        </div>
                        <i className="menuChevron" id="menuChevron">
                            <FaChevronDown />
                        </i>

                        <div className="menuContainer" id="menuContainer">
                            <ul>
                                <li>About Us</li>
                                <li>Contact Us</li>
                                <li onClick={handleSignOut}>Sign Out</li>
                            </ul>
                        </div>
                        <i className="logout" onClick={handleSignOut}>
                            <FaRightFromBracket />
                        </i>
                    </>
                ) : (
                    <div className="authButtons">
                        <Link to="/signin" className="signInBtn">Sign In</Link>
                        <Link to="/signup" className="signUpBtn">Sign Up</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopContainer;
