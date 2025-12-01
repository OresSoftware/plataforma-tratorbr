import React, { useEffect } from 'react';

const CALENDLY_URL = 'https://calendly.com/tratorbr/tratorbr';

const CalendlyLink = ({ linkText = 'Agende Demonstração' }) => {

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <a
      href="#" 
      onClick={(e) => {
        e.preventDefault(); 
        
        if (window.Calendly) {
            window.Calendly.initPopupWidget({ url: CALENDLY_URL });
        } else {
            console.error("O agendamento não foi carregado corretamente. Tente novamente mais tarde.");
        }
      }}
      style={{ cursor: 'pointer', textDecoration: 'none', color: '#fff', }} 
    >
      {linkText}
    </a>
  );
}

export default CalendlyLink;