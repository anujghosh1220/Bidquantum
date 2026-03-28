import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Menu.css';
import Logo from '../images/logo.png';
import { FaHome, FaListAlt, FaRegUser,FaMoneyCheckAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

function Menu({ user, onLogout }) {
    const navigate = useNavigate();

    useEffect(() => {
        const mainMenuLi = document.getElementById('mainMenu').querySelectorAll('li');

        function changeActive() {
            mainMenuLi.forEach((n) => n.classList.remove('active'));
            this.classList.add('active');
        }

        mainMenuLi.forEach((n) => n.addEventListener('click', changeActive));

        return () => {
            mainMenuLi.forEach((n) => n.removeEventListener('click', changeActive));
        };
    }, []);

    const handleLogoutClick = () => {
        if (user) {
            onLogout();
            navigate('/signin');
        }
    };

    const handleListClick = () => {
        navigate('/list');
    };

    return (
        <menu>
            <img src={Logo} alt="Logo" />

            <ul id="mainMenu">
                <Icon icon={<FaHome />} to="/" />
                <li onClick={handleListClick}>
                    <Link to="/items" style={{ color: 'inherit', textDecoration: 'none' }}>
                        <FaListAlt />
                    </Link>
                </li>
                <Icon icon={<FaMoneyCheckAlt />} to="/sellerDashboard" />
                {user?.isAdmin && (
                    <li>
                        <Link to="/admin/upload" style={{ color: 'inherit', textDecoration: 'none' }}>
                            Upload Item
                        </Link>
                    </li>
                )}
            </ul>

            <ul id="lastMenu">
                {user ? (
                    <li id="lastMenu" onClick={handleLogoutClick}>
                        <FaRegUser />
                    </li>
                ) : (
                    <Icon icon={<FaRegUser />} to="/signin" />
                )}
            </ul>
        </menu>
    );
}

const Icon = ({ icon, to }) => (
    <li>
        <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }}>
            {icon}
        </Link>
    </li>
);

Menu.propTypes = {
    user: PropTypes.shape({
        isAdmin: PropTypes.bool
    }),
    onLogout: PropTypes.func.isRequired
};

export default Menu;
