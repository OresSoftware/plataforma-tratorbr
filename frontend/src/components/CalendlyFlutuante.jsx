import React from 'react';
import { Link } from 'react-router-dom';
import { useMobileMenu } from '../contexts/MobileMenuContext';
import CalendlyLinkFlutuante from "../components/CalendlyLink-flutuante";
import './style/CalendlyFlutuante.css';

const WhatsappFlutuante = () => {
    const { isMobileMenuOpen } = useMobileMenu();

    return (
        <div className={`flutuante-button ${isMobileMenuOpen ? 'hidden-by-menu' : ''}`} >
            <CalendlyLinkFlutuante />
        </div>
    );
};

export default WhatsappFlutuante;