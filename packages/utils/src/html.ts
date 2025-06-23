import type { Root } from 'hast';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeSanitize from 'rehype-sanitize';

export const processHtml = (html: string | undefined | null): Root | undefined => {
	if (!html) {
		return undefined;
	}
	return unified().use(rehypeParse, { fragment: true }).use(rehypeSanitize).parse(html) as Root;
};
