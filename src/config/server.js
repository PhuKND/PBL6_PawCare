const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/api/v1';

const SERVER_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');

export const WS_URL = `${SERVER_ORIGIN}/ws-chat`;

export const CHAT_HISTORY_URL = `${API_BASE}/chat/history`;

export const CHAT_PEOPLE_URL = `${API_BASE}/chat/people`;

export const CHAT_SEND_URL = `${API_BASE}/chat/`;

export { API_BASE };

