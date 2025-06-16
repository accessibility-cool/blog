<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	export let browser: boolean | undefined = undefined;
	const isBrowser = browser ?? typeof window !== 'undefined';

	export let size: number = 160; // default smaller size, can be overridden
	let svgEl: SVGSVGElement;
	let leftPupil: SVGPathElement;
	let rightPupil: SVGPathElement;

	// SVG viewBox size
	const SVG_WIDTH = 656;
	const SVG_HEIGHT = 320;

	// Eye centers in SVG coordinates (from your SVG)
	const leftEye = { x: 191.572, y: 132.838 };
	const rightEye = { x: 543.826, y: 132.838 };
	const pupilMaxDist = 32; // max px the pupil can move from center (SVG units)

	// Store current and target positions for smooth animation
	let leftCurrent = { x: 0, y: 0 };
	let rightCurrent = { x: 0, y: 0 };
	let leftTarget = { x: 0, y: 0 };
	let rightTarget = { x: 0, y: 0 };
	let animationFrame: number;

	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	const setPupilTransform = () => {
		leftPupil?.setAttribute('transform', `translate(${leftCurrent.x},${leftCurrent.y})`);
		rightPupil?.setAttribute('transform', `translate(${rightCurrent.x},${rightCurrent.y})`);
	};

	const updatePupilTargets = (eye: { x: number; y: number }, mouse: { x: number; y: number }) => {
		const dx = mouse.x - eye.x;
		const dy = mouse.y - eye.y;
		const angle = Math.atan2(dy, dx);
		const dist = Math.min(Math.sqrt(dx * dx + dy * dy), pupilMaxDist);
		return {
			x: Math.cos(angle) * dist,
			y: Math.sin(angle) * dist
		};
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!svgEl) return;
		const rect = svgEl.getBoundingClientRect();
		const svgX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
		const svgY = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT;
		leftTarget = updatePupilTargets(leftEye, { x: svgX, y: svgY });
		rightTarget = updatePupilTargets(rightEye, { x: svgX, y: svgY });
	};

	const animate = () => {
		// Lerp current position toward target
		leftCurrent.x = lerp(leftCurrent.x, leftTarget.x, 0.18);
		leftCurrent.y = lerp(leftCurrent.y, leftTarget.y, 0.18);
		rightCurrent.x = lerp(rightCurrent.x, rightTarget.x, 0.18);
		rightCurrent.y = lerp(rightCurrent.y, rightTarget.y, 0.18);
		setPupilTransform();
		if (isBrowser) {
			animationFrame = requestAnimationFrame(animate);
		}
	};

	onMount(() => {
		// Center pupils initially
		leftCurrent = { x: 0, y: 0 };
		rightCurrent = { x: 0, y: 0 };
		leftTarget = { x: 0, y: 0 };
		rightTarget = { x: 0, y: 0 };
		setPupilTransform();
		if (isBrowser) {
			animationFrame = requestAnimationFrame(animate);
		}
	});
	onDestroy(() => {
		if (isBrowser) {
			cancelAnimationFrame(animationFrame);
		}
	});
</script>

<svelte:window on:mousemove={handleMouseMove} />
<div class="flex justify-center items-center w-full">
	<svg
		bind:this={svgEl}
		class="block mx-auto"
		width={size}
		height={(size * SVG_HEIGHT) / SVG_WIDTH}
		viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Animated eyes following your cursor"
		role="img"
	>
		<!-- Left eye white/dark -->
		<path
			class="fill-black dark:fill-white"
			d="M153.107 0.40918C246.948 0.409218 303.745 64.6161 303.745 159.691C303.745 255.384 246.947 319.591 153.107 319.591C58.6503 319.591 0.000171163 255.384 0 159.691C0 64.6162 58.6502 0.409378 153.107 0.40918Z"
		/>
		<!-- Right eye white/dark -->
		<path
			class="fill-black dark:fill-white"
			d="M505.361 0.40918C599.201 0.40918 656 64.6161 656 159.691C656 255.384 599.201 319.591 505.361 319.591C410.904 319.591 352.254 255.384 352.254 159.691C352.254 64.6162 410.904 0.409322 505.361 0.40918Z"
		/>
		<!-- Left pupil (egg shape, matches inner path) -->
		<path
			bind:this={leftPupil}
			class="pupil fill-white dark:fill-black"
			d="M191.572 73.1621C157.756 73.1623 145.839 91.9488 145.839 132.838C145.839 174.095 157.756 192.883 191.572 192.883C225.067 192.883 236.661 174.096 236.661 132.838C236.661 91.9486 225.067 73.1621 191.572 73.1621Z"
		/>
		<!-- Right pupil (egg shape, matches inner path) -->
		<path
			bind:this={rightPupil}
			class="pupil fill-white dark:fill-black"
			d="M543.826 73.1621C510.009 73.1622 498.093 91.9487 498.093 132.838C498.093 174.095 510.009 192.883 543.826 192.883C577.321 192.883 588.915 174.095 588.915 132.838C588.915 91.9488 577.321 73.1623 543.826 73.1621Z"
		/>
	</svg>
</div>

<style>
	.pupil {
		transition: none;
	}
</style>
