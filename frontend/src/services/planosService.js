export const PLANOS_CONFIG = {
  basico: {
    id: 'basico',
    titulo: 'Básico',
    preco: '29,90',
    precoNumerico: 29.90,
    duracao: 'mês',
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
    duracao: 'mês',
    duracaoMeses: 1,
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
    duracao: 'mês',
    duracaoMeses: 1,
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
  numero: '5543999999999', 
  mensagemBase: 'Olá! Gostaria de assinar um plano do TratorBR.',
};

/**
 * @param {Object} plano 
 * @param {Object} dadosUsuario 
 * @returns {string} 
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
 * @param {string} planoId 
 * @param {Object} dadosUsuario 
 * @returns {Object} 
 */
export const prepararDadosPagamento = (planoId, dadosUsuario = {}) => {
  const plano = PLANOS_CONFIG[planoId];
  
  if (!plano) {
    throw new Error(`Plano ${planoId} não encontrado`);
  }
  
  return {
    produto: {
      id: plano.id,
      nome: plano.titulo,
      descricao: plano.descricaoWhatsApp,
      preco: plano.precoNumerico,
      moeda: 'BRL',
      duracao: plano.duracaoMeses,
      tipo: 'assinatura'
    },
    
    cliente: {
      nome: dadosUsuario.nome || '',
      email: dadosUsuario.email || '',
      telefone: dadosUsuario.telefone || '',
      documento: dadosUsuario.cpf || dadosUsuario.cnpj || ''
    },
    
    metadata: {
      origem: 'pagina_planos',
      timestamp: new Date().toISOString(),
      plano_popular: plano.popular,
      valor_total: plano.precoNumerico
    },
    
    urls: {
      sucesso: `${window.location.origin}/pagamento/sucesso`,
      erro: `${window.location.origin}/pagamento/erro`,
      cancelamento: `${window.location.origin}/planos`
    }
  };
};

/**
 * @param {Object} dadosPagamento 
 * @returns {Object} 
 */
export const validarDadosPagamento = (dadosPagamento) => {
  const erros = [];
  
  if (!dadosPagamento.produto.id) {
    erros.push('ID do plano é obrigatório');
  }
  
  if (!dadosPagamento.produto.preco || dadosPagamento.produto.preco <= 0) {
    erros.push('Preço do plano inválido');
  }
  
  if (!dadosPagamento.cliente.email && !dadosPagamento.cliente.telefone) {
    erros.push('Email ou telefone é obrigatório');
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
};

/**
 * @param {Object} dadosPagamento 
 * @returns {Promise} 
 */
export const simularPagamento = async (dadosPagamento) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const sucesso = Math.random() > 0.2; 
  
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
 * @returns {Array} 
 */
export const obterPlanos = () => {
  return Object.values(PLANOS_CONFIG);
};

/**
 * @param {string} planoId 
 * @returns {Object|null} 
 */
export const obterPlanoPorId = (planoId) => {
  return PLANOS_CONFIG[planoId] || null;
};
