// frontend/src/admin-gestao/components/RelatorioCard.jsx
import React, { useState, useEffect } from 'react';
import { apiRelatorios } from '../../services/apiRelatorios';
import { FileText, Download, Trash2, Loader } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function RelatorioCard() {
  const [tipoSelecionado, setTipoSelecionado] = useState('mensal');
  const [gerando, setGerando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Carregar histórico ao montar o componente
  useEffect(() => {
    carregarHistorico();
  }, []);

  /**
   * Carrega o histórico de relatórios
   */
  const carregarHistorico = async () => {
    try {
      setCarregandoHistorico(true);
      const response = await apiRelatorios.listarHistorico();
      setHistorico(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      mostrarMensagem('error', 'Erro ao carregar histórico de relatórios');
    } finally {
      setCarregandoHistorico(false);
    }
  };

  /**
   * Gera um novo relatório
   */
  const handleGerarRelatorio = async () => {
    try {
      setGerando(true);
      setMensagem({ tipo: '', texto: '' });

      const response = await apiRelatorios.gerar(tipoSelecionado);

      if (response.success) {
        mostrarMensagem('success', 'Relatório gerado com sucesso!');
        
        // Atualizar histórico
        await carregarHistorico();

        // Baixar automaticamente
        await handleBaixar(response.relatorio.id);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      mostrarMensagem('error', error.response?.data?.error || 'Erro ao gerar relatório');
    } finally {
      setGerando(false);
    }
  };

  /**
   * Baixa um relatório
   */
  const handleBaixar = async (id) => {
    try {
      const response = await apiRelatorios.baixar(id);
      
      // Criar URL temporária para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair nome do arquivo do header ou usar padrão
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `relatorio-${id}.pdf`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      mostrarMensagem('success', 'Download iniciado!');
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      mostrarMensagem('error', 'Erro ao baixar relatório');
    }
  };

  /**
   * Exclui um relatório
   */
  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      await apiRelatorios.excluir(id);
      mostrarMensagem('success', 'Relatório excluído com sucesso!');
      await carregarHistorico();
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      mostrarMensagem('error', 'Erro ao excluir relatório');
    }
  };

  /**
   * Mostra mensagem temporária
   */
  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 5000);
  };

  /**
   * Formata o nome do período para exibição
   */
  const formatarPeriodo = (relatorio) => {
    try {
      const inicio = format(parseISO(relatorio.periodo_inicio), 'dd/MM/yyyy');
      const fim = format(parseISO(relatorio.periodo_fim), 'dd/MM/yyyy');
      
      const tipoLabel = {
        anual: 'Anual',
        mensal: 'Mensal',
        semanal: 'Semanal',
      }[relatorio.tipo] || relatorio.tipo;

      return `${tipoLabel} - ${inicio} a ${fim}`;
    } catch {
      return `${relatorio.tipo} - ${relatorio.periodo_inicio} a ${relatorio.periodo_fim}`;
    }
  };

  /**
   * Formata o tamanho do arquivo
   */
  const formatarTamanho = (bytes) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  /**
   * Formata a data de criação
   */
  const formatarDataCriacao = (dataISO) => {
    try {
      return format(parseISO(dataISO), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dataISO;
    }
  };

  return (
    <div className="relatorio-container">
      {/* Card de Geração */}
      <div className="relatorio-card">
        <div className="relatorio-header">
          <FileText size={24} />
          <h3>Gerar relatório</h3>
        </div>

        <div className="relatorio-content">
          <div className="relatorio-opcoes">
            <label className="radio-option">
              <input
                type="radio"
                name="tipo"
                value="anual"
                checked={tipoSelecionado === 'anual'}
                onChange={(e) => setTipoSelecionado(e.target.value)}
                disabled={gerando}
              />
              <span>Anual</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="tipo"
                value="mensal"
                checked={tipoSelecionado === 'mensal'}
                onChange={(e) => setTipoSelecionado(e.target.value)}
                disabled={gerando}
              />
              <span>Mensal</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="tipo"
                value="semanal"
                checked={tipoSelecionado === 'semanal'}
                onChange={(e) => setTipoSelecionado(e.target.value)}
                disabled={gerando}
              />
              <span>Semanal</span>
            </label>
          </div>

          <button
            className="btn-gerar-pdf"
            onClick={handleGerarRelatorio}
            disabled={gerando}
          >
            {gerando ? (
              <>
                <Loader size={18} className="spinner" />
                Gerando...
              </>
            ) : (
              'Gerar o PDF'
            )}
          </button>
        </div>

        {/* Mensagem de feedback */}
        {mensagem.texto && (
          <div className={`relatorio-mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="relatorio-historico">
        <h4>
          <FileText size={18} />
          Histórico de Relatórios
        </h4>

        {carregandoHistorico ? (
          <div className="historico-loading">
            <Loader size={24} className="spinner" />
            <p>Carregando histórico...</p>
          </div>
        ) : historico.length === 0 ? (
          <p className="historico-vazio">Nenhum relatório gerado ainda.</p>
        ) : (
          <div className="historico-lista">
            {historico.map((relatorio) => (
              <div key={relatorio.id} className="historico-item">
                <div className="historico-info">
                  <FileText size={16} />
                  <div className="historico-detalhes">
                    <strong>{formatarPeriodo(relatorio)}</strong>
                    <span className="historico-meta">
                      {formatarDataCriacao(relatorio.created_at)} • {formatarTamanho(relatorio.tamanho_bytes)}
                    </span>
                  </div>
                </div>

                <div className="historico-acoes">
                  <button
                    className="btn-icon btn-download"
                    onClick={() => handleBaixar(relatorio.id)}
                    title="Baixar PDF"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="btn-icon btn-excluir"
                    onClick={() => handleExcluir(relatorio.id)}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelatorioCard;
