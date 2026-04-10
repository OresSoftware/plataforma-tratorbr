import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import './style/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="admin-layout">
      <AdminSidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="admin-main-shell">
        <main className="admin-main">
          {children}
        </main>

        <footer className="admin-footer">
          {`Copyright © ${currentYear}. Todos os direitos reservados ao TratorBR`}
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
