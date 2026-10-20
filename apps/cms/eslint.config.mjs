import { createRequire } from 'node:module';

import studio from '@sanity/eslint-config-studio';

// @sanity/eslint-config-studio sets `settings.react.version: 'detect'`, and
// eslint-plugin-react's detection path calls `context.getFilename()`, removed in
// ESLint 10. That throws on every file, so pin the version we actually install
// instead of letting the plugin sniff for it.
const require = createRequire(import.meta.url);
const { version: reactVersion } = require('react/package.json');

export default [
	...studio,
	{
		settings: { react: { version: reactVersion } }
	}
];
