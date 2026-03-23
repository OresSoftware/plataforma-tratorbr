import axios from 'axios';

const apiApp = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true
} );

export async function getOcupacoes() {
  try {
    const { data } = await apiApp.get('/public/ocupacoes');
    return data;
  } catch (error) {
    console.error('Erro ao buscar ocupações:', error);
    throw error;
  }
}