type Rgba = { r: number; g: number; b: number; a: number };

const NUMBER = String.raw`(\d+(?:\.\d+)?)`;
const ALPHA = String.raw`(\d+(?:\.\d+)?%?)`;
const COMMA_RGB = new RegExp(
	String.raw`^rgba?\(\s*${NUMBER}\s*,\s*${NUMBER}\s*,\s*${NUMBER}\s*(?:,\s*${ALPHA}\s*)?\)$`,
	'i'
);
const SPACE_RGB = new RegExp(
	String.raw`^rgba?\(\s*${NUMBER}\s+${NUMBER}\s+${NUMBER}\s*(?:/\s*${ALPHA}\s*)?\)$`,
	'i'
);

function parseAlpha(value: string | undefined): number {
	if (value === undefined) return 1;
	const parsed = value.endsWith('%') ? Number.parseFloat(value) / 100 : Number.parseFloat(value);
	return Math.min(1, Math.max(0, parsed));
}

/** Parses the `rgb()` / `rgba()` strings `getComputedStyle` returns; anything else is `null`. */
export function parseCssRgb(value: string): Rgba | null {
	const match = COMMA_RGB.exec(value.trim()) ?? SPACE_RGB.exec(value.trim());
	if (!match) return null;
	const [, r, g, b, a] = match;
	return {
		r: Math.min(255, Number.parseFloat(r)),
		g: Math.min(255, Number.parseFloat(g)),
		b: Math.min(255, Number.parseFloat(b)),
		a: parseAlpha(a)
	};
}

function linearise(channel: number): number {
	const s = channel / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ r, g, b }: Rgba): number {
	return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/**
 * WCAG 2.x contrast ratio between two computed colours. `null` when either colour is not a plain
 * `rgb()` string or is translucent: the ratio would depend on what is behind it, so we do not guess.
 */
export function contrastRatio({
	foreground,
	background
}: {
	foreground: string;
	background: string;
}): number | null {
	const fg = parseCssRgb(foreground);
	const bg = parseCssRgb(background);
	if (!fg || !bg || fg.a < 1 || bg.a < 1) return null;
	const a = relativeLuminance(fg);
	const b = relativeLuminance(bg);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Grade for large text (WCAG 1.4.3 / 1.4.6): AA from 3:1, AAA from 4.5:1. */
export function largeTextGrade(ratio: number): 'AAA' | 'AA' | 'below AA' {
	if (ratio >= 4.5) return 'AAA';
	if (ratio >= 3) return 'AA';
	return 'below AA';
}

/** Truncates (never rounds up) to one decimal so a printed ratio cannot overstate the real one. */
export function formatRatio(ratio: number): string {
	return (Math.floor(ratio * 10) / 10).toFixed(1);
}
