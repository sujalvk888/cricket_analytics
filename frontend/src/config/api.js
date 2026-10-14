// Central API configuration
// In development, falls back to http://localhost:5000.
// In production (Vercel), uses VITE_API_URL pointing to the Render backend service.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
