import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pages = {
      '/': {
        title: 'TratorBR',
        description: 'Plataforma completa de avaliação técnica e precisa de máquinas agrícolas usadas para concessionárias, revendas e profissionais.'
      },
      '/contato': {
        title: 'Contato - TratorBR',
        description: 'Entre em contato com a equipe da TratorBR. Estamos prontos para ajudar com suas dúvidas e sugestões sobre avaliação de máquinas agrícolas.'
      },
      '/quem-somos': {
        title: 'Quem Somos - TratorBR',
        description: 'Conheça a história e a missão da TratorBR, a plataforma líder em avaliação técnica de máquinas agrícolas usadas.'
      },
      '/sobre-app': {
        title: 'Sobre o App - TratorBR',
        description: 'Descubra como o aplicativo TratorBR pode revolucionar a forma como você avalia máquinas agrícolas com precisão e rapidez.'
      },
      '/ajuda': {
        title: 'Ajuda e FAQ - TratorBR',
        description: 'Encontre respostas para as perguntas mais frequentes sobre o TratorBR e o aplicativo de avaliação de máquinas agrícolas.'
      }
    };

    const page = pages[location.pathname] || pages['/'];
    
    document.title = page.title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = page.description;
  }, [location]);

  return null;
};

export default TitleManager;
