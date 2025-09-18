import React, { createContext, useContext, useState } from 'react';

const MobileMenuContext = createContext();

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error('useMobileMenu deve ser usado dentro de um MobileMenuProvider');
  }
  return context;
};

export const MobileMenuProvider = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  return (
    <MobileMenuContext.Provider value={{
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      openMobileMenu
    }}>
      {children}
    </MobileMenuContext.Provider>
  );
};
