// backend/src/services/pdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { format, parseISO } = require('date-fns');
const { ptBR } = require('date-fns/locale');

// Configuração do gerador de gráficos
const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width: 600, 
  height: 400,
  backgroundColour: 'white'
});

/**
 * Formata data para exibição em português
 */
function formatarData(dataISO) {
  try {
    return format(parseISO(dataISO), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dataISO;
  }
}

/**
 * Gera gráfico de pizza como imagem
 */
async function gerarGraficoPizza(dados) {
  const configuration = {
    type: 'pie',
    data: {
      labels: dados.map(d => d.name),
      datasets: [{
        data: dados.map(d => d.value),
        backgroundColor: [
          '#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA',
          '#93C5FD', '#0EA5E9', '#0284C7', '#7DD3FC', '#38BDF8'
        ],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: { font: { size: 12 } },
        },
        title: {
          display: true,
          text: 'Usuários por Empresa',
          font: { size: 16, weight: 'bold' },
        },
      },
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/**
 * Gera gráfico de linha como imagem
 */
async function gerarGraficoLinha(dados) {
  const configuration = {
    type: 'line',
    data: {
      labels: dados.map(d => format(parseISO(d.date), 'dd/MM')),
      datasets: [{
        label: 'Cadastros',
        data: dados.map(d => d.valor),
        borderColor: '#409535',
        backgroundColor: 'rgba(64, 149, 53, 0.1)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Evolução de Cadastros no Período',
          font: { size: 16, weight: 'bold' },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/**
 * Gera gráfico de barras como imagem
 */
async function gerarGraficoBarras(dadosGerais) {
  const configuration = {
    type: 'bar',
    data: {
      labels: ['Matriz', 'Filial'],
      datasets: [{
        label: 'Total',
        data: [dadosGerais.empresas.matriz, dadosGerais.empresas.filial],
        backgroundColor: ['#2563EB', '#60A5FA'],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Empresas: Matriz vs Filial',
          font: { size: 16, weight: 'bold' },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/**
 * Adiciona cabeçalho em todas as páginas
 */
function adicionarCabecalho(doc, tipo, periodo) {
  doc.fontSize(10)
     .fillColor('#666')
     .text(`Relatório ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`, 50, 30, { align: 'left' })
     .text(`Período: ${formatarData(periodo.inicio)} - ${formatarData(periodo.fim)}`, 50, 30, { align: 'right' });
}

/**
 * Adiciona rodapé em todas as páginas
 */
function adicionarRodape(doc, numeroPagina) {
  doc.fontSize(8)
     .fillColor('#999')
     .text(`Página ${numeroPagina}`, 50, doc.page.height - 50, { align: 'center' })
     .text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 50, doc.page.height - 35, { align: 'center' });
}

/**
 * Função principal: Gera o PDF completo
 */
async function gerarPDFRelatorio(dados, caminhoArquivo) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 60, bottom: 60, left: 50, right: 50 },
        bufferPages: true,
      });

      const stream = fs.createWriteStream(caminhoArquivo);
      doc.pipe(stream);

      let paginaAtual = 1;

      // ==================== PÁGINA 1: CAPA ====================
      doc.fontSize(32)
         .fillColor('#1E3A8A')
         .text('Relatório Geral', { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(18)
         .fillColor('#333')
         .text('Sistema de Gestão', { align: 'center' })
         .moveDown(2);

      doc.fontSize(14)
         .fillColor('#666')
         .text(`Tipo: ${dados.tipo.charAt(0).toUpperCase() + dados.tipo.slice(1)}`, { align: 'center' })
         .moveDown(0.5)
         .text(`Período: ${formatarData(dados.periodo.inicio)} - ${formatarData(dados.periodo.fim)}`, { align: 'center' })
         .moveDown(0.5)
         .text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, { align: 'center' });

      adicionarRodape(doc, paginaAtual++);

      // ==================== PÁGINA 2: MÉTRICAS ====================
      doc.addPage();
      adicionarCabecalho(doc, dados.tipo, dados.periodo);

      doc.fontSize(20)
         .fillColor('#1E3A8A')
         .text('Métricas Principais', 50, 80)
         .moveDown(1);

      const y = 130;
      const colWidth = 160;

      // Card Empresas
      doc.rect(50, y, colWidth, 120).fillAndStroke('#f8f9fa', '#dee2e6');
      doc.fillColor('#333').fontSize(12).text('EMPRESAS', 60, y + 10);
      doc.fontSize(28).fillColor('#1E3A8A').text(dados.dadosGerais.empresas.total, 60, y + 35);
      doc.fontSize(10).fillColor('#666')
         .text(`Ativas: ${dados.dadosGerais.empresas.ativas}`, 60, y + 70)
         .text(`Inativas: ${dados.dadosGerais.empresas.inativas}`, 60, y + 85)
         .text(`Novas: ${dados.dadosPeriodo.novasEmpresas} (${dados.comparacoes.empresas > 0 ? '+' : ''}${dados.comparacoes.empresas}%)`, 60, y + 100);

      // Card Usuários
      doc.rect(50 + colWidth + 10, y, colWidth, 120).fillAndStroke('#f8f9fa', '#dee2e6');
      doc.fillColor('#333').fontSize(12).text('USUÁRIOS', 60 + colWidth + 10, y + 10);
      doc.fontSize(28).fillColor('#2563EB').text(dados.dadosGerais.usuarios.total, 60 + colWidth + 10, y + 35);
      doc.fontSize(10).fillColor('#666')
         .text(`Ativos: ${dados.dadosGerais.usuarios.ativos}`, 60 + colWidth + 10, y + 70)
         .text(`Inativos: ${dados.dadosGerais.usuarios.inativos}`, 60 + colWidth + 10, y + 85)
         .text(`Novos: ${dados.dadosPeriodo.novosUsuarios} (${dados.comparacoes.usuarios > 0 ? '+' : ''}${dados.comparacoes.usuarios}%)`, 60 + colWidth + 10, y + 100);

      // Card Contatos
      doc.rect(50 + (colWidth + 10) * 2, y, colWidth, 120).fillAndStroke('#f8f9fa', '#dee2e6');
      doc.fillColor('#333').fontSize(12).text('CONTATOS', 60 + (colWidth + 10) * 2, y + 10);
      doc.fontSize(28).fillColor('#409535').text(dados.dadosGerais.contatos.total, 60 + (colWidth + 10) * 2, y + 35);
      doc.fontSize(10).fillColor('#666')
         .text(`Pendentes: ${dados.dadosGerais.contatos.pendentes}`, 60 + (colWidth + 10) * 2, y + 70)
         .text(`Respondidos: ${dados.dadosGerais.contatos.respondidos}`, 60 + (colWidth + 10) * 2, y + 85)
         .text(`Taxa: ${dados.dadosGerais.contatos.taxaResposta}%`, 60 + (colWidth + 10) * 2, y + 100);

      adicionarRodape(doc, paginaAtual++);

      // ==================== PÁGINA 3: GRÁFICOS ====================
      doc.addPage();
      adicionarCabecalho(doc, dados.tipo, dados.periodo);

      doc.fontSize(20)
         .fillColor('#1E3A8A')
         .text('Gráficos', 50, 80)
         .moveDown(1);

      // Gráfico de Pizza
      const imagemPizza = await gerarGraficoPizza(dados.graficos.pizza);
      doc.image(imagemPizza, 50, 130, { width: 500 });

      adicionarRodape(doc, paginaAtual++);

      // ==================== PÁGINA 4: GRÁFICO DE LINHA ====================
      doc.addPage();
      adicionarCabecalho(doc, dados.tipo, dados.periodo);

      const imagemLinha = await gerarGraficoLinha(dados.graficos.linha);
      doc.image(imagemLinha, 50, 100, { width: 500 });

      adicionarRodape(doc, paginaAtual++);

      // ==================== PÁGINA 5: GRÁFICO DE BARRAS ====================
      doc.addPage();
      adicionarCabecalho(doc, dados.tipo, dados.periodo);

      const imagemBarras = await gerarGraficoBarras(dados.dadosGerais);
      doc.image(imagemBarras, 50, 100, { width: 500 });

      adicionarRodape(doc, paginaAtual++);

      // ==================== PÁGINA 6: RANKINGS ====================
      doc.addPage();
      adicionarCabecalho(doc, dados.tipo, dados.periodo);

      doc.fontSize(20)
         .fillColor('#1E3A8A')
         .text('Rankings', 50, 80)
         .moveDown(1);

      let yPos = 130;

      // Top 5 Empresas
      doc.fontSize(14).fillColor('#333').text('Top 5 Empresas (por usuários)', 50, yPos);
      yPos += 25;
      dados.rankings.empresas.forEach((emp, i) => {
        doc.fontSize(10).fillColor('#666').text(`${i + 1}. ${emp.nome_fantasia} - ${emp.total_usuarios} usuários`, 60, yPos);
        yPos += 18;
      });

      yPos += 20;

      // Top 5 Cidades
      doc.fontSize(14).fillColor('#333').text('Top 5 Cidades', 50, yPos);
      yPos += 25;
      dados.rankings.cidades.forEach((cid, i) => {
        doc.fontSize(10).fillColor('#666').text(`${i + 1}. ${cid.cidade} - ${cid.total_empresas} empresas`, 60, yPos);
        yPos += 18;
      });

      yPos += 20;

      // Top 5 Estados
      // doc.fontSize(14).fillColor('#333').text('Top 5 Estados', 50, yPos);
      // yPos += 25;
      // dados.rankings.estados.forEach((est, i) => {
      //   doc.fontSize(10).fillColor('#666').text(`${i + 1}. ${est.uf} - ${est.total_empresas} empresas`, 60, yPos);
      //   yPos += 18;
      // });

      adicionarRodape(doc, paginaAtual++);

      // ==================== PÁGINA 7: INDICADORES ====================
      doc.addPage();
      adicionarCabecalho(doc, dados.tipo, dados.periodo);

      doc.fontSize(20)
         .fillColor('#1E3A8A')
         .text('Indicadores de Crescimento', 50, 80)
         .moveDown(2);

      yPos = 150;

      doc.fontSize(12).fillColor('#333').text('Comparação com Período Anterior:', 50, yPos);
      yPos += 30;

      doc.fontSize(11).fillColor('#666')
         .text(`• Crescimento de Empresas: ${dados.comparacoes.empresas > 0 ? '+' : ''}${dados.comparacoes.empresas}%`, 60, yPos);
      yPos += 25;

      doc.text(`• Crescimento de Usuários: ${dados.comparacoes.usuarios > 0 ? '+' : ''}${dados.comparacoes.usuarios}%`, 60, yPos);
      yPos += 25;

      doc.text(`• Crescimento de Contatos: ${dados.comparacoes.contatos > 0 ? '+' : ''}${dados.comparacoes.contatos}%`, 60, yPos);
      yPos += 40;

      const taxaAtivacao = ((dados.dadosGerais.empresas.ativas / dados.dadosGerais.empresas.total) * 100).toFixed(1);
      const taxaEngajamento = ((dados.dadosGerais.usuarios.ativos / dados.dadosGerais.usuarios.total) * 100).toFixed(1);

      doc.fontSize(12).fillColor('#333').text('Taxas:', 50, yPos);
      yPos += 30;

      doc.fontSize(11).fillColor('#666')
         .text(`• Taxa de Ativação de Empresas: ${taxaAtivacao}%`, 60, yPos);
      yPos += 25;

      doc.text(`• Taxa de Engajamento de Usuários: ${taxaEngajamento}%`, 60, yPos);

      adicionarRodape(doc, paginaAtual++);

      // Finalizar
      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { gerarPDFRelatorio };
