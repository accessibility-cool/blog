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

<section class="col-span-12 my-16 md:my-24 lg:my-32">
	<div class="grid grid-cols-12">
		<h2
			class="text-center mb-10 font-bold text-2xl md:text-3xl col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4"
		>
			Accessibility.cool is driven by two professionals with a deep commitment to digital inclusion
		</h2>
	</div>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
		<Card
			title="Oliver Schwamb"
			description="Oliver is a driving force behind Accessibility.cool, bringing a wealth of experience as a Senior Consultant focusing on UX/UI Design and Front-end Development. Working with SVA, one of Germany's largest system integrators, he advises major German public sector clients on creating user-centric and accessible digital solutions. Oliver is a recognized voice in the community, speaking at events like enterjs and authoring articles for respected publications such as heise online. His expertise lies in translating complex requirements into semantic, accessible user interfaces that truly work for people."
		></Card>
		<Card
			title="Simon Phumin Schweikert"
			description="Simon co-founded Accessibility.cool with a deep commitment to user-centered and inclusive design. As a Senior Product Designer operating as a freelancer and contractor, he has a rich history of collaborating with a diverse range of clients – from innovative startups and significant public institutions (like the German Federal Archives and the Parliament of the Federal Republic of Germany) to globally recognized brands such as IBM and Stihl. Simon excels at transforming complex challenges into elegant, accessible digital platforms that serve all users effectively. He is actively pursuing his CPACC certification, further solidifying his dedication to the field."
		></Card>
	</div>
</section>

<section class="col-span-12 col-start-1 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
	<div class="flex flex-col justify-center items-center py-24">
		<PersonSimpleCircle
			size={128}
			weight="light"
			aria-label="Person with impairments icon"
			class="pb-8"
		/>
		<h2 class="text-6xl md:text-8xl text-center mb-8 font-highlight">Join Us on our Journey</h2>
		<p class="max-w-2xl text-center text-lg">
			We invite you to explore our resources, engage with our articles, and join us in building a
			more inclusive and accessible digital future. Whether you're just starting your accessibility
			journey or are a professional, we hope Accessibility.cool becomes your trusted companion.
		</p>
	</div>
</section>
