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
