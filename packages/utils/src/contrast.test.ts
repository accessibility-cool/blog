import { describe, expect, it } from 'vitest';
import { contrastRatio, formatRatio, largeTextGrade, parseCssRgb } from './contrast';

describe('parseCssRgb', () => {
	it('parses legacy comma syntax', () => {
		expect(parseCssRgb('rgb(0, 113, 227)')).toEqual({ r: 0, g: 113, b: 227, a: 1 });
		expect(parseCssRgb('rgba(0, 113, 227, 0.5)')).toEqual({ r: 0, g: 113, b: 227, a: 0.5 });
	});

	it('parses modern space syntax with optional alpha', () => {
		expect(parseCssRgb('rgb(0 113 227)')).toEqual({ r: 0, g: 113, b: 227, a: 1 });
		expect(parseCssRgb('rgb(0 113 227 / 0.5)')).toEqual({ r: 0, g: 113, b: 227, a: 0.5 });
	});

	it('returns null for anything else', () => {
		expect(parseCssRgb('oklab(0.5 0 0)')).toBeNull();
		expect(parseCssRgb('#fff')).toBeNull();
		expect(parseCssRgb('')).toBeNull();
	});
});

describe('contrastRatio', () => {
	it('is 21 for black on white', () => {
		expect(
			contrastRatio({ foreground: 'rgb(0, 0, 0)', background: 'rgb(255, 255, 255)' })
		).toBeCloseTo(21, 5);
	});

	it('measures white on the brand blue as 4.6 (4.697, truncated not rounded)', () => {
		const ratio = contrastRatio({
			foreground: 'rgb(255, 255, 255)',
			background: 'rgb(0, 113, 227)'
		});
		expect(ratio).not.toBeNull();
		expect(formatRatio(ratio ?? 0)).toBe('4.6');
	});

	it('is symmetric', () => {
		const a = 'rgb(255, 255, 255)';
		const b = 'rgb(0, 113, 227)';
		expect(contrastRatio({ foreground: a, background: b })).toBe(
			contrastRatio({ foreground: b, background: a })
		);
	});

	it('returns null for translucent colours', () => {
		expect(
			contrastRatio({ foreground: 'rgba(0, 0, 0, 0.5)', background: 'rgb(255, 255, 255)' })
		).toBeNull();
		expect(
			contrastRatio({ foreground: 'rgb(0, 0, 0)', background: 'rgba(255, 255, 255, 0.5)' })
		).toBeNull();
	});

	it('returns null for unparseable colours', () => {
		expect(
			contrastRatio({ foreground: 'oklab(0.5 0 0)', background: 'rgb(255, 255, 255)' })
		).toBeNull();
	});
});

describe('largeTextGrade', () => {
	it('grades against the large-text thresholds', () => {
		expect(largeTextGrade(4.5)).toBe('AAA');
		expect(largeTextGrade(4.49)).toBe('AA');
		expect(largeTextGrade(3)).toBe('AA');
		expect(largeTextGrade(2.99)).toBe('below AA');
	});
});

describe('formatRatio', () => {
	it('truncates to one decimal rather than rounding up', () => {
		expect(formatRatio(4.49)).toBe('4.4');
		expect(formatRatio(17.56)).toBe('17.5');
		expect(formatRatio(21)).toBe('21.0');
	});
});
