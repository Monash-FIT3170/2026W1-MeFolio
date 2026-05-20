import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

// To determine breakpoint
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

// Hamburger Menu
const MobileMenu = ({ isOpen, onClose, items }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <span className="font-bold text-lg">Menu</span>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className="w-full text-left px-4 py-3 mb-2 rounded-lg hover:bg-gray-100 transition-colors font-medium min-h-[44px]"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// Main Responsive Layout Component
export const ResponsiveLayout = ({ 
  children, 
  navItems = [], 
  logo = "MeFolio",
  onNavClick 
}) => {
  const breakpoint = useBreakpoint();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with responsive design */}
      <header className={`
        sticky top-0 z-30 bg-white transition-shadow duration-300
        ${scrolled ? 'shadow-md' : 'shadow-sm'}
      `}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - touch friendly size */}
            <div className="min-h-[44px] min-w-[44px] flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                {logo}
              </span>
            </div>

            {/* Desktop/Tablet Navigation */}
            {(isTablet || !isMobile) && (
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onNavClick?.(item.id)}
                    className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium min-h-[44px] min-w-[44px]"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* Mobile Hamburger Button - 44x44 minimum touch target */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={navItems}
      />

      {/* Main Content with responsive padding */}
      <main className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
        {children}
      </main>

      {/* Responsive Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            © 2026 MeFolio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

ResponsiveLayout.propTypes = {
  children: PropTypes.node.isRequired,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  logo: PropTypes.string,
  onNavClick: PropTypes.func,
};

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
};