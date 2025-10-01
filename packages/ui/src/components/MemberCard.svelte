<script lang="ts">
	import type { Member } from '@a11y.cool/data';
	import { Globe, LinkedinLogo } from 'phosphor-svelte';

	let { member }: { member: Member } = $props();
</script>

<article
	class="rounded-3xl shadow-card border border-border-input bg-background-alt p-6 flex flex-col items-start gap-4 min-h-[320px]"
>
	<!-- Circular member image -->
	{#if member.image}
		<div
			class="w-24 h-24 rounded-full overflow-hidden border-2 border-border-input mb-2 self-center"
		>
			<img
				src={member.image.id}
				alt={member.image.description || `${member.name} profile picture`}
				class="w-full h-full object-cover"
			/>
		</div>
	{/if}

	<!-- Member name -->
	<h3 class="text-xl md:text-2xl font-semibold text-left mb-2">
		{member.name}
	</h3>

	<!-- Certification if available -->
	{#if member.certification}
		<p class="text-sm text-muted-foreground text-left mb-3">
			{member.certification}
		</p>
	{/if}

	<!-- Description -->
	<p class="text-base mb-4 w-full text-left">
		{member.description}
	</p>

	<!-- URL links at the bottom -->
	<div class="flex gap-4 mt-auto">
		{#if member.website}
			<a
				href={member.website}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border-input hover:bg-muted transition-colors"
				aria-label="Visit {member.name}'s website"
			>
				<Globe size={16} />
				<span class="text-sm">Website</span>
			</a>
		{/if}

		{#if member.linkedin}
			<a
				href={member.linkedin}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border-input hover:bg-muted transition-colors"
				aria-label="Visit {member.name}'s LinkedIn profile"
			>
				<LinkedinLogo size={16} />
				<span class="text-sm">LinkedIn</span>
			</a>
		{/if}
	</div>
</article>
