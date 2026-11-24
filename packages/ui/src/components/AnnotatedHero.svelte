<script lang="ts">
	import { contrastRatio, formatRatio, largeTextGrade, parseCssRgb } from '@a11y.cool/utils';
	import type { IconComponentProps } from 'phosphor-svelte';
	import { ArrowLineRightIcon, CircleHalfIcon, TextAaIcon, TextHIcon } from 'phosphor-svelte';
	import type { Component } from 'svelte';
	import Button from './Button.svelte';

	type Annotation = 'heading' | 'contrast' | 'resize' | 'target' | 'focus';
	type ContrastReading = { ratio: string; grade: ReturnType<typeof largeTextGrade> };

	interface Props {
		headline: string;
		highlight?: string | null;
		description?: string | null;
		cta?: { label: string; href: string } | null;
	}

	let { headline, highlight = null, description = null, cta = null }: Props = $props();

	// The annotation layer is an invisible copy of the text column laid over it, so every chip can sit
	// next to its target with CSS alone while the real h1, paragraph and link stay free of decorative
	// markup. Both copies share these strings — keep them identical or the chips drift off target.
	const columnClass = 'xl:max-w-[66%] xl:pt-28';
	// 72px from `xl` to `2xl`: at 96px a two-word phrase no longer fits a 66% column at 1280px and
	// the selection box breaks across lines. `!` because typography.css is unlayered and beats utilities.
	const headlineClass = 'text-teasered text-balance xl:text-7xl! 2xl:text-8xl!';
	// The phrase is one box that never extends past the column: a phrase wider than the column wraps
	// inside its own rectangle. The group glues it to trailing punctuation and to chip #3's anchor, so
	// the chip always starts at the box's right edge, inside the column, with the gutter to its right.
	const groupClass = 'xl:whitespace-nowrap';
	const phraseClass = 'xl:inline-block xl:max-w-full xl:whitespace-normal';
	// Square handles centred on the selection box's corners.
	const handles = [
		'-top-1 -left-1',
		'-top-1 -right-1',
		'-bottom-1 -left-1',
		'-right-1 -bottom-1'
	];
	const descriptionClass = 'mt-6 max-w-2xl text-lg xl:mt-10';
	const ctaRowClass = 'mt-8 xl:mt-12';

	// Literal strings so Tailwind generates them; motion-safe so reduced motion never animates.
	const motion: Record<Annotation, { leader: string; chip: string }> = {
		heading: {
			leader: 'motion-safe:[animation-delay:400ms]',
			chip: 'motion-safe:[animation-delay:500ms]'
		},
		contrast: {
			leader: 'motion-safe:[animation-delay:550ms]',
			chip: 'motion-safe:[animation-delay:650ms]'
		},
		resize: {
			leader: 'motion-safe:[animation-delay:700ms]',
			chip: 'motion-safe:[animation-delay:800ms]'
		},
		target: {
			leader: 'motion-safe:[animation-delay:850ms]',
			chip: 'motion-safe:[animation-delay:950ms]'
		},
		focus: {
			leader: 'motion-safe:[animation-delay:1000ms]',
			chip: 'motion-safe:[animation-delay:1100ms]'
		}
	};

	// Editorial cap (mirrors the Studio's `introHighlight` validation): a longer phrase is ignored and
	// chip #3 attaches to the end of the headline instead.
	const HIGHLIGHT_MAX_LENGTH = 24;

	// Split once around the first occurrence of the phrase. Any punctuation glued to its end stays on
	// its line; at `xl` the rest of the headline starts a new line so chip #3 never sits on text.
	const parts = $derived.by(() => {
		const index = highlight ? headline.indexOf(highlight) : -1;
		if (!highlight || highlight.length > HIGHLIGHT_MAX_LENGTH || index < 0) {
			return null;
		}
		const [, trailing = '', after = ''] =
			/^(\S*)([\s\S]*)$/.exec(headline.slice(index + highlight.length)) ?? [];
		return { before: headline.slice(0, index), phrase: highlight, trailing, after };
	});

	// Without a phrase, chip #3's anchor shares a no-wrap span with the last word: a trailing empty
	// inline is otherwise free to land on a line of its own (Chrome does this under text-wrap: balance).
	const tail = $derived.by(() => {
		const [, lead = '', glued = ''] = /^([\s\S]*?)(\S*)$/.exec(headline) ?? [];
		return { lead, glued };
	});

	let heading = $state<HTMLHeadingElement>();
	let ctaRow = $state<HTMLDivElement>();
	// `undefined` until measured; `null` when the colours can't be measured honestly (chip omitted).
	let contrast = $state<ContrastReading | null>();
	let targetPx = $state<number | null>(null);

	function opaqueBackground(element: Element): string {
		for (let node: Element | null = element; node; node = node.parentElement) {
			const color = getComputedStyle(node).backgroundColor;
			if (parseCssRgb(color)?.a !== 0) {
				return color;
			}
		}
		return getComputedStyle(document.body).backgroundColor;
	}

	$effect(() => {
		const element = heading;
		if (!element) {
			return;
		}
		const scheme = matchMedia('(prefers-color-scheme: dark)');
		let frame = 0;
		const measure = () => {
			cancelAnimationFrame(frame);
			// After the scheme flips the tokens; the next frame has the new computed colours.
			frame = requestAnimationFrame(() => {
				const ratio = contrastRatio({
					foreground: getComputedStyle(element).color,
					background: opaqueBackground(element)
				});
				contrast =
					ratio === null
						? null
						: { ratio: formatRatio(ratio), grade: largeTextGrade(ratio) };
			});
		};
		measure();
		scheme.addEventListener('change', measure);

		const target = ctaRow?.firstElementChild;
		const observer = new ResizeObserver(() => {
			targetPx = target instanceof HTMLElement ? target.offsetHeight : null;
		});
		if (target) {
			observer.observe(target);
		} else {
			targetPx = null;
		}

		return () => {
			cancelAnimationFrame(frame);
			scheme.removeEventListener('change', measure);
			observer.disconnect();
		};
	});

	const meetsTarget = $derived(targetPx !== null && targetPx >= 24);

	// One sentence per annotation that renders; the measured ones fall back to value-free wording
	// (their chip is absent until then) and drop out entirely if the measurement is impossible.
	const facts = $derived.by(() => {
		const list: { id: Annotation; text: string }[] = [
			{ id: 'heading', text: 'The headline is this page’s only level-one heading (h1).' }
		];
		if (contrast === undefined) {
			list.push({
				id: 'contrast',
				text: 'The headline’s text contrast is measured live in your browser and listed here once known.'
			});
		} else if (contrast) {
			const verdict =
				contrast.grade === 'below AA'
					? 'falls below WCAG AA'
					: `meets WCAG ${contrast.grade}`;
			list.push({
				id: 'contrast',
				text: `The headline’s text contrast is ${contrast.ratio} to 1, which ${verdict} for large text.`
			});
		}
		list.push({
			id: 'resize',
			text: 'The headline can be zoomed to 200% without losing content (WCAG 1.4.4, Resize Text).'
		});
		if (cta) {
			list.push({
				id: 'target',
				text:
					targetPx === null
						? 'The button’s height is measured live in your browser against the 24-pixel minimum target size (WCAG 2.5.8).'
						: `The “${cta.label}” button is ${targetPx} pixels tall, which ${meetsTarget ? 'meets' : 'is under'} the 24-pixel minimum target size (WCAG 2.5.8).`
			});
			list.push({
				id: 'focus',
				text: 'The button shows a 2-pixel focus ring when reached with the keyboard (WCAG 2.4.7, Focus Visible).'
			});
		}
		return list;
	});
</script>

{#snippet chip(id: Annotation, Icon: Component<IconComponentProps>, label: string)}
	<span
		class="inline-flex items-center gap-1.5 rounded-md border border-border-input bg-background-alt px-2 py-1.5 font-mono text-xs leading-none font-normal tracking-normal whitespace-nowrap text-foreground-alt ring-1 ring-border-card ring-offset-2 ring-offset-background motion-safe:animate-annotation-in {motion[
			id
		].chip}"
	>
		<Icon class="size-3.5 shrink-0" />{label}
	</span>
{/snippet}

{#snippet node(id: Annotation)}
	<span
		class="size-[7px] shrink-0 rounded-full border border-foreground-alt bg-background motion-safe:animate-annotation-in {motion[
			id
		].chip}"
	></span>
{/snippet}

{#snippet above(
	id: Annotation,
	Icon: Component<IconComponentProps>,
	label: string,
	position: string
)}
	<span
		data-annotation={id}
		class="visible absolute bottom-full mb-2.5 flex flex-col items-start {position}"
	>
		{@render chip(id, Icon, label)}
		<span class="ml-3 flex flex-col items-center">
			<span
				class="w-0 origin-top border-l border-dashed border-foreground-alt motion-safe:animate-leader-draw-y {motion[
					id
				].leader} {id === 'heading' ? 'h-12' : 'h-6'}"
			></span>
			{@render node(id)}
		</span>
	</span>
{/snippet}

{#snippet beside(
	id: Annotation,
	Icon: Component<IconComponentProps>,
	label: string,
	position: string
)}
	<span
		data-annotation={id}
		class="visible absolute top-1/2 flex -translate-y-1/2 items-center {position}"
	>
		{@render node(id)}
		<span
			class="w-10 origin-left border-t border-dashed border-foreground-alt motion-safe:animate-leader-draw-x {motion[
				id
			].leader}"
		></span>
		{@render chip(id, Icon, label)}
	</span>
{/snippet}

{#snippet resizeChip(position: string)}
	{@render beside('resize', TextAaIcon, 'text resizes to 200% · 1.4.4', position)}
{/snippet}

<div class="relative isolate">
	<div class={columnClass}>
		<h1 bind:this={heading} class={headlineClass}>
			{#if parts}{parts.before}<span class={groupClass}>
					<span class={phraseClass}>{parts.phrase}</span>{parts.trailing}
				</span>{#if parts.after}<br
						class="hidden xl:inline"
					/>{/if}{parts.after}{:else}{headline}{/if}
		</h1>
		{#if description}
			<p class={descriptionClass}>{description}</p>
		{/if}
		{#if cta}
			<div bind:this={ctaRow} class={ctaRowClass}>
				<Button href={cta.href} size="lg">{cta.label}</Button>
			</div>
		{/if}
		<details data-testid="hero-facts" class="mt-8">
			<summary class="w-fit cursor-pointer font-mono text-xs text-foreground-alt">
				About this header
			</summary>
			<ul class="mt-3 max-w-2xl list-disc pl-5 text-sm text-foreground-alt">
				{#each facts as fact (fact.id)}
					<li data-fact={fact.id}>{fact.text}</li>
				{/each}
			</ul>
		</details>
	</div>

	<!-- Decorative: the same facts are in the disclosure above, the only place assistive tech meets them.
	     Behind the text so the tint sits under the glyphs — except in forced colours, where the
	     text backplate would paint over it. -->
	<div
		data-testid="hero-annotations"
		aria-hidden="true"
		class="pointer-events-none invisible absolute inset-0 -z-10 hidden select-none xl:block print:hidden forced-colors:z-0"
	>
		<div class={columnClass}>
			<div class="relative font-highlight tracking-wide {headlineClass}">
				{#if parts}{parts.before}<span class={groupClass}>
						<span class="relative {phraseClass}">
							{parts.phrase}<span
								class="visible absolute -inset-x-1.5 inset-y-0 rounded-[2px] border border-primary bg-primary/8 forced-colors:bg-transparent"
							>
								{#each handles as corner (corner)}
									<span
										class="absolute size-[7px] border border-primary bg-background {corner}"
									></span>
								{/each}
							</span>
						</span>{parts.trailing}<span class="relative">
							{@render resizeChip('left-4')}
						</span>
					</span>{#if parts.after}<br />{parts.after}{/if}{:else}{tail.lead}<span
						class="whitespace-nowrap"
					>
						{tail.glued}<span class="relative">{@render resizeChip('left-2')}</span>
					</span>{/if}
				{@render above('heading', TextHIcon, '<h1> · level 1', 'left-0')}
				{#if contrast}
					{@render above(
						'contrast',
						CircleHalfIcon,
						`contrast ${contrast.ratio}:1 · ${contrast.grade}`,
						'left-[38%]'
					)}
				{/if}
			</div>
			{#if description}
				<p class={descriptionClass}>{description}</p>
			{/if}
			{#if cta}
				<div class={ctaRowClass}>
					<span
						class="relative inline-flex min-h-11 items-center justify-center rounded-full border px-8 py-2.5 text-center text-sm font-medium"
					>
						{cta.label}
						<span
							class="visible absolute -inset-1 rounded-full border border-dashed border-border-input-hover motion-safe:animate-annotation-in {motion
								.focus.leader}"
						></span>
						{#if targetPx !== null}
							<span
								data-annotation="target"
								class="visible absolute inset-y-0 -left-3.5 w-0"
							>
								<span
									class="absolute inset-y-0 -left-1 w-2 origin-top border-y border-annotation-measure motion-safe:animate-leader-draw-y {motion
										.target.leader}"
								>
									<span
										class="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-annotation-measure"
									></span>
								</span>
								<span
									class="absolute bottom-full left-3.5 mb-3 font-mono text-xs whitespace-nowrap text-annotation-measure motion-safe:animate-annotation-in {motion
										.target.chip}"
								>
									{targetPx}px {meetsTarget ? '≥' : '<'} 24px · target size 2.5.8
								</span>
							</span>
						{/if}
						<span class="absolute top-1/2 left-full ml-1 w-0">
							{@render beside(
								'focus',
								ArrowLineRightIcon,
								'focus-visible · 2px ring',
								'left-0'
							)}
						</span>
					</span>
				</div>
			{/if}
		</div>
	</div>
</div>
