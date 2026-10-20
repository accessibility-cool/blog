import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { codeInput } from '@sanity/code-input';
import { schemaTypes, singletonTypes } from './schemaTypes';
import { structure } from './structure';

export default defineConfig({
	name: 'default',
	title: 'accessibility.cool',
	projectId: '8mj49az4',
	dataset: 'production',
	plugins: [structureTool({ structure }), visionTool(), codeInput()],
	schema: {
		types: schemaTypes,
		// Singletons can't be created from the global "new document" menu
		templates: (templates) =>
			templates.filter(({ schemaType }) => !singletonTypes.has(schemaType))
	},
	document: {
		// ...nor duplicated or deleted
		actions: (actions, { schemaType }) =>
			singletonTypes.has(schemaType)
				? actions.filter(
						({ action }) =>
							action && ['publish', 'discardChanges', 'restore'].includes(action)
					)
				: actions
	}
});
