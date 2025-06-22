import { getPosts } from '@a11y.cool/data';

type SitemapPage = {
	url: string;
	priority: string;
	changefreq: string;
	lastmod?: string;
};

export const GET = async ({ url }: { url: URL }) => {
	const posts = await getPosts();
	const baseUrl = url.origin;

	// Static pages (excluding sensitive pages with personal information)
	const staticPages: SitemapPage[] = [
		{ url: '/', priority: '1.0', changefreq: 'weekly' },
		{ url: '/about', priority: '0.8', changefreq: 'monthly' },
		{ url: '/blog', priority: '0.9', changefreq: 'weekly' }
	];

	// Blog posts
	const blogPages: SitemapPage[] = posts.map((post) => ({
		url: `/blog/${post.slug}`,
		priority: '0.7',
		changefreq: 'monthly',
		lastmod: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined
	}));

	// Combine all pages
	const allPages = [...staticPages, ...blogPages];

	// Generate XML sitemap
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
		}
	});
};
