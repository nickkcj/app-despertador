import axios from 'axios';


export const BASE_URL = 'http://192.168.1.3:3000';

// ID do dispositivo ESP32
export const DEVICE_ID = 'esp32-001';

// Instância do Axios configurada
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para log de erros (opcional, útil para debug)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout: O servidor demorou muito para responder');
    } else if (!error.response) {
      console.error('Erro de conexão: Não foi possível conectar ao servidor');
    } else {
      console.error('Erro da API:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
