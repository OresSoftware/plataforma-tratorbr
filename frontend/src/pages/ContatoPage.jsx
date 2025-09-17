import React from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import './ContatoPage.css';
import { useMemo, useState } from "react";
import { apiContatos } from "../services/apiContatos";
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope,} from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUM = import.meta.env.VITE_WHATSAPP_NUM || "5543999999999"; // e.g. 5543999999999
const EMAIL_PUBLICO = import.meta.env.VITE_CONTATO_EMAIL || "contato@tratorbr.com.br";

export default function ContatoPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
    // honeypot anti-spam (campo invisível)
    empresa: "",
  });
  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  const whatsMsg = useMemo(() => {
    const texto = `Olá, gostaria de falar com a equipe da TratorBR.`;
    return encodeURIComponent(texto);
  }, [form.nome, form.email, form.telefone]);

  function maskTelefone(v) {
    // mantém só dígitos
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      // (11) 0000-0000
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    // (11) 00000-0000
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  function validate() {
    const e = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email inválido.";
    const foneOk = form.telefone.replace(/\D/g, "").length >= 10;
    if (!foneOk) e.telefone = "Telefone inválido.";
    if (form.mensagem.trim().length < 5) e.mensagem = "Descreva sua mensagem.";
    // se o honeypot vier preenchido, trataremos como spam no backend
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setOkMsg("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setEnviando(true);
    try {
      // por enquanto só simulamos; no próximo passo ligamos no backend:
      await apiContatos.criar(form)
      await new Promise((r) => setTimeout(r, 700));
      setOkMsg("Mensagem enviada! Em breve nosso time entrará em contato.");
      setForm({ nome: "", email: "", telefone: "", mensagem: "", empresa: "" });
    } catch (err) {
      setOkMsg("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="contato-wrapper">
      <Header />
      <section className="contato-hero">
        <h1>EM QUE PODEMOS TE AJUDAR?</h1>
        <div className='divsoria'></div>
        <p>Encaminhe dúvidas, solicite um orçamento e saiba quais as melhores soluções em máquinas e tecnologias agrícolas disponíveis para você. Temos um time especializado para te atender.</p>
        <div className="contato-card-1">
          <h2 className='conth2'>Fale com a TratorBR!</h2>
          <div className='divsoria-dois'></div>
          <form onSubmit={onSubmit} noValidate>
            {/* honeypot */}
            <input
              type="text"
              name="empresa"
              autoComplete="off"
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              className="hp"
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="form-grid">
              {/* Nome - linha completa */}
              <div className="field field--full">
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  aria-invalid={!!errors.nome}
                  className="form-input"
                />
                {errors.nome && <small className="err">{errors.nome}</small>}
              </div>

              {/* Email e Telefone - lado a lado */}
              <div className="field">
                <input
                  type="email"
                  placeholder="Seu Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={!!errors.email}
                  className="form-input"
                />
                {errors.email && <small className="err">{errors.email}</small>}
              </div>

              <div className="field">
                <input
                  inputMode="tel"
                  placeholder="Seu Número de Contato"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: maskTelefone(e.target.value) })}
                  aria-invalid={!!errors.telefone}
                  className="form-input"
                />
                {errors.telefone && <small className="err">{errors.telefone}</small>}
              </div>

              {/* Mensagem - linha completa */}
              <div className="field field--full">
                <textarea
                  rows={5}
                  placeholder="Mensagem"
                  value={form.mensagem}
                  onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                  aria-invalid={!!errors.mensagem}
                  className="form-textarea"
                />
                {errors.mensagem && <small className="err">{errors.mensagem}</small>}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-enviar" type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>

            {okMsg && <p className="okmsg">{okMsg}</p>}
          </form>
        </div>
      </section>

      <section className="contato-onde">
        <h2>ONDE ESTAMOS</h2>
        <div className='divsoria'></div>

        <div className="onde-container">
          <div className="onde-info">
            <h3>Contato</h3>
            <p className="onde-subtitle">
              Está com dúvidas, sugestões ou quer saber mais sobre a TratorBR?<br />
              Nosso time de especialistas está pronto para te atender.
            </p>

            <div className="contato-details">
              <div className="contato-item">
                <FaPhoneAlt className="nav-icon" size={22} color="#15383E"/>
                <span>(43) XXXXX-XXXX</span>
              </div>
              
              <div className="contato-item">
                <FaMapMarkerAlt className="nav-icon" size={22} color="#15383E"/>
                <span>Rua Drongo, 1540 - Sala 1002, Centro, Arapongas, PR, 86.700-145</span>
              </div>
              
              <div className="contato-item">
                <FaEnvelope className="nav-icon" size={22} color="#15383E" />
                <span>{EMAIL_PUBLICO}</span>
              </div>
            </div>

            <a
              className="btn-whats"
              href={`https://wa.me/${WHATSAPP_NUM}?text=${whatsMsg}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp className="nav-icon" size={22} />
              Chamar no WhatsApp
            </a>
          </div>

          <div className="onde-mapa">
            <iframe
              title="Mapa TratorBR"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                "Rua Drongo, 1540 - Sala 1002, Centro, Arapongas - PR"
              )}&output=embed`}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
