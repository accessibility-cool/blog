<script lang="ts">
	import type { Root, Element, Text } from 'hast';
	import CodeRender from './CodeRender.svelte';
	import HtmlRender from './HtmlRender.svelte';
	import { slugify } from '@a11y.cool/utils';

	let { node } = $props<{ node: Root | Element | Text }>();

	const getLang = (className: string) => {
		const match = className?.match?.(/language-([\w-]+)/);
		return match ? match[1].toLowerCase() : '';
	};

	const isRoot = (n: unknown): n is Root => {
		return !!n && typeof n === 'object' && (n as Root).type === 'root';
	};
	const isElement = (n: unknown): n is Element => {
		return !!n && typeof n === 'object' && (n as Element).type === 'element';
	};
	const isText = (n: unknown): n is Text => {
		return !!n && typeof n === 'object' && (n as Text).type === 'text';
	};

	const voidElements = new Set([
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		'img',
		'input',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr'
	]);

	const mergeClasses = (existing: string | undefined, extra: string) => {
		return existing ? `${existing} ${extra}` : extra;
	};

	// Helper to normalize class property to string
	const normalizeClass = (cls: unknown): string | undefined => {
		if (typeof cls === 'string') return cls;
		if (Array.isArray(cls)) return cls.filter(Boolean).join(' ');
		if (typeof cls === 'number' || typeof cls === 'boolean') return String(cls);
		return undefined;
	};
</script>

{#if node}
	{#if isRoot(node)}
		{#each node.children as child, i (child.position?.start?.offset ?? i)}
			{#if isElement(child) || isRoot(child)}
				<HtmlRender node={child} />
			{:else if isText(child)}
				{@html child.value}
			{/if}
		{/each}
	{:else if isElement(node)}
		{#if node.tagName === 'pre' && node.children?.[0] && isElement(node.children[0]) && node.children[0].tagName === 'code'}
			<CodeRender
				code={node.children[0].children?.map((c) => (isText(c) ? c.value : '')).join('')}
				language={getLang(node.children[0].properties?.className?.[0])}
				copyButton={true}
			/>
		{:else if voidElements.has(node.tagName)}
			{#if node.tagName === 'img'}
				<svelte:element
					this={node.tagName}
					{...node.properties}
					class={mergeClasses(normalizeClass(node.properties?.class), 'rounded-2xl')}
				/>
			{:else}
				<svelte:element this={node.tagName} {...node.properties} />
			{/if}
		{:else if ['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)}
			{#if node.children?.[0]}
				{@const headingText = node.children
					.map((child) => (isText(child) ? child.value : ''))
					.join('')}
				{@const headingId = slugify(headingText)}
				<a
					href={`#${headingId}`}
					class="no-underline hover:underline focus:underline focus-visible:outline-none"
				>
					<svelte:element
						this={node.tagName}
						id={headingId}
						{...node.properties}
						class={mergeClasses(normalizeClass(node.properties?.class), 'mt-8 mb-4')}
					>
						{#each node.children as child, i (child.position?.start?.offset ?? i)}
							{#if isElement(child) || isRoot(child)}
								<HtmlRender node={child} />
							{:else if isText(child)}
								{@html child.value}
							{/if}
						{/each}
					</svelte:element>
				</a>
			{/if}
		{:else if node.tagName === 'code'}
			<svelte:element this={node.tagName} {...node.properties}>
				{#each node.children as child, i (child.position?.start?.offset ?? i)}
					{#if isElement(child) || isRoot(child)}
						<HtmlRender node={child} />
					{:else if isText(child)}
						{@html child.value}
					{/if}
				{/each}
			</svelte:element>
		{:else}
			<svelte:element this={node.tagName} {...node.properties}>
				{#each node.children as child, i (child.position?.start?.offset ?? i)}
					{#if isElement(child) || isRoot(child)}
						<HtmlRender node={child} />
					{:else if isText(child)}
						{@html child.value}
					{/if}
				{/each}
			</svelte:element>
		{/if}
	{:else if isText(node)}
		{@html node.value}
	{/if}
{/if}
