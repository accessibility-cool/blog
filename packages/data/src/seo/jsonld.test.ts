import { describe, expect, it } from 'vitest';
import {
	aboutGraph,
	blogGraph,
	graphContext,
	homeGraph,
	postGraph,
	type JsonLdNode,
	type JsonLdSchema
} from './jsonld';

const ORIGIN = 'https://accessibility.cool';

const ASSET = {
	_type: 'image' as const,
	asset: {
		_type: 'reference' as const,
		_ref: 'image-d93722cee08f536169e980629eaa4433c9453e7a-4000x3000-jpg'
	}
};

const ADA = {
	name: 'Ada Example',
	slug: 'ada-example',
	role: 'Accessibility Consultant',
	bio: 'Tests with screen readers daily.',
	certifications: ['IAAP CPACC', 'IAAP WAS'],
	image: { ...ASSET, alt: 'Portrait of Ada' },
	links: [{ url: 'https://www.linkedin.com/in/ada' }, { url: null }]
};

const ctxFor = (path: string) =>
	graphContext(new URL(`${ORIGIN}${path}?utm_source=x`), {
		sameAs: ['https://github.com/accessibility-cool', null],
		description: 'Studio sentence.'
	});

const graphs: Record<string, JsonLdSchema> = {
	home: homeGraph(ctxFor('/')),
	about: aboutGraph(ctxFor('/about'), {
		title: 'About',
		description: 'Who we are.',
		members: [ADA, { name: 'No Slug', slug: null }]
	}),
	blog: blogGraph(ctxFor('/blog'), {
		title: 'Blog',
		description: 'All posts.',
		posts: [
			{ title: 'Focus order', slug: 'focus-order' },
			{ title: null, slug: 'draft' }
		]
	}),
	post: postGraph(ctxFor('/blog/focus-order'), {
		title: 'Focus order',
		description: 'Why focus order matters.',
		datePublished: '2026-10-01T10:00:00Z',
		dateModified: '2026-10-02T10:00:00Z',
		image: { ...ASSET, alt: 'A keyboard' },
		authors: [ADA],
		categories: ['Keyboard', null],
		wordCount: 812
	})
};

const nodesOfType = (graph: JsonLdSchema, type: string) =>
	graph['@graph'].filter((node) => [node['@type']].flat().includes(type));

/** Every `{ '@id': … }` object that is a reference rather than a node. */
function references(value: unknown, out: string[] = []): string[] {
	if (Array.isArray(value)) value.forEach((item) => references(item, out));
	else if (value && typeof value === 'object') {
		const record = value as JsonLdNode;
		const keys = Object.keys(record);
		if (keys.length === 1 && keys[0] === '@id') out.push(record['@id'] as string);
		else Object.values(record).forEach((item) => references(item, out));
	}
	return out;
}

describe.each(Object.entries(graphs))('%s graph', (_name, graph) => {
	it('carries no @context on its nodes (the <JsonLd> component adds it once)', () => {
		for (const node of graph['@graph']) expect(node).not.toHaveProperty('@context');
	});

	it('resolves every @id reference inside the graph', () => {
		const ids = new Set(graph['@graph'].map((node) => node['@id']));
		for (const id of references(graph['@graph'])) expect(ids).toContain(id);
	});

	it('has no undefined or null values anywhere', () => {
		const json = JSON.stringify(graph);
		expect(json).not.toContain('null');
		expect(JSON.parse(json)).toEqual(graph);
	});

	it('includes the Organization and WebSite, anchored to the origin', () => {
		const [org] = nodesOfType(graph, 'Organization');
		expect(org['@id']).toBe(`${ORIGIN}/#organization`);
		expect(org.description).toBe('Studio sentence.');
		expect(org.sameAs).toEqual(['https://github.com/accessibility-cool']);
		expect(nodesOfType(graph, 'WebSite')[0]['@id']).toBe(`${ORIGIN}/#website`);
	});

	it('mints no @id from the query string', () => {
		expect(JSON.stringify(graph)).not.toContain('utm_source');
	});
});

describe('postGraph', () => {
	const graph = graphs.post;
	const [article] = nodesOfType(graph, 'BlogPosting');

	it('is a BlogPosting with dates, image and the publisher', () => {
		expect(article).toMatchObject({
			headline: 'Focus order',
			datePublished: '2026-10-01T10:00:00Z',
			dateModified: '2026-10-02T10:00:00Z',
			publisher: { '@id': `${ORIGIN}/#organization` },
			articleSection: ['Keyboard'],
			wordCount: 812,
			isAccessibleForFree: true
		});
		expect(article.image).toContain('cdn.sanity.io');
	});

	it('credits real people with credentials and profiles', () => {
		expect(article.author).toEqual([{ '@id': `${ORIGIN}/about#ada-example` }]);
		const [person] = nodesOfType(graph, 'Person');
		expect(person).toMatchObject({
			name: 'Ada Example',
			jobTitle: 'Accessibility Consultant',
			sameAs: ['https://www.linkedin.com/in/ada'],
			hasCredential: [
				{ '@type': 'EducationalOccupationalCredential', name: 'IAAP CPACC' },
				{ '@type': 'EducationalOccupationalCredential', name: 'IAAP WAS' }
			]
		});
	});

	it('falls back to the Organization as author when there are no people', () => {
		const lone = postGraph(ctxFor('/blog/x'), { title: 'X', description: 'Y' });
		expect(nodesOfType(lone, 'BlogPosting')[0].author).toEqual({
			'@id': `${ORIGIN}/#organization`
		});
	});

	it('ends the breadcrumb trail at the post', () => {
		const [trail] = nodesOfType(graph, 'BreadcrumbList');
		const items = trail.itemListElement as { position: number; item: string }[];
		expect(items.map((item) => item.item)).toEqual([
			`${ORIGIN}/`,
			`${ORIGIN}/blog`,
			`${ORIGIN}/blog/focus-order`
		]);
		expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
	});
});

describe('aboutGraph', () => {
	it('is about the Organization and skips people without a stable id', () => {
		const graph = graphs.about;
		expect(nodesOfType(graph, 'AboutPage')[0].mainEntity).toEqual({
			'@id': `${ORIGIN}/#organization`
		});
		expect(nodesOfType(graph, 'Person').map((node) => node.name)).toEqual(['Ada Example']);
	});
});

describe('blogGraph', () => {
	it('lists only posts that have a title and slug', () => {
		const [page] = nodesOfType(graphs.blog, 'CollectionPage');
		expect(page.mainEntity).toEqual({
			'@type': 'ItemList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Focus order',
					url: `${ORIGIN}/blog/focus-order`
				}
			]
		});
	});
});
