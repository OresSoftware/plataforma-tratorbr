import React, { useEffect } from 'react';

const CalendlyBadge = () => {
  const calendlyConfig = {
    url: 'https://calendly.com/administrativo-tratorbr/reuniao-de-apresentacao-tratorbr',
    text: 'Agende sua reunião conosco',
    color: '#15383E',
    textColor: '#ffffff',
    branding: true
  };

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

    script.onload = () => {
      if (window.Calendly) {
        window.Calendly.initBadgeWidget(calendlyConfig);
      }
    };

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []); 

  return null; 
};

export default CalendlyBadge;