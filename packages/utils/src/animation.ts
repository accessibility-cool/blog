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

	// Get initial state class based on animation type
	const getInitialClass = (animClass: string) => {
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

	const initialClass = getInitialClass(animationClass);

	const className = isVisible ? cssClass : initialClass;

	const updateClassName = () => {
		return isVisible ? cssClass : initialClass;
	};

	const setElement = (el: HTMLElement) => {
		element = el;
		if (typeof window === 'undefined' || !element) return;

		// Apply initial state
		element.classList.add(initialClass);

		if (triggerOnMount) {
			setTimeout(() => {
				isVisible = true;
				hasAnimated = true;
				element!.classList.remove(initialClass);
				element!.classList.add(cssClass);
			}, delay);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasAnimated) {
						isVisible = true;
						hasAnimated = true;
						element!.classList.remove(initialClass);
						element!.classList.add(cssClass);
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

// Svelte action for easy application
export const animate = (node: HTMLElement, options: AnimationOptions = {}) => {
	const {
		delay = 0,
		threshold = 0.1,
		rootMargin = '0px 0px -50px 0px',
		animationClass = 'fly-in-up',
		triggerOnMount = false
	} = options;

	let isVisible = false;
	let hasAnimated = false;

	// Get the corresponding CSS class for the animation
	const cssClass =
		ANIMATION_CLASSES[animationClass as AnimationType] || ANIMATION_CLASSES['fly-in-up'];

	// Apply initial state based on animation type
	const getInitialClass = (animClass: string) => {
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

	const initialClass = getInitialClass(animationClass);
	node.classList.add(initialClass);

	if (typeof window !== 'undefined') {
		if (triggerOnMount) {
			setTimeout(() => {
				isVisible = true;
				hasAnimated = true;
				node.classList.remove(initialClass);
				node.classList.add(cssClass);
			}, delay);
		} else {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !hasAnimated) {
							isVisible = true;
							hasAnimated = true;
							node.classList.remove(initialClass);
							node.classList.add(cssClass);
						}
					});
				},
				{ threshold, rootMargin }
			);

			observer.observe(node);

			return {
				update: (newOptions: AnimationOptions) => {
					const newAnimationClass = newOptions.animationClass || animationClass;
					const newCssClass =
						ANIMATION_CLASSES[newAnimationClass as AnimationType] || cssClass;
					const newInitialClass = getInitialClass(newAnimationClass);

					// Remove old classes and add new ones if animation class changed
					if (newCssClass !== cssClass && hasAnimated) {
						node.classList.remove(cssClass, initialClass);
						node.classList.add(newCssClass, newInitialClass);
					}
				},
				destroy: () => {
					observer.disconnect();
				}
			};
		}
	}

	return {
		update: () => {},
		destroy: () => {}
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
