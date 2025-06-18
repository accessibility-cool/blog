<script lang="ts">
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import css from 'highlight.js/lib/languages/css';
	import json from 'highlight.js/lib/languages/json';
	import xml from 'highlight.js/lib/languages/xml';
	import bash from 'highlight.js/lib/languages/bash';
	import markdown from 'highlight.js/lib/languages/markdown';

	// Register languages
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('js', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('ts', typescript);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('html', xml);
	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('sh', bash);
	hljs.registerLanguage('shell', bash);
	hljs.registerLanguage('markdown', markdown);
	hljs.registerLanguage('md', markdown);

	let { code = '', language = '' } = $props<{ code?: string; language?: string }>();

	// Theme CSS imports from .ts files (now just CSS strings)
	import ashesCss from './styles/ashes/ashes';
	import cupertinoCss from './styles/cupertino/cupertino';

	let themeCss = $state(ashesCss); // Default to dark for SSR

	const isBrowser = typeof window !== 'undefined';

	$effect(() => {
		if (!isBrowser || typeof window.matchMedia !== 'function') return;
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const updateTheme = () => {
			themeCss = mql.matches ? ashesCss : cupertinoCss;
		};
		updateTheme();
		mql.addEventListener('change', updateTheme);
		return () => mql.removeEventListener('change', updateTheme);
	});

	let highlighted = $state('');

	$effect(() => {
		if (!code) {
			highlighted = '';
			return;
		}
		let lang = language?.toLowerCase() || '';
		if (!lang || !hljs.getLanguage(lang)) {
			// Try to auto-detect
			const auto = hljs.highlightAuto(code);
			highlighted = auto.value;
			lang = auto.language || '';
		} else {
			highlighted = hljs.highlight(code, { language: lang }).value;
		}
	});

	const styleTag = $derived(() => `<style>${themeCss}</style>`);

	function getLangLabel(lang: string) {
		if (!lang) return 'plaintext';
		// Map to display names if needed
		const map: Record<string, string> = {
			js: 'JavaScript',
			javascript: 'JavaScript',
			ts: 'TypeScript',
			typescript: 'TypeScript',
			css: 'CSS',
			json: 'JSON',
			xml: 'XML/HTML',
			html: 'HTML',
			bash: 'Bash',
			sh: 'Shell',
			shell: 'Shell',
			markdown: 'Markdown',
			md: 'Markdown'
		};
		return map[lang] || lang;
	}
</script>

<svelte:head>
	{@html styleTag}
</svelte:head>

<div class="code-block-wrapper" style="position:relative;">
	{#if language}
		<span
			class="lang-tag"
			style="position:absolute;top:0.25rem;right:0.5rem;background:rgba(0,0,0,0.7);color:#fff;border-radius:0.5rem;padding:0.25rem 0.5rem;font-size:0.75rem;z-index:2;"
		>
			{getLangLabel(language)}
		</span>
	{/if}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre><code class="hljs" tabindex="0" aria-label={language || 'code'}>{@html highlighted}</code
		></pre>
</div>

<style>
	.code-block-wrapper {
		margin: 1.5rem 0;
		border-radius: 0.75rem;
		overflow: auto;
		position: relative;
	}
	.lang-tag {
		user-select: none;
		pointer-events: none;
	}
</style>
