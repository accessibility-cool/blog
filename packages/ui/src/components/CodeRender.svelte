<script lang="ts">
	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import css from 'highlight.js/lib/languages/css';
	import json from 'highlight.js/lib/languages/json';
	import xml from 'highlight.js/lib/languages/xml';
	import bash from 'highlight.js/lib/languages/bash';
	import markdown from 'highlight.js/lib/languages/markdown';
	import Button from './Button.svelte';
	import { CopySimple, Check } from 'phosphor-svelte';

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

	let {
		code = '',
		language = '',
		copyButton = false
	} = $props<{ code?: string; language?: string; copyButton?: boolean }>();

	let highlighted = $state('');
	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout>;

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

	function copyCode() {
		if (!code) return;

		navigator.clipboard.writeText(code).then(() => {
			copied = true;
			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}

	// Cleanup timeout on component destroy
	$effect.root(() => {
		return () => {
			if (copyTimeout) clearTimeout(copyTimeout);
		};
	});
</script>

<div class="code-block mb-4 rounded-2xl border-2 border-gray-900 dark:border-gray-700">
	<div
		class="code-block-header flex items-center justify-between gap-2 border-b-2 border-transparent p-2 text-sm"
	>
		{#if language}
			<span class="lang-tag rounded-lg bg-muted px-2 py-1 text-sm">
				{getLangLabel(language)}
			</span>
		{/if}
		{#if copyButton}
			<Button
				variant="ghost"
				size="sm"
				onclick={copyCode}
				icon={copied ? Check : CopySimple}
				iconSize={16}
				iconPosition="start"
			>
				{copied ? 'Code copied' : 'Copy code'}
			</Button>
		{/if}
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre class="overflow-hidden text-sm rounded-b-2xl"><code
			class="hljs"
			tabindex="0"
			aria-label={language || 'code'}>{@html highlighted}</code
		></pre>
</div>
