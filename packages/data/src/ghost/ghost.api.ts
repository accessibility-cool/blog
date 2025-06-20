// src/lib/ghost/index.ts
import GhostContentAPI from '@tryghost/content-api';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.VITE_GHOST_API_URL) {
	throw new Error('VITE_GHOST_API_URL environment variable is not set');
}

if (!process.env.VITE_GHOST_CONTENT_API_KEY) {
	throw new Error('VITE_GHOST_CONTENT_API_KEY environment variable is not set');
}

export const contentApi = new GhostContentAPI({
	url: process.env.VITE_GHOST_API_URL,
	key: process.env.VITE_GHOST_CONTENT_API_KEY,
	version: 'v5.0'
});
