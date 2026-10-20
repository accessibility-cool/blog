<script lang="ts">
	import type { CustomBlockComponentProps } from '@portabletext/svelte';
	import CodeRender from './CodeRender.svelte';

	type CodeBlock = { _type: 'code'; code?: string; language?: string; filename?: string };

	let { portableText }: { portableText: CustomBlockComponentProps<CodeBlock> } = $props();
</script>

{#if portableText.value.code}
	<figure class="my-6">
		{#if portableText.value.filename}
			<figcaption class="mb-2 font-mono text-sm text-foreground-alt">
				{portableText.value.filename}
			</figcaption>
		{/if}
		<CodeRender
			code={portableText.value.code}
			language={portableText.value.language ?? ''}
			copyButton={true}
		/>
	</figure>
{/if}
