import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'TratorBR - Início',
      '/aplicativo': 'TratorBR - Aplicativo',
      '/contato': 'TratorBR - Contato',
      '/politica-privacidade': 'TratorBR - Política de Privacidade',
      '/termos-uso': 'TratorBR - Termos de Uso',
      '/juda': 'TratorBR - Dúvidas',
      '/admin/login': 'TratorBR - Login Admin',
      '/admin/dashboard': 'TratorBR - Dashboard Admin',
      '/admin/ips': 'TratorBR - Gerenciar IPS Admin',
      '/ajuda': 'TratorBR - Ajuda',
      '/excluir-conta': 'TratorBR - Excluir Conta',
      '/sobre-nos': 'TratorBR - Sobre Nos',
    };

    const title = titles[location.pathname] || 'TratorBR';
    document.title = title;
  }, [location]);

  return null;
};

export default TitleManager;

