import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'TratorBR - Sistema Simplificado',
      '/aplicativo': 'Aplicativo - TratorBR',
      '/contato': 'Contato - TratorBR',
      '/politica-privacidade': 'Política de Privacidade - TratorBR',
      '/termos-uso': 'Termos de Uso - TratorBR',
      '/admin/duvidas': 'Dúvidas - TratorBR',
      '/admin/login': 'Login Admin - TratorBR',
      '/admin/dashboard': 'Dashboard Admin - TratorBR',
      '/admin/ips': 'Gerenciar IPs - TratorBR'
    };

    const title = titles[location.pathname] || 'TratorBR';
    document.title = title;
  }, [location]);

  return null;
};

export default TitleManager;

