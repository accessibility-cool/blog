/**
 * `llms.txt`, as a pure function.
 *
 * A proposed convention, not a standard — cheap insurance and a tidy
 * machine-readable index of the site, not a ranking lever. The JSON-LD graph is
 * what moves answer engines. There is no robots.txt directive for it; `Llms:`
 * is not a real directive.
 */

export interface LlmsLink {
	/** Link text. Escaped — see `escapeLinkText`. */
	title: string;
	/** Root-relative, e.g. `/blog/focus-order`. Rendered absolute against `origin`. */
	path: string;
	/** The one-line description, if the document has one. */
	summary?: string | null;
}

export interface LlmsSection {
	/** An `##` heading. */
	heading: string;
	links: LlmsLink[];
}

export interface LlmsDocument {
	/** The `#` heading — the site's name. */
	title: string;
	/** The `>` blockquote directly under it: one sentence saying what this is. */
	summary: string;
	/** Free prose between the summary and the first section. Optional. */
	notes?: string[];
	sections: LlmsSection[];
}

/**
 * Markdown link text, made safe to put between brackets.
 *
 * `]` is the character that matters: a post titled `ARIA [part 2]` renders as
 * `[ARIA [part 2]](/blog/…)`, and every Markdown parser closes the link at the
 * FIRST unescaped `]` — so the link text becomes "ARIA [part 2" and the rest of the
 * line becomes literal text with a stray URL in it. `[` is escaped alongside it
 * for symmetry; a lone opening bracket is harmless, but a rule with an exception
 * is a rule nobody applies consistently.
 *
 * Newlines collapse because a title is one line by definition, and Sanity does
 * not stop an editor pasting one in.
 */
export function escapeLinkText(value: string): string {
	return value
		.replace(/[[\]]/g, (char) => `\\${char}`)
		.replace(/\s+/g, ' ')
		.trim();
}

/** Collapse a summary to one line; drop it entirely if there is nothing left. */
function cleanSummary(value: string | null | undefined): string | undefined {
	const collapsed = value?.replace(/\s+/g, ' ').trim();
	return collapsed ? collapsed : undefined;
}

/**
 * Render the document.
 *
 * The shape is the convention's: one `#` title, one `>` summary, optional prose,
 * then `##` sections of `- [title](url): summary` bullets. A section with no
 * links is omitted rather than rendered empty — an empty heading reads as a
 * broken generator.
 *
 * @param origin Absolute, no trailing slash — e.g. `https://accessibility.cool`.
 */
export function renderLlmsTxt(origin: string, doc: LlmsDocument): string {
	const base = origin.replace(/\/+$/, '');
	const lines: string[] = [
		`# ${doc.title}`,
		'',
		`> ${cleanSummary(doc.summary) ?? ''}`.trimEnd()
	];

	for (const note of doc.notes ?? []) {
		const cleaned = cleanSummary(note);
		if (cleaned) lines.push('', cleaned);
	}

	for (const section of doc.sections) {
		if (!section.links.length) continue;
		lines.push('', `## ${section.heading}`, '');
		for (const link of section.links) {
			const summary = cleanSummary(link.summary);
			const bullet = `- [${escapeLinkText(link.title)}](${base}${link.path})`;
			lines.push(summary ? `${bullet}: ${summary}` : bullet);
		}
	}

	return `${lines.join('\n')}\n`;
}
