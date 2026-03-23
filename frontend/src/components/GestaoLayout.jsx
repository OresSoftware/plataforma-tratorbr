import React, { useState } from 'react';
import GestaoSidebar from './GestaoSidebar';
import './style/GestaoLayout.css';

const GestaoLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="gestao-layout">
      <GestaoSidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <main className="gestao-main">
        {children}
      </main>
    </div>
  );
};

export default GestaoLayout;
