import { useEffect } from 'react';

/**
 * Componente StructuredDataSitelinks
 * 
 * Injeta dados estruturados em JSON-LD no <head> da página
 * para que o Google exiba sitelinks nos resultados de busca.
 * 
 * Baseado no schema.org WebSite com potentialAction
 * 
 * Referência: https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */

const StructuredDataSitelinks = () => {
  useEffect(() => {
    // Definir a URL base do seu site
    const baseUrl = window.location.origin;
    
    // Dados estruturados para sitelinks
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": baseUrl,
      "name": "TratorBR",
      "description": "Plataforma de avaliação técnica de máquinas agrícolas usadas",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    // Criar script tag com os dados estruturados
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'structured-data-sitelinks';
    
    // Adicionar ao head
    document.head.appendChild(script);

    // Cleanup: remover script ao desmontar o componente
    return () => {
      const existingScript = document.getElementById('structured-data-sitelinks');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // Este componente não renderiza nada visível
};

export default StructuredDataSitelinks;
