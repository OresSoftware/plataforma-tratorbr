import { useEffect } from 'react';


// Injeta dados estruturados em JSON-LD no <head> da página para que o Google exiba sitelinks nos resultados de busca.
 
const StructuredDataSitelinks = () => {
  useEffect(() => {
    const baseUrl = window.location.origin;
    
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

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.id = 'structured-data-sitelinks';
    
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('structured-data-sitelinks');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; 
};

export default StructuredDataSitelinks;
