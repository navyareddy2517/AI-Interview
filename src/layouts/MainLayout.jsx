
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showNavbar, setShowNavbar] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    // Hide navbar and footer on login and register pages
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    setShowNavbar(!isAuthPage);
    setShowFooter(!isAuthPage);
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        key={location.pathname}
      >
        <Outlet />
      </motion.main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
