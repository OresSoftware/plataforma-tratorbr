import axios from 'axios';

const apiApp = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true
} );

export async function cadastroUsuario({ firstname, lastname, ocupacao_id, fone, email, senha }) {
  try {
    const { data } = await apiApp.post('/public/usuario/cadastro', {
      firstname,
      lastname,
      ocupacao_id,
      fone,
      email,
      senha
    });
    
    return data;
  } catch (error) {
    console.error('Erro ao fazer cadastro:', error);
    throw error;
  }
}