<script lang="ts">
	import type { Root, Element, Text } from 'hast';
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import javascript from 'svelte-highlight/languages/javascript';
	import css from 'svelte-highlight/languages/css';
	import json from 'svelte-highlight/languages/json';
	import xml from 'svelte-highlight/languages/xml';
	import bash from 'svelte-highlight/languages/bash';
	import markdown from 'svelte-highlight/languages/markdown';
	import ashes from 'svelte-highlight/styles/ashes';

	type HighlightLanguage =
		| typeof typescript
		| typeof javascript
		| typeof css
		| typeof json
		| typeof xml
		| typeof bash
		| typeof markdown
		| undefined;

	export let node: Root | Element | Text;

	// Map language string to svelte-highlight language import
	const languageMap: Record<string, HighlightLanguage> = {
		typescript,
		javascript,
		js: javascript,
		ts: typescript,
		css,
		json,
		xml,
		html: xml,
		bash,
		sh: bash,
		shell: bash,
		markdown,
		md: markdown,
		plaintext: undefined
		// add more as needed
	};

	const getLang = (className: string) => {
		const match = className?.match?.(/language-([\w-]+)/);
		return match ? match[1].toLowerCase() : 'plaintext';
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

	// Helper to merge classes
	const mergeClasses = (existing: string | undefined, extra: string) => {
		return existing ? `${existing} ${extra}` : extra;
	};
</script>

<svelte:head>
	{@html ashes}
</svelte:head>

{#if node}
	{#if isRoot(node)}
		{#each node.children as child, i (child.position?.start?.offset ?? i)}
			{#if isElement(child) || isRoot(child)}
				<svelte:self node={child} />
			{:else if isText(child)}
				{@html child.value}
			{/if}
		{/each}
	{:else if isElement(node)}
		{#if node.tagName === 'pre' && node.children?.[0] && isElement(node.children[0]) && node.children[0].tagName === 'code'}
			<Highlight
				language={languageMap[getLang(node.children[0].properties?.className?.[0])] ||
					undefined}
				code={node.children[0].children?.map((c) => (isText(c) ? c.value : '')).join('')}
				langtag={true}
				--langtag-background="#111"
				--langtag-color="#fff"
				--langtag-border-radius="0.5rem"
				--langtag-padding="0.25rem 0.75rem"
				--langtag-top="0.5rem"
				--langtag-right="0.5rem"
			/>
		{:else if voidElements.has(node.tagName)}
			{#if node.tagName === 'img'}
				<svelte:element
					this={node.tagName}
					{...node.properties}
					class={mergeClasses(node.properties?.class, 'rounded-2xl')}
				/>
			{:else}
				<svelte:element this={node.tagName} {...node.properties} />
			{/if}
		{:else if ['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)}
			<svelte:element
				this={node.tagName}
				{...node.properties}
				class={mergeClasses(node.properties?.class, 'mt-8 mb-4')}
			>
				{#each node.children as child, i (child.position?.start?.offset ?? i)}
					{#if isElement(child) || isRoot(child)}
						<svelte:self node={child} />
					{:else if isText(child)}
						{@html child.value}
					{/if}
				{/each}
			</svelte:element>
		{:else if node.tagName === 'code'}
			<svelte:element this={node.tagName} {...node.properties}>
				{#each node.children as child, i (child.position?.start?.offset ?? i)}
					{#if isElement(child) || isRoot(child)}
						<svelte:self node={child} />
					{:else if isText(child)}
						{@html child.value}
					{/if}
				{/each}
			</svelte:element>
		{:else}
			<svelte:element this={node.tagName} {...node.properties}>
				{#each node.children as child, i (child.position?.start?.offset ?? i)}
					{#if isElement(child) || isRoot(child)}
						<svelte:self node={child} />
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
