import React from 'react';
import Menu from './Menu';
import TopContainer from './TopContainer';
import './CharityPage.css';

const CharityPage = ({ user, onLogout }) => {
    return (
        <div>
            <Menu user={user} onLogout={onLogout} />
            <div className="container" style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
                <TopContainer user={user} onSignOut={onLogout} />
                <div className="charityContent">
                    <div className="charity-content">
                        <h1>Charity Auctions</h1>
                        <p>Welcome to the Charity Auctions page! Here you can participate in live charity auctions and support great causes.</p>
                        {/* Auction components or logic will go here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharityPage;
