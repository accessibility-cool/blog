<script lang="ts">
	let { browser = undefined, size = undefined } = $props<{
		browser?: boolean;
		size?: number;
	}>();

	const isBrowser = browser ?? typeof window !== 'undefined';

	let defaultSize = $state(160);
	let isTouchDevice = $state(false);
	let svgEl = $state<SVGSVGElement | undefined>(undefined);
	let leftPupil = $state<SVGPathElement | undefined>(undefined);
	let rightPupil = $state<SVGPathElement | undefined>(undefined);
	let animationFrame = $state<number | undefined>(undefined);
	let resizeObserver = $state<ResizeObserver | undefined>(undefined);
	let mounted = $state(false);

	// SVG viewBox size
	const SVG_WIDTH = 656;
	const SVG_HEIGHT = 320;

	// Eye centers in SVG coordinates
	const leftEye = { x: 153.107, y: 159.691 };
	const rightEye = { x: 505.361, y: 159.691 };
	const pupilMaxDist = 32; // max px the pupil can move from center (SVG units)

	// Store current and target positions for smooth animation
	let leftCurrent = $state({ x: 0, y: 0 });
	let rightCurrent = $state({ x: 0, y: 0 });
	let leftTarget = $state({ x: 0, y: 0 });
	let rightTarget = $state({ x: 0, y: 0 });

	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	const setPupilTransform = () => {
		if (!leftPupil || !rightPupil) return;
		leftPupil.setAttribute('transform', `translate(${leftCurrent.x},${leftCurrent.y})`);
		rightPupil.setAttribute('transform', `translate(${rightCurrent.x},${rightCurrent.y})`);
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
		if (!svgEl || isTouchDevice || !mounted) return;
		const rect = svgEl.getBoundingClientRect();
		const svgX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
		const svgY = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT;
		leftTarget = updatePupilTargets(leftEye, { x: svgX, y: svgY });
		rightTarget = updatePupilTargets(rightEye, { x: svgX, y: svgY });
	};

	const animate = () => {
		if (isTouchDevice || !mounted) return;
		// Lerp current position toward target
		leftCurrent.x = lerp(leftCurrent.x, leftTarget.x, 0.18);
		leftCurrent.y = lerp(leftCurrent.y, leftTarget.y, 0.18);
		rightCurrent.x = lerp(rightCurrent.x, rightTarget.x, 0.18);
		rightCurrent.y = lerp(rightCurrent.y, rightTarget.y, 0.18);
		setPupilTransform();
		if (isBrowser && mounted) {
			animationFrame = requestAnimationFrame(animate);
		}
	};

	function setPupilsUpperRight() {
		// 45 degrees up and right: angle = -π/4
		const angle = Math.atan2(-1, 1);
		const x = Math.cos(angle) * pupilMaxDist;
		const y = Math.sin(angle) * pupilMaxDist;
		leftTarget = { x, y };
		rightTarget = { x, y };
		leftCurrent = { x, y };
		rightCurrent = { x, y };
		setPupilTransform();
	}

	// Handle resize for responsive sizing
	const updateSize = () => {
		if (!isBrowser || !mounted) return;
		const width = window.innerWidth;
		defaultSize = width < 640 ? 120 : width < 768 ? 140 : 160;
	};

	// Initialize browser-side functionality after mount
	$effect(() => {
		if (!isBrowser) return;

		// Wait for next tick to ensure DOM is ready
		setTimeout(() => {
			mounted = true;

			// Check for touch device
			isTouchDevice = window.matchMedia('(hover: none)').matches;

			// Set up resize observer
			updateSize();
			resizeObserver = new ResizeObserver(updateSize);
			resizeObserver.observe(document.body);

			if (isTouchDevice) {
				setPupilsUpperRight();
				return;
			}

			// Center pupils initially
			leftCurrent = { x: 0, y: 0 };
			rightCurrent = { x: 0, y: 0 };
			leftTarget = { x: 0, y: 0 };
			rightTarget = { x: 0, y: 0 };
			setPupilTransform();
			animationFrame = requestAnimationFrame(animate);
		}, 0);

		// Cleanup
		return () => {
			mounted = false;
			if (animationFrame) cancelAnimationFrame(animationFrame);
			if (resizeObserver) resizeObserver.disconnect();
		};
	});
</script>

<svelte:window on:mousemove={handleMouseMove} />
<div class="flex justify-center items-center w-full">
	<svg
		bind:this={svgEl}
		class="block mx-auto"
		width={size ?? defaultSize}
		height={((size ?? defaultSize) * SVG_HEIGHT) / SVG_WIDTH}
		viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="Animated eyes following your cursor"
		role="img"
	>
		<!-- Left eye white/dark -->
		<path
			class="fill-black dark:fill-white"
			d="M153.107 0.40918C246.948 0.409218 303.745 64.6161 303.745 159.691C303.745 255.384 246.947 319.591 153.107 319.591C58.6503 319.591 0.000171163 255.384 0 159.691C0 64.6162 58.6502 0.409373 153.107 0.40918Z"
		/>
		<!-- Right eye white/dark -->
		<path
			class="fill-black dark:fill-white"
			d="M505.361 0.40918C599.201 0.40918 656 64.6161 656 159.691C656 255.384 599.201 319.591 505.361 319.591C410.904 319.591 352.254 255.384 352.254 159.691C352.254 64.6162 410.904 0.409322 505.361 0.40918Z"
		/>
		<!-- Left pupil -->
		<path
			bind:this={leftPupil}
			class="pupil fill-white dark:fill-black"
			d="M152.732 100C118.916 100 107 118.787 107 159.676C107 200.933 118.916 219.72 152.732 219.721C186.227 219.721 197.822 200.933 197.822 159.676C197.822 118.787 186.227 100 152.732 100Z"
		/>
		<!-- Right pupil -->
		<path
			bind:this={rightPupil}
			class="pupil fill-white dark:fill-black"
			d="M504.733 100C470.917 100 459 118.787 459 159.676C459 200.933 470.917 219.721 504.733 219.721C538.228 219.721 549.822 200.933 549.822 159.676C549.822 118.787 538.228 100 504.733 100Z"
		/>
	</svg>
</div>

<style>
	.pupil {
		transition: none;
	}
</style>
