import React, { createContext, useState, useContext } from 'react';

// Create the menu context
const MenuContext = createContext();

// Create the provider component
export const MenuProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const setMenu = (menuName) => {
    setActiveMenu(menuName);
  };

  const value = {
    isMenuOpen,
    activeMenu,
    toggleMenu,
    openMenu,
    closeMenu,
    setMenu
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

// Custom hook to use the menu context
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};