import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
const REMEMBER_ME_INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 hours if Remember Me is checked
const ABSOLUTE_LIMIT = 8 * 60 * 60 * 1000; // 8 hours absolute

export default function SessionTimeout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const absoluteTimerRef = useRef(null);

  const handleLogout = useCallback((reason) => {
    logout();
    toast.error(reason, { id: 'session-timeout' });
    navigate('/login');
  }, [logout, navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Check if Remember Me is active
    const isRememberMe = localStorage.getItem('remember_me') === 'true';
    const limit = isRememberMe ? REMEMBER_ME_INACTIVITY_LIMIT : INACTIVITY_LIMIT;

    timerRef.current = setTimeout(() => {
      handleLogout('Session expired due to inactivity.');
    }, limit);
  }, [handleLogout]);

  useEffect(() => {
    if (!user) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
      return;
    }

    // --- Absolute Session Timeout ---
    const loginTime = parseInt(localStorage.getItem('login_time') || Date.now());
    const timeElapsed = Date.now() - loginTime;
    const timeLeft = ABSOLUTE_LIMIT - timeElapsed;

    if (timeLeft <= 0) {
      handleLogout('Absolute session limit reached (8 hours). Please login again.');
    } else {
      absoluteTimerRef.current = setTimeout(() => {
        handleLogout('Absolute session limit reached (8 hours). Please login again.');
      }, timeLeft);
    }

    // --- Inactivity Timeout ---
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    resetTimer(); // Start the initial timer

    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
    };
  }, [user, resetTimer, handleLogout]);

  return null; // This component doesn't render anything
}
