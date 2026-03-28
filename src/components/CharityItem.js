import React from 'react';
import Menu from './Menu';
import './CharityItem.css';

function CharityItem({ user }) {
  return (
    <div className="charity-item">
      <Menu />
      <div className="charity-container">
        <div className="charity-content">
          <h1>Charity Items</h1>
          <div className="charity-form">
            {/* Add your charity item form here */}
            <p>Add charity items form will go here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharityItem;