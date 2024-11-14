<script>
	import { MetaTags } from 'svelte-meta-tags';
	import { envVariables } from '$lib/envVariables';
	import { blogMetaData } from '$lib/blogMetaData';

	const meta = {
		title: `Privacy Policy | ${blogMetaData.blogTitle}`,
		description: blogMetaData.description,
		url: envVariables.basePath,
		siteName: blogMetaData.blogTitle,
		image: {
			url: `${envVariables.basePath}/background.jpeg`,
			width: 1000,
			height: 523,
			alt: 'image'
		}
	};
</script>

<MetaTags
	title={meta.title}
	description={meta.description}
	canonical={meta.url}
	openGraph={{
		description: meta.description,
		images: [
			{
				...meta.image
			}
		],
		siteName: meta.siteName,
		title: meta.title,
		type: 'website',
		url: meta.url
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: meta.title,
		description: meta.description,
		image: meta.image.url,
		imageAlt: meta.image.alt
	}}
/>
<div class="about-container">
	<h1>Privacy Policy</h1>
	<p>Add here...</p>
</div>
