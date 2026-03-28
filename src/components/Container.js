import React from 'react';
import './Container.css';
import TopContainer from './TopContainer';
import MContainer from './MContainer';

function Container({ user, onSignOut }) {
    return (
        <div className='container'>
            <TopContainer user={user} onSignOut={onSignOut} />
            <MContainer user={user} />
        </div>
    );
}

export default Container;
