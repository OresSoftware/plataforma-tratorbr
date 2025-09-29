import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./style/CookieConsent.css"; // agora usa o CSS externo

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = Cookies.get("cookieConsent");
        if (!consent) setVisible(true);
    }, []);

    const handleAccept = () => {
        Cookies.set("cookieConsent", "true", { expires: 365 });
        setVisible(false);
    };

    const handleReject = () => {
        Cookies.set("cookieConsent", "false", { expires: 365 });
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="cookie-banner">
            <p className="cookie-text">
                Nós usamos cookies e outras tecnologias semelhantes para melhorar a sua experiência em nossos serviços,
                personalizar publicidade e recomendar conteúdo de seu interesse. Ao utilizar nossos serviços, você concorda
                com o monitoramento descrito em nossa política.
                <a href="/poloticasdeprivacidade.html" className="cookie-link">Ver nossa política</a>
            </p>
            <div className="cookie-buttons">
                <button className="cookie-accept" onClick={handleAccept}>Aceitar</button>
                <button className="cookie-reject" onClick={handleReject}>Rejeitar</button>
            </div>
        </div>
    );
};

export default CookieConsent;
