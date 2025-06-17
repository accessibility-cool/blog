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
