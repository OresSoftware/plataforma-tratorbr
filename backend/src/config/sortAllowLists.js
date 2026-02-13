const SORT_ALLOW_LISTS = {
  // adminUserController.js
  users: {
    'name_asc': 'u.firstname ASC, u.lastname ASC',
    'name_desc': 'u.firstname DESC, u.lastname DESC',
    'date_asc': 'u.date_added ASC, u.user_id ASC',
    'date_desc': 'u.date_added DESC, u.user_id DESC'
  },

  // adminEnterpriseController.js
  enterprises: {
    'az': 'ORDER BY e.fantasia ASC',
    'za': 'ORDER BY e.fantasia DESC',
    'oldest': 'ORDER BY e.enterprise_id ASC',
    'newest': 'ORDER BY e.enterprise_id DESC',
    'default': 'ORDER BY score DESC, e.fantasia ASC'
  },

  // adminContatoController.js
  contatos: {
    'respondido': 'ORDER BY responded_at DESC',
    'pendente': 'ORDER BY created_at DESC',
    'todos': 'ORDER BY created_at DESC'
  }
};

const getValidatedOrderBy = (value, listKey, defaultKey = 'default') => {
  const allowList = SORT_ALLOW_LISTS[listKey];
  if (!allowList) {
    throw new Error(`Sort allow list not found for: ${listKey}`);
  }
  return allowList[value] || allowList[defaultKey] || Object.values(allowList)[0];
};

module.exports = { SORT_ALLOW_LISTS, getValidatedOrderBy };