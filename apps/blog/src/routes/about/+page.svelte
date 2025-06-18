<script lang="ts">
	import { Card } from '@a11y.cool/ui';
	import type { PageData } from './$types';
	import { Render } from '@jill64/svelte-sanitize';
	import { PersonSimpleCircle } from 'phosphor-svelte';

	let { data } = $props<{ data: PageData }>();
	let { page } = $derived(data);
</script>

<section class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
	<div class="flex flex-col justify-center items-center py-24">
		{#if page.title}
			<h1 class="text-6xl md:text-8xl text-center mb-8">{page.title}</h1>
		{/if}
		<p class="max-w-2xl text-center text-lg">
			Launched in June 2025, Accessibility.cool is an independent publication born from a shared
			passion: making the digital world truly accessible to everyone. We believe that inclusive
			design and accessible development aren't just 'nice-to-haves' – they are fundamental to
			creating equitable online experiences.
		</p>
	</div>
</section>

<section class="col-span-12 col-start-1 flex justify-center">
	<article class="max-w-[580px] w-full py-12 md:py-24">
		{#if page.html}
			<div class="space-y-6">
				<Render html={page.html} />
			</div>
		{/if}
	</article>
</section>

<section class="col-span-12 my-16 md:my-24 lg:my-32">
	<div class="grid grid-cols-12">
		<h2
			class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
		>
			Accessibility.cool is driven by two professionals with a deep commitment to digital inclusion
		</h2>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
		<Card title="Oliver Schwamb" description="Blog posts about digital accessibility."></Card>
		<Card
			title="Simon Phumin Schweikert"
			description="(Inclusive) Design and Development Checklists."
		></Card>
	</div>
</section>

<section class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
	<div class="flex flex-col justify-center items-center py-24">
		<h2 class="text-6xl md:text-8xl text-center mb-8 font-highlight">Join Us on the Journey</h2>
		<PersonSimpleCircle size={128} weight="light" class="pb-8" />
		<p class="max-w-2xl text-center text-lg">
			We invite you to explore our resources, engage with our articles, and join us in building a
			more inclusive and accessible digital future. Whether you're just starting your accessibility
			journey or are a professional, we hope Accessibility.cool becomes your trusted companion.
		</p>
	</div>
</section>
