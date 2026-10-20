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
 * `href` if it is safe to put in an `<a>`, otherwise `null`.
 *
 * Studio-side URL validation warns editors but does not constrain what the
 * dataset can hold, so rich-text links are re-checked at render time: site
 * paths, fragments, and http(s)/mailto/tel only — never `javascript:`.
 */
export const safeHref = (href: unknown): string | null => {
	if (typeof href !== 'string') return null;
	const value = href.trim();
	if (!value) return null;
	// Site-relative path or in-page fragment — but not protocol-relative `//host`
	if ((value.startsWith('/') && !value.startsWith('//')) || value.startsWith('#')) return value;
	try {
		const { protocol } = new URL(value);
		return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol) ? value : null;
	} catch {
		return null;
	}
};

/** Plain text of a Portable Text block's spans — e.g. for a heading's anchor id. */
export const blockText = (block: { children?: ReadonlyArray<unknown> }): string =>
	(block.children ?? [])
		.map((child) =>
			child && typeof child === 'object' && 'text' in child && typeof child.text === 'string'
				? child.text
				: ''
		)
		.join('');
