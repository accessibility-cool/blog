// src/lib/ghost/index.ts
import GhostContentAPI from '@tryghost/content-api';

if (!import.meta.env.VITE_GHOST_API_URL) {
	throw new Error('VITE_GHOST_API_URL environment variable is not set');
}

if (!import.meta.env.VITE_GHOST_CONTENT_API_KEY) {
	throw new Error('VITE_GHOST_CONTENT_API_KEY environment variable is not set');
}

export const contentApi = new GhostContentAPI({
	url: import.meta.env.VITE_GHOST_API_URL,
	key: import.meta.env.VITE_GHOST_CONTENT_API_KEY,
	version: 'v5.0'
});
