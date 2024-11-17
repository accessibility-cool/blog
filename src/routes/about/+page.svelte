<script>
	import { MetaTags } from 'svelte-meta-tags';
	import { envVariables } from '$lib/envVariables';
	import { blogMetaData } from '$lib/blogMetaData';

	const meta = {
		title: `About | ${blogMetaData.blogTitle}`,
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
	<h1>About</h1>
	<p>Welcome to our blog!</p>
	<p>
		Our expertise extends to providing guidance and advice on promoting good inclusive design
		practices and developing accessible and compliant web and mobile applications.
	</p>
</div>
