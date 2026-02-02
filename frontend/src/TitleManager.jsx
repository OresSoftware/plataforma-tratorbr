import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const titles = {

      // MARKTEPLACE
      '/': 'TratorBR - Início',
      '/aplicativo': 'TratorBR - Aplicativo',
      '/contato': 'TratorBR - Contato',
      '/termos-e-politicas': 'TratorBR - Termos e Políticas',
      '/planos-creditos': 'TratorBR - Planos e Créditos',
      '/ajuda': 'TratorBR - Ajuda',
      '/excluir-conta': 'TratorBR - Excluir Conta',
      '/quem-somos': 'TratorBR - Quem Somos',
      '/sobre-app': 'TratorBR - Sobre o App',

      // ADMIN
      '/admin/login': 'TratorBR - Login Admin',
      '/admin/dashboard': 'TratorBR - Dashboard Admin',
      '/admin/ips': 'TratorBR - Gerenciar IPS Admin',
      '/admin/contato': 'TratorBR - Contato Admin',
      '/admin/usuarios': 'TratorBR - Usuarios Admin',
      '/admin/empresas': 'TratorBR - Empresas Admin'

    };

    const title = titles[location.pathname] || 'TratorBR';
    document.title = title;
  }, [location]);

  return null;
};

export default TitleManager;

