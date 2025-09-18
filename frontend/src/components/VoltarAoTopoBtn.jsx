import React, { useState, useEffect } from 'react';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import './VoltarAoTopoBtn.css';

const VoltarAoTopoBtn = () => {
  const [showBtn, setShowBtn] = useState(false);
  const { isMobileMenuOpen } = useMobileMenu();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      setShowBtn(scrollTop + windowHeight >= docHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`voltar-ao-topo-btn ${showBtn ? 'visible' : 'hidden'} ${isMobileMenuOpen ? 'hidden-by-menu' : ''}`}
      onClick={scrollToTop}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6"></path>
      </svg>
    </div>
  );
};

export default VoltarAoTopoBtn;
