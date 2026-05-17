export interface AnimationOptions {
	delay?: number;
	duration?: number;
	threshold?: number;
	rootMargin?: string;
	animationClass?: string;
	triggerOnMount?: boolean;
}

export interface AnimationState {
	isVisible: boolean;
	className: string;
}

// Animation class mappings to CSS keyframes
export const ANIMATION_CLASSES = {
	'fly-in-up': 'animate-fly-in-up',
	'fly-in-up-fast': 'animate-fly-in-up-fast',
	'fade-in': 'animate-fade-in',
	'fade-out': 'animate-fade-out',
	'scale-in': 'animate-scale-in',
	'scale-out': 'animate-scale-out',
	'enter-from-left': 'animate-enter-from-left',
	'enter-from-right': 'animate-enter-from-right',
	'exit-to-left': 'animate-exit-to-left',
	'exit-to-right': 'animate-exit-to-right'
} as const;

export type AnimationType = keyof typeof ANIMATION_CLASSES;

/** CSS class that hides the element before its enter animation (use on the same node as `use:animate`). */
export const getAnimateInitialClass = (animationClass: string = 'fly-in-up'): string =>
	getInitialClass(animationClass);

const getInitialClass = (animClass: string): string => {
	switch (animClass) {
		case 'fade-in':
		case 'fade-out':
			return 'animate-initial-fade';
		case 'scale-in':
		case 'scale-out':
			return 'animate-initial-scale';
		case 'enter-from-left':
		case 'exit-to-left':
			return 'animate-initial-left';
		case 'enter-from-right':
		case 'exit-to-right':
			return 'animate-initial-right';
		default:
			return 'animate-initial';
	}
};

const playAnimation = (node: HTMLElement, initialClass: string, cssClass: string) => {
	node.classList.remove(initialClass);
	node.classList.add(cssClass);
};

const ensureInitialClass = (node: HTMLElement, initialClass: string) => {
	if (!node.classList.contains(initialClass)) {
		node.classList.add(initialClass);
	}
};

const isInViewport = (node: HTMLElement): boolean => {
	const rect = node.getBoundingClientRect();
	return rect.top < window.innerHeight && rect.bottom > 0;
};

const scheduleAnimation = (
	node: HTMLElement,
	initialClass: string,
	cssClass: string,
	delay: number,
	onStart?: () => void
) => {
	const run = () => {
		onStart?.();
		playAnimation(node, initialClass, cssClass);
	};

	if (delay > 0) {
		setTimeout(run, delay);
	} else {
		requestAnimationFrame(run);
	}
};

const prefersReducedMotion = (): boolean =>
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const createAnimation = (options: AnimationOptions = {}) => {
	const {
		delay = 0,
		duration = 600,
		threshold = 0.1,
		rootMargin = '0px 0px -50px 0px',
		animationClass = 'fly-in-up',
		triggerOnMount = false
	} = options;

	let element: HTMLElement | undefined;
	let isVisible = false;
	let hasAnimated = false;

	// Get the corresponding CSS class for the animation
	const cssClass =
		ANIMATION_CLASSES[animationClass as AnimationType] || ANIMATION_CLASSES['fly-in-up'];

	const initialClass = getInitialClass(animationClass);

	const className = isVisible ? cssClass : initialClass;

	const updateClassName = () => {
		return isVisible ? cssClass : initialClass;
	};

	const setElement = (el: HTMLElement) => {
		element = el;
		if (typeof window === 'undefined' || !element) return;
		if (prefersReducedMotion()) return;

		ensureInitialClass(element, initialClass);

		const startAnimation = () => {
			if (hasAnimated || !element) return;
			isVisible = true;
			hasAnimated = true;
			scheduleAnimation(element, initialClass, cssClass, delay);
		};

		if (triggerOnMount || isInViewport(element)) {
			startAnimation();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasAnimated) {
						startAnimation();
					}
				});
			},
			{ threshold, rootMargin }
		);

		observer.observe(element);
		return () => observer.disconnect();
	};

	const trigger = () => {
		isVisible = true;
		hasAnimated = true;
		if (element) {
			element.classList.remove(initialClass);
			element.classList.add(cssClass);
		}
	};

	return {
		setElement,
		trigger,
		get className() {
			return updateClassName();
		}
	};
};

export const createStaggeredAnimation = (
	count: number,
	baseDelay = 0,
	interval = 100,
	animationClass: AnimationType = 'fly-in-up',
	triggerOnMount = false
) => {
	const animations = Array.from({ length: count }, (_, index) =>
		createAnimation({
			delay: baseDelay + index * interval,
			animationClass,
			triggerOnMount
		})
	);

	return {
		animations,
		setElements: (elements: HTMLElement[]) => {
			elements.forEach((el, index) => {
				if (animations[index]) {
					animations[index].setElement(el);
				}
			});
		},
		trigger: () => {
			animations.forEach((anim) => anim.trigger());
		}
	};
};

// Svelte action for easy application. Pair with getAnimateInitialClass() on the same element
// so the hidden state is present in SSR HTML before hydration.
export const animate = (node: HTMLElement, options: AnimationOptions = {}) => {
	const {
		delay = 0,
		threshold = 0.1,
		rootMargin = '0px 0px -50px 0px',
		animationClass = 'fly-in-up',
		triggerOnMount = false
	} = options;

	let hasAnimated = false;
	let observer: IntersectionObserver | undefined;

	const cssClass =
		ANIMATION_CLASSES[animationClass as AnimationType] || ANIMATION_CLASSES['fly-in-up'];
	const initialClass = getInitialClass(animationClass);

	ensureInitialClass(node, initialClass);

	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return { update: () => {}, destroy: () => {} };
	}

	const startAnimation = () => {
		if (hasAnimated) return;
		hasAnimated = true;
		observer?.disconnect();
		scheduleAnimation(node, initialClass, cssClass, delay);
	};

	if (triggerOnMount || isInViewport(node)) {
		startAnimation();
	} else {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						startAnimation();
					}
				});
			},
			{ threshold, rootMargin }
		);
		observer.observe(node);
	}

	return {
		update: (newOptions: AnimationOptions) => {
			const newAnimationClass = newOptions.animationClass || animationClass;
			const newCssClass =
				ANIMATION_CLASSES[newAnimationClass as AnimationType] || cssClass;
			const newInitialClass = getInitialClass(newAnimationClass);

			if (newCssClass !== cssClass && hasAnimated) {
				node.classList.remove(cssClass, initialClass);
				node.classList.add(newCssClass, newInitialClass);
			}
		},
		destroy: () => {
			observer?.disconnect();
		}
	};
};

// Utility function to create custom animation classes
export const createCustomAnimation = (
	name: string,
	keyframes: string,
	options: { duration?: string; timing?: string; delay?: string } = {}
) => {
	const { duration = '0.6s', timing = 'ease-out', delay = '0s' } = options;

	// This would typically be used with a CSS-in-JS solution or by injecting styles
	// For now, we'll return a class name that should be defined in CSS
	return `animate-${name}`;
};
