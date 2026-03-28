import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Menu from './components/Menu';
import Container from './components/Container';
import Gallery from './gallery/Gallery';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Admin from './components/Admin';
import BiddingPage from './components/BiddingPage';
import ListPage from './components/ListPage';
import Payments from './components/Payments';
import CharityPage from './components/CharityPage'; // Renamed import
import CharityItem from './components/CharityItem';
import SellerDashboard from './components/SellerDashboard';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = (userData) => {
    console.log('handleSignIn - User data received:', userData);
    
    // Ensure the user object has the expected structure
    const userWithId = {
      ...userData,
      _id: userData._id || userData.id, // Handle both _id and id fields
      id: userData.id || userData._id   // Ensure both fields are set
    };
    
    console.log('handleSignIn - Setting user with ID:', userWithId._id);
    setUser(userWithId);
    navigate('/');
  };

  const handleSignOut = () => {
    setUser(null);
    navigate('/signin');
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <>
            <Menu user={user} onLogout={handleSignOut} />
            <Container user={user} onSignOut={handleSignOut} />
          </>
        } />
        <Route path="/gallery" element={
          <Gallery user={user} />
        } />
        <Route path="/bid/:itemId" element={
          <BiddingPage user={user} />
        } />
        <Route path="/charity/:id" element={
          <CharityItem user={user} />
        } />
        <Route path="/sellerDashboard" element={
          <SellerDashboard user={user} onLogout={handleSignOut} />
        } />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/signup" element={<SignUp onSignUp={handleSignIn} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/payments" element={
          <>
            <Menu user={user} onLogout={handleSignOut} />
            <Payments />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
