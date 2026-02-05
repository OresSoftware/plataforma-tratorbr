import { useEffect } from 'react';

// 1. WebSite com SearchAction (para caixa de busca)
// 2. Organization (informações sobre a empresa)
// 3. BreadcrumbList (para navegação estruturada)
 
// Isso melhora significativamente a visibilidade nos resultados do Google
 
const StructuredDataAdvanced = () => {
  useEffect(() => {
    const baseUrl = window.location.origin;

    // 1
    const websiteData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": baseUrl,
      "name": "TratorBR",
      "description": "Plataforma completa de avaliação técnica e precisa de máquinas agrícolas usadas",
      "image": `${baseUrl}/logo-site.png`,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    // 2
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TratorBR",
      "url": baseUrl,
      "logo": `${baseUrl}/logo-site.png`,
      "description": "Plataforma de avaliação de máquinas agrícolas voltada para concessionárias, revendas e profissionais",
      "sameAs": [
        "https://www.instagram.com/tratorbr.oficial/",
      ],
      "contact": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "telephone": "+55-43-99189-5458",
        "email": "contato@tratorbr.com"
      }
    };

    // 3
    const sitelinksData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": baseUrl,
      "name": "TratorBR",
      "mainEntity": {
        "@type": "Organization",
        "name": "TratorBR"
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      ]
    };

    const addScriptToHead = (data, id) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      script.id = id;
      document.head.appendChild(script);
      return script;
    };

    const scripts = [
      addScriptToHead(websiteData, 'structured-data-website'),
      addScriptToHead(organizationData, 'structured-data-organization'),
      addScriptToHead(sitelinksData, 'structured-data-sitelinks')
    ];

    return () => {
      scripts.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  return null;
};

export default StructuredDataAdvanced;
