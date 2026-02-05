import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import './style/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
