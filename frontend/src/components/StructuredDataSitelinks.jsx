import { useEffect } from 'react';

const StructuredDataSitelinks = () => {
  useEffect(() => {
    const baseUrl = window.location.origin;

    const websiteData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": baseUrl,
      "name": "TratorBR",
      "alternateName": "Trator BR",
      "description": "Plataforma de avaliação técnica e precisa de máquinas agrícolas usadas",
      "image": `${baseUrl}/logo-site.png`,
      "inLanguage": "pt-BR",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TratorBR",
      "alternateName": "Trator BR",
      "url": baseUrl,
      "logo": `${baseUrl}/logo-site.png`,
      "description": "Plataforma de avaliação de máquinas agrícolas voltada para concessionárias, revendas e profissionais",
      "inLanguage": "pt-BR",
      "sameAs": [
        "https://www.instagram.com/tratorbr.oficial/",
        "https://www.youtube.com/@tratorbr"
      ],
      "contact": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "telephone": "+55-43-99189-5458",
        "email": "contato@tratorbr.com",
        "areaServed": "BR"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "BR",
        "addressLocality": "Arapongas",
        "addressRegion": "PR"
      }
    };

    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        // {
        //   "@type": "ListItem",
        //   "position": 2,
        //   "name": "Aplicativo",
        //   "item": `${baseUrl}/aplicativo`
        // },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Sobre Nós",
          "item": `${baseUrl}/quem-somos`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Contato",
          "item": `${baseUrl}/contato`
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Ajuda",
          "item": `${baseUrl}/ajuda`
        },
        {
          "@type": "ListItem",
          "position": 6,
          "name": "Sobre App",
          "item": `${baseUrl}/sobre-app`
        }
      ]
    };

    const addScriptToHead = (data, id) => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }

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
      addScriptToHead(breadcrumbData, 'structured-data-breadcrumb')
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

export default StructuredDataSitelinks;

