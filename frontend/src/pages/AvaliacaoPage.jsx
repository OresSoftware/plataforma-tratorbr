import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/footer";
import VoltarAoTopoBtn from "../components/VoltarAoTopoBtn";
import { apiAvaliacoes } from "../services/apiAvaliacoes";
import useNoindex from "../hooks/useNoindex";
import "./style/AvaliacaoPage.css";

const AvaliacaoPage = () => {
  useNoindex();

  const [formData, setFormData] = useState({
    nome: "",
    mensagem: "",
    estrelas: 0,
  });

  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    media: 0,
    distribuicao: {},
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const data = await apiAvaliacoes.obterEstatisticas();
      if (data?.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleStarClick = (star) => {
    setFormData((prev) => ({
      ...prev,
      estrelas: star,
    }));
    if (errors.estrelas) {
      setErrors((prev) => ({
        ...prev,
        estrelas: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Por favor, digite seu nome.";
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = "O nome deve ter no mínimo 3 caracteres.";
    } else if (formData.nome.trim().length > 255) {
      newErrors.nome = "Nome não pode exceder 255 caracteres";
    }

    if (!formData.mensagem.trim()) {
      newErrors.mensagem = "Por favor, escreva sua mensagem.";
    } else if (formData.mensagem.trim().length < 10) {
      newErrors.mensagem = "A mensagem deve ser um pouco mais detalhada (mínimo 10 letras).";
    } else if (formData.mensagem.trim().length > 500) {
      newErrors.mensagem = "Mensagem não pode exceder 500 caracteres.";
    }

    const estrelas = parseInt(formData.estrelas, 10);
    if (!estrelas || estrelas === 0) {
      newErrors.estrelas = "É obrigatório selecionar uma nota (estrelas).";
    } else if (estrelas < 1 || estrelas > 5) {
      newErrors.estrelas = "A nota deve ser entre 1 e 5.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOkMsg("");
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setEnviando(true);
    try {
      const response = await apiAvaliacoes.criar({
        nome: formData.nome.trim(),
        mensagem: formData.mensagem.trim(),
        estrelas: parseInt(formData.estrelas, 10),
      });

      if (response?.ok) {
        setOkMsg("Avaliação enviada com sucesso! Obrigado pelo seu feedback.");
        setFormData({
          nome: "",
          mensagem: "",
          estrelas: 0,
        });

        await carregarEstatisticas();
        setTimeout(() => setOkMsg(""), 5000);
      } else {
        setOkMsg("Erro ao enviar avaliação. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      setOkMsg(
        err?.response?.data?.erro ||
        "Não foi possível enviar a avaliação agora. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const renderStars = (count = 5) => {
    return Array.from({ length: count }, (_, i) => (
      <button key={i} type="button" className={`star ${i < formData.estrelas ? "filled" : "empty"}`} onClick={() => handleStarClick(i + 1)} aria-label={`${i + 1} estrela${i !== 0 ? "s" : ""}`} title={`${i + 1} estrela${i !== 0 ? "s" : ""}`}>
        ★
      </button>
    ));
  };

  const renderStatsStars = (count = 5) => {
    return Array.from({ length: count }, (_, i) => (
      <span key={i} className={`stat-star ${i < count ? "filled" : "empty"}`}>
        ★
      </span>
    ));
  };

  return (
    <main className="avaliacao-wrapper">
      <Header />

      <section className="avaliacao-hero">
        <div className="avaliacao-hero-content">
          <h1>AVALIE AGORA</h1>
          <div className="hero-divider"></div>
        </div>
      </section>

      <section className="avaliacao-main">
        <div className="avaliacao-container">
          <div className="avaliacao-left">
            <h2>Nos conte como foi sua experiência aqui?</h2>
            <p>
              Sua experiência é valiosa! Ao deixar uma avaliação, você não só
              nos ajuda a melhorar, mas também orienta outros clientes que estão
              considerando nossos serviços e produtos. Conte-nos como foi!
            </p>
          </div>

          <div className="avaliacao-right">
            <div className="form-card">
              {okMsg && (
                <div className={`message ${okMsg.includes("sucesso") ? "success" : "error"}`}>
                  {okMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <input type="text" name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} aria-invalid={!!errors.nome} className={`form-input ${errors.nome ? "error" : ""}`} />
                  {errors.nome && (
                    <small className="error-text">{errors.nome}</small>
                  )}
                </div>

                <div className="form-group">
                  <textarea name="mensagem" placeholder="Mensagem" value={formData.mensagem} onChange={handleChange} aria-invalid={!!errors.mensagem} className={`form-textarea ${errors.mensagem ? "error" : ""}`} rows="5" maxLength={500} />

                  <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#666", marginTop: "4px" }}>
                    {formData.mensagem.length}/500
                  </div>

                  {errors.mensagem && (
                    <small className="error-text">{errors.mensagem}</small>
                  )}
                </div>

                <div className="form-group rating-group">
                  <div className="rating-container">{renderStars()}</div>

                  {errors.estrelas && (
                    <small className="error-text" style={{ color: "red", display: "block", marginTop: "5px", textAlign: "center" }}>
                      {errors.estrelas}
                    </small>
                  )}

                  <h3 className="rating-label">*deixe suas estrelas aqui</h3>
                </div>

                <button type="submit" className="submit-btn" disabled={enviando}>
                  {enviando ? "Enviando..." : "Enviar Avaliação"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <VoltarAoTopoBtn />
      <Footer />
    </main>
  );
};

export default AvaliacaoPage;