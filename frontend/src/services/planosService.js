export const PLANOS_CONFIG = {
  basico: {
    id: 'basico',
    titulo: 'Básico',
    preco: '29,90',
    precoNumerico: 29.90,
    duracao: '1 mês',
    duracaoMeses: 1,
    popular: false,
    cor: '#15383E',
    caracteristicas: [
      'Acesso básico ao marketplace',
      'Visualização de anúncios',
      'Contato direto com vendedores',
      'Suporte por email'
    ],
    descricaoWhatsApp: 'Plano Básico - Ideal para começar no marketplace'
  },
  premium: {
    id: 'premium',
    titulo: 'Premium',
    preco: '79,90',
    precoNumerico: 79.90,
    duracao: '3 meses',
    duracaoMeses: 3,
    popular: true,
    cor: '#22c55e',
    caracteristicas: [
      'Acesso completo ao marketplace',
      'Anúncios ilimitados',
      'Destaque nos resultados',
      'Análise de mercado',
      'Suporte prioritário',
      'Relatórios detalhados'
    ],
    descricaoWhatsApp: 'Plano Premium - Mais popular! Recursos completos'
  },
  profissional: {
    id: 'profissional',
    titulo: 'Profissional',
    preco: '149,90',
    precoNumerico: 149.90,
    duracao: '6 meses',
    duracaoMeses: 6,
    popular: false,
    cor: '#15383E',
    caracteristicas: [
      'Todos os recursos Premium',
      'API de integração',
      'Gerenciamento de equipe',
      'Consultoria especializada',
      'Suporte 24/7',
      'Relatórios personalizados'
    ],
    descricaoWhatsApp: 'Plano Profissional - Para empresas que precisam do máximo'
  }
};

export const WHATSAPP_CONFIG = {
  numero: '5543999999999', // Número do WhatsApp (incluir código do país)
  mensagemBase: 'Olá! Gostaria de assinar um plano do TratorBR.',
};

/**
 * Gera URL do WhatsApp com mensagem personalizada para o plano
 * @param {Object} plano - Objeto do plano selecionado
 * @param {Object} dadosUsuario - Dados opcionais do usuário (nome, email, etc.)
 * @returns {string} URL do WhatsApp
 */
export const gerarUrlWhatsApp = (plano, dadosUsuario = {}) => {
  const { numero, mensagemBase } = WHATSAPP_CONFIG;
  
  let mensagem = `${mensagemBase}\n\n`;
  mensagem += `📋 *Detalhes do Plano:*\n`;
  mensagem += `• Plano: ${plano.titulo}\n`;
  mensagem += `• Valor: R$ ${plano.preco}\n`;
  mensagem += `• Duração: ${plano.duracao}\n`;
  mensagem += `• Descrição: ${plano.descricaoWhatsApp}\n\n`;
  
  if (dadosUsuario.nome) {
    mensagem += `👤 *Dados do Cliente:*\n`;
    mensagem += `• Nome: ${dadosUsuario.nome}\n`;
    if (dadosUsuario.email) {
      mensagem += `• Email: ${dadosUsuario.email}\n`;
    }
    if (dadosUsuario.telefone) {
      mensagem += `• Telefone: ${dadosUsuario.telefone}\n`;
    }
    mensagem += `\n`;
  }
  
  mensagem += `🚜 Poderia me ajudar com mais informações sobre como proceder com a assinatura?`;
  
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/${numero}?text=${mensagemCodificada}`;
};

/**
 * Prepara dados do plano para futuro sistema de pagamento
 * @param {string} planoId - ID do plano
 * @param {Object} dadosUsuario - Dados do usuário
 * @returns {Object} Dados estruturados para pagamento
 */
export const prepararDadosPagamento = (planoId, dadosUsuario = {}) => {
  const plano = PLANOS_CONFIG[planoId];
  
  if (!plano) {
    throw new Error(`Plano ${planoId} não encontrado`);
  }
  
  return {
    // Dados do produto/plano
    produto: {
      id: plano.id,
      nome: plano.titulo,
      descricao: plano.descricaoWhatsApp,
      preco: plano.precoNumerico,
      moeda: 'BRL',
      duracao: plano.duracaoMeses,
      tipo: 'assinatura'
    },
    
    // Dados do cliente
    cliente: {
      nome: dadosUsuario.nome || '',
      email: dadosUsuario.email || '',
      telefone: dadosUsuario.telefone || '',
      documento: dadosUsuario.cpf || dadosUsuario.cnpj || ''
    },
    
    // Metadados para tracking
    metadata: {
      origem: 'pagina_planos',
      timestamp: new Date().toISOString(),
      plano_popular: plano.popular,
      valor_total: plano.precoNumerico
    },
    
    // URLs de retorno (para futuro gateway de pagamento)
    urls: {
      sucesso: `${window.location.origin}/pagamento/sucesso`,
      erro: `${window.location.origin}/pagamento/erro`,
      cancelamento: `${window.location.origin}/planos`
    }
  };
};

/**
 * Valida dados antes de processar pagamento
 * @param {Object} dadosPagamento - Dados preparados para pagamento
 * @returns {Object} Resultado da validação
 */
export const validarDadosPagamento = (dadosPagamento) => {
  const erros = [];
  
  // Validar produto
  if (!dadosPagamento.produto.id) {
    erros.push('ID do plano é obrigatório');
  }
  
  if (!dadosPagamento.produto.preco || dadosPagamento.produto.preco <= 0) {
    erros.push('Preço do plano inválido');
  }
  
  // Validar cliente (dados mínimos)
  if (!dadosPagamento.cliente.email && !dadosPagamento.cliente.telefone) {
    erros.push('Email ou telefone é obrigatório');
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
};

/**
 * Simula processamento de pagamento (para desenvolvimento)
 * @param {Object} dadosPagamento - Dados do pagamento
 * @returns {Promise} Resultado simulado
 */
export const simularPagamento = async (dadosPagamento) => {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular sucesso/erro aleatório para testes
  const sucesso = Math.random() > 0.2; // 80% de chance de sucesso
  
  if (sucesso) {
    return {
      status: 'aprovado',
      transacaoId: `txn_${Date.now()}`,
      dadosPagamento,
      mensagem: 'Pagamento processado com sucesso!'
    };
  } else {
    throw new Error('Falha no processamento do pagamento. Tente novamente.');
  }
};

/**
 * Obtém todos os planos disponíveis
 * @returns {Array} Lista de planos
 */
export const obterPlanos = () => {
  return Object.values(PLANOS_CONFIG);
};

/**
 * Obtém plano por ID
 * @param {string} planoId - ID do plano
 * @returns {Object|null} Plano encontrado ou null
 */
export const obterPlanoPorId = (planoId) => {
  return PLANOS_CONFIG[planoId] || null;
};
