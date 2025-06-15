<script lang="ts">
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import javascript from 'svelte-highlight/languages/javascript';
	import css from 'svelte-highlight/languages/css';
	import json from 'svelte-highlight/languages/json';
	import xml from 'svelte-highlight/languages/xml';
	import bash from 'svelte-highlight/languages/bash';
	import markdown from 'svelte-highlight/languages/markdown';
	import horizonDark from 'svelte-highlight/styles/horizon-dark';

	export let node;

	// Map language string to svelte-highlight language import
	const languageMap: Record<string, any> = {
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
		md: markdown
		// add more as needed
	};

	function getLang(className: string) {
		const match = className?.match?.(/language-([\w-]+)/);
		return match ? match[1] : 'plaintext';
	}
</script>

<svelte:head>
	{@html horizonDark}
</svelte:head>

{#if node}
	{#if node.type === 'root'}
		{#each node.children as child}
			<svelte:self node={child} />
		{/each}
	{:else if node.type === 'element'}
		{#if node.tagName === 'pre' && node.children?.[0]?.tagName === 'code'}
			<Highlight
				language={languageMap[getLang(node.children[0].properties?.className?.[0])] ||
					undefined}
				code={node.children[0].children?.map((c) => c.value || '').join('')}
			/>
		{:else}
			<svelte:element this={node.tagName} {...node.properties}>
				{#each node.children as child}
					<svelte:self node={child} />
				{/each}
			</svelte:element>
		{/if}
	{:else if node.type === 'text'}
		{@html node.value}
	{/if}
{/if}
