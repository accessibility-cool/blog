<script lang="ts">
	import type { Person } from '@a11y.cool/data';
	import { urlFor } from '@a11y.cool/data';
	import { Globe, LinkedinLogo, LinkSimple } from 'phosphor-svelte';
	import { safeHref } from '@a11y.cool/utils';

	let { member }: { member: Person } = $props();

	const linkLabels: Record<string, string> = {
		website: 'Website',
		linkedin: 'LinkedIn',
		mastodon: 'Mastodon',
		bluesky: 'Bluesky',
		github: 'GitHub',
		instagram: 'Instagram',
		youtube: 'YouTube',
		x: 'X',
		other: 'Profile'
	};

	let imageUrl = $derived(urlFor(member.image, 192, 192));
	// Re-checked at render time like rich-text links: Studio validation does not constrain the dataset
	let links = $derived(
		(member.links ?? []).flatMap((link) => {
			const href = safeHref(link.url);
			return href ? [{ ...link, href }] : [];
		})
	);
</script>

<!-- `id` is the person's anchor — JSON-LD Person ids point at /about#slug -->
<article
	id={member.slug ?? undefined}
	class="rounded-3xl shadow-card border border-border-input bg-background-alt p-6 flex flex-col items-start gap-4 h-full scroll-mt-24"
>
	{#if imageUrl}
		<div
			class="w-24 h-24 rounded-full overflow-hidden border-2 border-border-input mb-2 self-center"
		>
			<!-- The name is the adjacent heading, so a decorative portrait gets alt="" rather than repeating it -->
			<img
				src={imageUrl}
				alt={member.image?.decorative ? '' : (member.image?.alt ?? '')}
				width="96"
				height="96"
				loading="lazy"
				class="w-full h-full object-cover"
			/>
		</div>
	{/if}

	<h3 class="text-xl md:text-2xl font-semibold text-left mb-2">
		{member.name}
	</h3>

	{#if member.role}
		<p class="text-base text-left mb-0">{member.role}</p>
	{/if}

	{#if member.certifications?.length}
		<p class="text-sm text-foreground-alt text-left mb-3">
			{member.certifications.join(' · ')}
		</p>
	{/if}

	{#if member.bio}
		<p class="text-base mb-4 w-full text-left">
			{member.bio}
		</p>
	{/if}

	{#if links.length}
		<ul class="flex flex-wrap gap-4 mt-auto pt-4" aria-label="{member.name} elsewhere">
			{#each links as link (link.href)}
				<li>
					<a
						href={link.href}
						rel="noopener noreferrer me"
						class="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border-input hover:bg-muted transition-colors"
					>
						{#if link.platform === 'website'}
							<Globe size={16} aria-hidden="true" />
						{:else if link.platform === 'linkedin'}
							<LinkedinLogo size={16} aria-hidden="true" />
						{:else}
							<LinkSimple size={16} aria-hidden="true" />
						{/if}
						<span class="text-sm">{linkLabels[link.platform ?? 'other']}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</article>
