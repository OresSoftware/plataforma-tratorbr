const SORT_ALLOW_LISTS = {
  users: {
    'name_asc': 'u.firstname ASC, u.lastname ASC',
    'name_desc': 'u.firstname DESC, u.lastname DESC',
    'date_asc': 'u.date_added ASC, u.user_id ASC',
    'date_desc': 'u.date_added DESC, u.user_id DESC'
  },

  enterprises: {
    'az': 'ORDER BY e.fantasia ASC',
    'za': 'ORDER BY e.fantasia DESC',
    'oldest': 'ORDER BY e.enterprise_id ASC',
    'newest': 'ORDER BY e.enterprise_id DESC',
    'default': 'ORDER BY score DESC, e.fantasia ASC'
  },

  contatos: {
    'respondido': 'ORDER BY responded_at DESC',
    'pendente': 'ORDER BY created_at DESC',
    'todos': 'ORDER BY created_at DESC',
    'default': 'ORDER BY created_at DESC'
  },

  funcionarios: {
    'name_asc': 'nome ASC, sobrenome ASC',
    'name_desc': 'nome DESC, sobrenome DESC',
    'date_asc': 'created_at ASC',
    'date_desc': 'created_at DESC',
    'default': 'nome ASC'
  }
};

const getValidatedOrderBy = (value, listKey, defaultKey = 'default') => {
  const allowList = SORT_ALLOW_LISTS[listKey];

  if (!allowList) {
    console.error(`Sort allow list not found for: ${listKey}`);
    throw new Error(`Configuração inválida de ordenação para: ${listKey}`);
  }

  if (!allowList[value]) {
    console.warn(`Invalid sort value: ${value} for listKey: ${listKey}. Using default: ${defaultKey}`);
  }

  const result = allowList[value] || allowList[defaultKey];

  if (!result) {
    console.error(`Default sort key not found: ${defaultKey} for listKey: ${listKey}`);
    throw new Error(`Configuração inválida de ordenação padrão para: ${listKey}`);
  }

  return result;
};

module.exports = { SORT_ALLOW_LISTS, getValidatedOrderBy };