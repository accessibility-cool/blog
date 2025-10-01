export const slugify = (str: string): string => {
	str = str.replace(/^\s+|\s+$/g, '');
	str = str.toLowerCase();
	str = str
		.replace(/[^a-z0-9 -]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
	return str;
};

export const formatDate = (date: string): string => {
	const d = new Date(date);
	return d.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
};

export const shortenExcerpt = (text: string, wordCount: number = 30): string => {
	if (!text) return '';
	const words = text.split(/\s+/);
	return words.length > wordCount ? words.slice(0, wordCount).join(' ') + '…' : text;
};

type CopyCodeOptions = {
	onCopy?: () => void;
	onError?: (error: Error) => void;
	timeout?: number;
};

export const copyCode = async (
	text: string,
	{ onCopy, onError, timeout = 2000 }: CopyCodeOptions = {}
): Promise<void> => {
	if (!text) return;

	try {
		await navigator.clipboard.writeText(text);
		onCopy?.();

		return new Promise((resolve) => {
			setTimeout(resolve, timeout);
		});
	} catch (error) {
		onError?.(error as Error);
	}
};

export const getLangLabel = (lang: string) => {
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
};

/**
 * Builds an image URL for Directus assets with format detection
 * @param imageId - The Directus file ID
 * @param apiUrl - The base API URL (from VITE_API_URL)
 * @param quality - Image quality (default: 80)
 * @returns The complete image URL with format parameters
 */
export const buildImageUrl = (imageId: string, apiUrl: string, quality: number = 80): string => {
	// Check if browser supports AVIF format
	const supportsAvif =
		typeof window !== 'undefined' &&
		window.HTMLCanvasElement &&
		document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;

	// Check if browser supports WebP format
	const supportsWebp =
		typeof window !== 'undefined' &&
		window.HTMLCanvasElement &&
		document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

	// Determine the best format to use
	let format = 'jpg'; // fallback
	if (supportsAvif) {
		format = 'avif';
	} else if (supportsWebp) {
		format = 'webp';
	}

	// Build the URL with the format
	return `${apiUrl}/assets/${imageId}?quality=${quality}&format=${format}`;
};
