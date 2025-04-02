// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Pusher Configuration
export const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
export const PUSHER_APP_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER;
// WebSocket host format for Pusher
export const PUSHER_WS_HOST = `ws-${PUSHER_APP_CLUSTER}.pusher.com`;
export const PUSHER_APP_PORT = import.meta.env.VITE_PUSHER_APP_PORT || '443';
export const PUSHER_APP_SCHEME = import.meta.env.VITE_PUSHER_APP_SCHEME || 'https';

// Other app configurations can be added here
export const APP_NAME = 'VSee Challenge - Clinic Room';
export const DEFAULT_LOCALE = 'en'; 