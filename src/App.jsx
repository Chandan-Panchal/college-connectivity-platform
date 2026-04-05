import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import Nav from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import BuySell from './pages/BuySell.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Resources from './pages/Resources.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Notifications from './pages/Notifications.jsx';
import Clubs from './pages/Clubs.jsx';
import ClubDetails from './pages/ClubDetails.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import MapPage from './pages/MapPage.jsx';
import PointsPopup from './components/PointsPopup.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [session, setSession] = useState(null);
  const [reward, setReward] = useState(null);
  const rewardTimeout = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleReward = (event) => {
      setReward(event.detail);

      if (rewardTimeout.current) {
        clearTimeout(rewardTimeout.current);
      }

      rewardTimeout.current = setTimeout(() => {
        setReward(null);
      }, 2600);
    };

    window.addEventListener('points-earned', handleReward);

    return () => {
      window.removeEventListener('points-earned', handleReward);
      if (rewardTimeout.current) {
        clearTimeout(rewardTimeout.current);
      }
    };
  }, []);

  return (
    <Router>
      <Nav session={session} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/campus" element={<MapPage />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/resources" element={session ? <Resources /> : <Navigate to="/login" />} />
        <Route path="/buy-sell" element={session ? <BuySell /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={session ? <Notifications /> : <Navigate to="/login" />} />
        <Route path="/clubs" element={session ? <Clubs /> : <Navigate to="/login" />} />
        <Route path="/clubs/:id" element={session ? <ClubDetails /> : <Navigate to="/login" />} />
        <Route path="/leaderboard" element={session ? <Leaderboard /> : <Navigate to="/login" />} />

        {/* Campus Map */}
        <Route path="/campus" element={<MapPage />} />
      </Routes>

      <PointsPopup reward={reward} />
    </Router>
  );
}

export default App;