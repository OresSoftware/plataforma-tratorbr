import { useEffect } from "react";
import Cookies from "js-cookie";

const Analytics = () => {
  useEffect(() => {
    const consent = Cookies.get("cookieConsent");

    if (consent === "true") {
      const gaId = "UA-XXXXXXX-X"; 

      if (gaId && !window.gtag) {
        const script1 = document.createElement("script");
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.body.appendChild(script1);

        const script2 = document.createElement("script");
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.body.appendChild(script2);
      }

      const pixelId = "SEU_PIXEL_ID_AQUI"; 

      if (pixelId && !window.fbq) {
        !(function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod
              ? n.callMethod.apply(n, arguments)
              : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = true;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(
          window,
          document,
          "script",
          "https://connect.facebook.net/en_US/fbevents.js"
        );

        window.fbq("init", pixelId);
        window.fbq("track", "PageView");
      }
    }
  }, []);

  return null; 
};

export default Analytics;
