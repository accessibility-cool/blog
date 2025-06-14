import { config } from '@a11y.cool/eslint-config/index.js';

export default [
	...config,
	{
		ignores: ['.svelte-kit/*', '.vercel/*']
	}
];
