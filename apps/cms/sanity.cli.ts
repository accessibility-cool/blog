import { defineCliConfig } from 'sanity/cli';
import * as dotenv from 'dotenv';
dotenv.config();

// Public identifiers, not secrets — the same values are hardcoded in
// packages/data/src/sanity/api.ts. The env vars only exist to point a local
// Studio at another dataset.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '8mj49az4';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const studioHost = process.env.SANITY_STUDIO_HOST || 'accessibility-cool';

export default defineCliConfig({
	api: {
		projectId,
		dataset
	},
	deployment: {
		autoUpdates: true,
		appId: 'bnl15ib6y30844txchjm37g8'
	},
	studioHost,
	typegen: {
		path: '../../packages/data/src/**/*.{ts,js}',
		schema: '../../packages/data/schema.json',
		generates: '../../packages/data/src/sanity/sanity.types.ts',
		// Call sites pass the result type explicitly: client.fetch<PostQueryResult>(postQuery)
		overloadClientMethods: false
	}
});
