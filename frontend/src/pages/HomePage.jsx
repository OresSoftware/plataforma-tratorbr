import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
// import WhatsappFlutuante from '../components/WhatsappFlutuante';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import CalendlyFlutuante from '../components/CalendlyFlutuante';  
import './style/HomePage.css';

// QR CODE
import iph03 from '/imagens-aplicativo/iphone-03.png';
import qrcode from '/imagens-aplicativo/qr-code.png';
import qrcodeapple from '/imagens-aplicativo/qr-code-apple.jpg';

// PUBLICO ALVO
import img_um from '/imagens-aplicativo/publico-alvo1.png';
import img_dois from '/imagens-aplicativo/publico-alvo2.png';

// Banners para DESKTOP
import banner1 from "/banners/bannerTeste-1.png";
import banner2 from "/banners/bannerTeste-2.png";
import banner3 from "/banners/bannerTeste-3.png";

// Banners para MOBILE (TROQUE OS NOMES/CAMINHOS)
import bannerMobile1 from "/banners/banner-mobile1.png";
import bannerMobile2 from "/banners/banner-mobile2.png";
import bannerMobile3 from "/banners/banner-mobile3.png";

// LOGOS
import logo1 from "/logo-marcas/caseIH.png";
import logo2 from "/logo-marcas/fendt.png";
import logo3 from "/logo-marcas/jacto.png";
import logo4 from "/logo-marcas/john-deere.png";
import logo5 from "/logo-marcas/jumil.png";
import logo6 from "/logo-marcas/khun.png";
import logo7 from "/logo-marcas/Massey_Fergusson.png";
import logo8 from "/logo-marcas/new-holland-logo.png";
import logo9 from "/logo-marcas/stara.png";
import logo10 from "/logo-marcas/valtra.png";


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
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Banner de destaque"
    >
      <div className="hero-viewport">
        {validImages.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt || `Banner ${i + 1}`}
            className={`hero-slide ${i === index ? "is-active" : ""}`}
            draggable={false}
          />
        ))}
      </div>

      <button
        className="hero-nav hero-nav-left"
        aria-label="Slide anterior"
        onClick={prev}
        type="button"
      >
        ‹
      </button>
      <button
        className="hero-nav hero-nav-right"
        aria-label="Próximo slide"
        onClick={next}
        type="button"
      >
        ›
      </button>

      <div className="hero-dots">
        {validImages.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para o slide ${i + 1}`}
            className={`hero-dot ${i === index ? "active" : ""}`}
            onClick={() => goTo(i)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

// ICON BUSCA
const SearchIcon = () => (
  <svg className="filter-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Ícone da Seta 
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

// Ícone de Limpar 
const ClearIcon = () => (
  <svg className="filter-clear-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function CustomSelect({ options, value, onChange, placeholder, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const hasValue = !!value;
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = hasValue && selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="filter-select-wrapper" ref={wrapperRef}>
      <div className="filter-input-wrapper">
        <button
          type="button"
          className={`filter-select-trigger ${!hasValue ? 'placeholder' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {displayText}
        </button>

        {hasValue ? (
          <button type="button" className="filter-clear-btn" onClick={onClear}>
            <ClearIcon />
          </button>
        ) : (
          <span className="filter-field-arrow">
            <ChevronDownIcon />
          </span>
        )}
      </div>

      {isOpen && (
        <div className="filter-dropdown-list">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="filter-dropdown-option"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {

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

  // LOGOS
  const logos = [
    { src: logo1, alt: "Logo CaseIH" },
    { src: logo2, alt: "Logo Fendt" },
    { src: logo3, alt: "Logo Jacto" },
    { src: logo4, alt: "Logo John-Deere" },
    { src: logo5, alt: "Logo Jumil" },
    { src: logo6, alt: "Logo Khun" },
    { src: logo7, alt: "Logo Massey-Fergusson" },
    { src: logo8, alt: "Logo New-Holland" },
    { src: logo9, alt: "Logo Stara" },
    { src: logo10, alt: "Logo Valtra" },
  ];

  // FILTRAGEM
  const [maquinaValue, setMaquinaValue] = useState('');
  const [marcaValue, setMarcaValue] = useState('');
  const [modelosValue, setModelosValue] = useState('');

  const isModelosDisabled = !maquinaValue && !marcaValue;

  const maquinaOptions = [
    { value: "Trator", label: "Trator" },
    { value: "Colheitadeira", label: "Colheitadeira" },
    { value: "Pulverizador", label: "Pulverizador" },
  ];

  const marcaOptions = [
    { value: "Marca A", label: "Marca A" },
    { value: "Marca B", label: "Marca B" },
    { value: "Marca C", label: "Marca C" },
  ];

  return (
    <>
      <Header />
      <section >
        <div className="filtragem">
          <div className="filter-bar-container">

            {/* ===== CAMPO 1: MÁQUINA (SELECT) ===== */}
            <div className={`filter-field ${maquinaValue ? 'has-value' : ''}`}>
              <label htmlFor="maquina">MÁQUINA</label>
              <CustomSelect
                options={maquinaOptions}
                value={maquinaValue}
                onChange={(value) => setMaquinaValue(value)}
                onClear={(e) => { e.stopPropagation(); setMaquinaValue(''); }}
                placeholder="Encontre a máquina"
              />
            </div>

            <div className="filter-separator"></div>

            {/* ===== CAMPO 2: MARCA (SELECT) ===== */}
            <div className={`filter-field ${marcaValue ? 'has-value' : ''}`}>
              <label htmlFor="marca">MARCA</label>
              <CustomSelect
                options={marcaOptions}
                value={marcaValue}
                onChange={(value) => setMarcaValue(value)}
                onClear={(e) => { e.stopPropagation(); setMarcaValue(''); }}
                placeholder="Encontre a marca"
              />
            </div>

            <div className="filter-separator"></div>

            {/* ===== CAMPO 3: MODELOS (INPUT TEXT) ===== */}
            <div className={`filter-field ${isModelosDisabled ? 'is-disabled' : ''} ${modelosValue ? 'has-value' : ''}`}>
              <label htmlFor="modelos">MODELOS</label>
              <div className="filter-input-wrapper">
                <input
                  type="text"
                  id="modelos"
                  name="modelos"
                  placeholder="Encontre o modelo"
                  disabled={isModelosDisabled}
                  value={modelosValue}
                  onChange={(e) => setModelosValue(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="filter-search-btn">
              <SearchIcon />
            </button>
          </div>
        </div>

      </section>

      <section className={`home-hero-wrapper ${isCategoriaAberta ? 'categorias-abertas' : ''}`}>
        {/* CARROSSEL DESKTOP */}
        <div className="carousel-desktop">
          <Carousel images={bannersDesktop} interval={6000} autoPlay={true} />
        </div>

        {/* CARROSSEL MOBILE */}
        <div className="carousel-mobile">
          <Carousel images={bannersMobile} interval={6000} autoPlay={true} />
        </div>

        {/* CONTEÚDO DAS CATEGORIAS */}
        <div className="category-content" id="category-content-id">
          <p>Aqui vão os links das categorias...</p>
          <p>Tratores</p>
          <p>Colheitadeiras</p>
          <p>Pulverizadores</p>
        </div>

        {/* BARRA VERDE */}
        <div
          className="category-bar"
          onClick={() => setCategoriaAberta(!isCategoriaAberta)}
          role="button"
          aria-expanded={isCategoriaAberta}
          aria-controls="category-content-id"
        >
          <h2>ESCOLHA A SUA CATEGORIA</h2>
          <span className="category-arrow">
            {isCategoriaAberta ? '' : ''}
          </span>
        </div>
      </section>

      <section className="logo-carousel-section">
        <h2>MARCAS QUE TRABALHAMOS</h2>

        <div className="logo-scroller" data-speed="slow">
          <div className="logo-scroller-inner">
            {/* Renderiza a lista de logos a primeira vez */}
            {logos.map((logo, index) => (
              <img key={`set1-${index}`} src={logo.src} alt={logo.alt} />
            ))}

            {/* Renderiza a lista 2ª vez */}
            {logos.map((logo, index) => (
              <img key={`set2-${index}`} src={logo.src} alt={logo.alt} />
            ))}

            {/* Renderiza a lista 3ª vez */}
            {logos.map((logo, index) => (
              <img key={`set3-${index}`} src={logo.src} alt={logo.alt} />
            ))}

            {/* Renderiza a lista 4ª vez */}
            {logos.map((logo, index) => (
              <img key={`set4-${index}`} src={logo.src} alt={logo.alt} />
            ))}
          </div>
        </div>
      </section>

      <section className="anuncios">
        <div className="anuncios-header">
          <h2>Nossos Produtos</h2>
          <a href="/pesquisar" className="ver-todos-link">
            <h4>Ver Todos</h4>
          </a>
        </div>
      </section>

      <section className="context-section">
        <div className="context-container">
          <div className="context-grid">
            <div className="context-item">
              <img src={img_um} alt="Trator no campo" className="context-image" />
              <div className="context-overlay">
                <h2 className='titulo'><strong>Revendedor</strong></h2>
                <p>Anuncie agora em nossa plataforma e alcance compradores qualificados de todo o Brasil. Dê ao seu equipamento a visibilidade que ele merece e venha vender conosco!</p>
                <a href="#"><button className="context-btn">Anuncie Agora</button></a>
              </div>
            </div>
            <div className="context-item">
              <img src={img_dois} alt="Agricultor trabalhando" className="context-image" />
              <div className="context-overlay">
                <h2 className='titulo'><strong>Contato</strong></h2>
                <p>Tem alguma dúvida ou precisa de suporte especializado em agronegócio? Entre em contato com a TratorBR, que nós vamos te ajudar a fechar o melhor negócio!</p>
                <a href="#"><button className="context-btn">Whatsapp</button></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="depoimentos">
        <div className="depoimentos-header">
          <h2>DEPOIMENTOS</h2>
        </div>

        <div className="depoimentos-card-wrapper">
          <div className="depoimentos-card">
            <div className="depoimentos-text">
              <h3>
                O que falam da <span>TratorBR?</span>
              </h3>
              <p>
                Compartilhe com a gente a sua experiência, deixe um comentário no
                formulário ao lado.
              </p>
            </div>

            <div className="depoimentos-button-wrapper">
              <button type="button" className="depoimentos-btn">
                Avalie agora
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="download-section-dois">
        <img src={iph03} alt="teste" className='ipho03' />
        <div className='download-container-dois'>
          <h2 className="title">Escaneie ou clique para baixar</h2>
          <div className="cards">
            <a href="https://play.google.com/store/apps/details?id=br.com.tratorbr.TratorBR&pcampaignid=web_share" target="_blank" rel="external" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <img src={qrcode} alt="play store" className="qr-code" />
                <div>
                  <h3>Baixe o app na Play Store</h3>
                  <p>Escaneie para baixar</p>
                </div>
                <span className="arrow-s">→</span>
              </div>
            </a>
            <a href="https://apps.apple.com/br/app/tratorbr/id6748466764" target="_blank" rel="external" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card">
                <img src={qrcodeapple} alt="QR Code Parceiro" className="qr-code" />
                <div>
                  <h3>Baixe o app na Apple Store</h3>
                  <p>Escaneie para baixar</p>
                </div>
                <span className="arrow-s">→</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <CalendlyFlutuante />
      <VoltarAoTopoBtn />
      <Footer />
    </>
  );
}