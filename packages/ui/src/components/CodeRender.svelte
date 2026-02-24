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
	import { copyCode, getLangLabel } from '@a11y.cool/utils';

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

	const handleCopy = () => {
		copyCode(code, {
			onCopy: () => {
				copied = true;
			},
			onError: () => {
				copied = false;
			}
		}).then(() => {
			copied = false;
		});
	};

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
		} else {
			highlighted = hljs.highlight(code, { language: lang }).value;
		}
	});
</script>

<div class="code-block mb-4 rounded-2xl border-2 border-code-block-border">
	<div
		class="code-block-header flex items-center justify-between gap-2 border-b-2 border-transparent pr-2 pl-3 py-2 text-sm bg-background-alt overflow-hidden rounded-t-2xl"
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
				onclick={handleCopy}
				icon={copied ? Check : CopySimple}
				iconSize={16}
				iconPosition="start"
			>
				{copied ? 'Code copied' : 'Copy code'}
			</Button>
		{/if}
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<pre class="text-sm p-1 overflow-hidden"><code
			class="hljs p-4 focus:outline-1 focus:outline-border-input-hover focus:outline-offset-1 rounded-b-xl"
			tabindex="0"
			aria-label={language || 'code'}>{@html highlighted}</code
		></pre>
</div>
