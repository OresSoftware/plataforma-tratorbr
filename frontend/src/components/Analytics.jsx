import { useEffect } from "react";
import Cookies from "js-cookie";

const Analytics = () => {
  useEffect(() => {
    const consent = Cookies.get("cookieConsent");
    if (consent === "true") {
      // Adiciona Google Analytics dinamicamente
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = "https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXX-X";
      document.body.appendChild(script1);

      const script2 = document.createElement("script");
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'UA-XXXXXXX-X');
      `;
      document.body.appendChild(script2);
    }
  }, []);

  return null; // nada aparece na tela
};

export default Analytics;
