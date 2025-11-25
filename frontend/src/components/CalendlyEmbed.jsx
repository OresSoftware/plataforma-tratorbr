import React, { useEffect } from 'react';
import './style/CalendlyEmbed.css';

const CalendlyEmbed = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true; 
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      className="calendly-inline-widget"
      data-url="https://calendly.com/administrativo-tratorbr/reuniao-de-apresentacao-tratorbr" 
      style={{ minWidth: '450px', height: '700px' }}
    >
    </div>
  );
};

export default CalendlyEmbed;