import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import './style/AnunciosPage.css';

// Banners para DESKTOP
import banner3 from "/banners-anuncios/bannerTeste-anuncios1.png";
import banner1 from "/banners-anuncios/bannerTeste-anuncios2.png";
import banner2 from "/banners-anuncios/bannerTeste-anuncios3.png";

// Banners para MOBILE
import bannerMobile1 from "/banners-anuncios/banner-mobile-anuncios1.png";
import bannerMobile2 from "/banners-anuncios/banner-mobile-anuncios2.png";
import bannerMobile3 from "/banners-anuncios/banner-mobile-anuncios3.png";

function Carousel({ images, interval = 5000, autoPlay = true }) {
  const validImages = useMemo(
    () => (images || []).filter((i) => i && i.src && i.src !== ""),
    [images]
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  if (!validImages.length) return null;

  const goTo = (i) => setIndex((i + validImages.length) % validImages.length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (!autoPlay || paused) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setIndex((v) => (v + 1) % validImages.length),
      interval
    );
    return () => timer.current && clearInterval(timer.current);
  }, [autoPlay, paused, interval, validImages.length]);

  return (
    <div
      className="hera" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-label="Banner de destaque"
    >
      <div className="hera-viewport"> {validImages.map((img, i) => (
        <img key={img.src} src={img.src} alt={img.alt || `Banner ${i + 1}`} className={`hera-slide ${i === index ? "is-active" : ""}`} draggable={false} />
      ))}
      </div>

      <button className="hera-nav hera-nav-left" aria-label="Slide anterior" onClick={prev} type="button">‹</button>
      <button className="hera-nav hera-nav-right" aria-label="Próximo slide" onClick={next} type="button">›</button>

      <div className="hera-dots"> {validImages.map((_, i) => (
        <button key={i} aria-label={`Ir para o slide ${i + 1}`} className={`hera-dot ${i === index ? "active" : ""}`} onClick={() => goTo(i)} type="button" />
      ))}
      </div>
    </div>
  );
}

export default function AnunciosPage() {

  const [isCategoriaAberta, setCategoriaAberta] = useState(false);
  
  // BANNER Desktop
  const bannersDesktop = [
    { src: banner1, alt: "Banner 1 teste" }, 
    { src: banner2, alt: "Banner 2 teste" },
    { src: banner3, alt: "Banner 3 teste" },
  ].filter((b) => b.src && b.src !== "");

  // BANNER Mobile
  const bannersMobile = [
    { src: bannerMobile1, alt: "Banner Mobile 1 teste" },
    { src: bannerMobile2, alt: "Banner Mobile 1 teste" },
    { src: bannerMobile3, alt: "Banner Mobile 1 teste" },
  ].filter((b) => b.src && b.src !== "");

  return (
    <main >
      <Header />

      <section className={`home-hera-wrapper ${isCategoriaAberta ? 'categorias-abertas' : ''}`}>

        <div className="carousel-desktop">
          <Carousel images={bannersDesktop} interval={6000} autoPlay={true} />
        </div>

        <div className="carousel-mobile">
          <Carousel images={bannersMobile} interval={6000} autoPlay={true} />
        </div>

      </section>

      {/* <WhatsappFlutuante /> */}
      {/* <CalendlyFlutuante />  */}
      <VoltarAoTopoBtn />
      <Footer />
    </main>
  );
}