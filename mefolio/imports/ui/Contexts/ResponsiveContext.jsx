/**
 * FEAT-09: Responsive Context Provider for Automatic Layout Adjustment
 * 
 * Provides breakpoint detection and allows componenets to conditionally render based on screen size.
 * 
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ResponsiveContext = createContext();

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
};

export const ResponsiveProvider = ({ children }) => {
  const [breakpoint, setBreakpoint] = useState('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      const newBreakpoint = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
      setBreakpoint(newBreakpoint);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ResponsiveContext.Provider value={{ 
      breakpoint, 
      isMobile, 
      isTablet, 
      isDesktop,
      windowWidth 
    }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

ResponsiveProvider.propTypes = {
  children: PropTypes.node.isRequired,
};