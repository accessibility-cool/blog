<script lang="ts">
	import type { Element, Root, Text } from 'hast';
	import { slugify } from '@a11y.cool/utils';
	import CodeRender from './CodeRender.svelte';
	import HtmlRender from './HtmlRender.svelte';

	let { node = undefined as Element | Root | undefined } = $props<{
		node?: Element | Root;
	}>();

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

	const isElement = (node: unknown): node is Element =>
		node && typeof node === 'object' && 'type' in node && node.type === 'element';

	const isRoot = (node: unknown): node is Root =>
		node && typeof node === 'object' && 'type' in node && node.type === 'root';

	const isText = (node: unknown): node is Text =>
		node && typeof node === 'object' && 'type' in node && node.type === 'text';

	const getLang = (className: string | undefined) => {
		if (!className) return '';
		const match = className.match(/language-(\w+)/);
		return match ? match[1] : '';
	};

	const normalizeClass = (value: string | string[] | undefined): string => {
		if (!value) return '';
		if (Array.isArray(value)) return value.join(' ');
		return value;
	};

	const mergeClasses = (...classes: string[]): string => classes.filter(Boolean).join(' ');

	function renderChildren(children: (Element | Text)[]) {
		return children
			.map((child, i) => {
				if (isElement(child)) {
					return renderNode(child);
				} else if (isText(child)) {
					return child.value;
				}
				return '';
			})
			.join('');
	}

	function renderNode(node: Element | Root): string {
		if (isRoot(node)) {
			return renderChildren(node.children);
		}

		if (
			node.tagName === 'pre' &&
			node.children?.[0] &&
			isElement(node.children[0]) &&
			node.children[0].tagName === 'code'
		) {
			// Handle code blocks separately through CodeRender component
			return '';
		}

		if (voidElements.has(node.tagName)) {
			const props = Object.entries(node.properties || {})
				.map(([key, value]) => {
					if (key === 'className') key = 'class';
					if (key === 'class' && node.tagName === 'img') {
						value = mergeClasses(
							normalizeClass(value as string | string[]),
							'rounded-2xl'
						);
					}
					return `${key}="${value}"`;
				})
				.join(' ');
			return `<${node.tagName} ${props}>`;
		}

		if (['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName) && node.children?.[0]) {
			const headingText = node.children
				.map((child) => (isText(child) ? child.value : ''))
				.join('');
			const headingId = slugify(headingText);
			const props = Object.entries(node.properties || {})
				.map(([key, value]) => {
					if (key === 'className') key = 'class';
					if (key === 'class') {
						value = mergeClasses(
							normalizeClass(value as string | string[]),
							'mt-8 mb-4'
						);
					}
					return `${key}="${value}"`;
				})
				.join(' ');
			return `<a href="#${headingId}" class="no-underline hover:underline focus:underline focus-visible:outline-none">
				<${node.tagName} id="${headingId}" ${props}>${renderChildren(node.children)}</${node.tagName}>
			</a>`;
		}

		const props = Object.entries(node.properties || {})
			.map(([key, value]) => {
				if (key === 'className') key = 'class';
				return `${key}="${value}"`;
			})
			.join(' ');
		return `<${node.tagName} ${props}>${renderChildren(node.children)}</${node.tagName}>`;
	}

	$effect(() => {
		if (!node) return;
		if (isElement(node) || isRoot(node)) {
			const content = renderNode(node);
			if (content) {
				// Update the DOM with the rendered content
				const container = document.createElement('div');
				container.innerHTML = content;
				// Replace the current element with the rendered content
				const currentElement = document.currentScript?.parentElement;
				if (currentElement) {
					currentElement.replaceWith(...container.childNodes);
				}
			}
		}
	});
</script>

{#if node}
	{#if isRoot(node)}
		{#each node.children as child (child.position?.start?.offset)}
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
						{#each node.children as child (child.position?.start?.offset)}
							{#if isElement(child) || isRoot(child)}
								<HtmlRender node={child} />
							{:else if isText(child)}
								{@html child.value}
							{/if}
						{/each}
					</svelte:element>
				</a>
			{/if}
		{:else}
			<svelte:element this={node.tagName} {...node.properties}>
				{#each node.children as child (child.position?.start?.offset)}
					{#if isElement(child) || isRoot(child)}
						<HtmlRender node={child} />
					{:else if isText(child)}
						{@html child.value}
					{/if}
				{/each}
			</svelte:element>
		{/if}
	{/if}
{/if}
