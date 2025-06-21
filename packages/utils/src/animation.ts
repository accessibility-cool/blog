export interface AnimationOptions {
	delay?: number;
	duration?: number;
	threshold?: number;
	rootMargin?: string;
	initialTransform?: string;
	finalTransform?: string;
	triggerOnMount?: boolean;
}

export interface AnimationState {
	isVisible: boolean;
	style: {
		opacity: number;
		transform: string;
		transition: string;
	};
}

export const createAnimation = (options: AnimationOptions = {}) => {
	const {
		delay = 0,
		duration = 600,
		threshold = 0.1,
		rootMargin = '0px 0px -50px 0px',
		initialTransform = 'translateY(30px)',
		finalTransform = 'translateY(0)',
		triggerOnMount = false
	} = options;

	let element: HTMLElement | undefined;
	let isVisible = false;
	let hasAnimated = false;

	const style = {
		opacity: 0,
		transform: initialTransform,
		transition: 'none'
	};

	const updateStyle = () => {
		style.opacity = isVisible ? 1 : 0;
		style.transform = isVisible ? finalTransform : initialTransform;
		style.transition = hasAnimated
			? `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
			: 'none';
	};

	const setElement = (el: HTMLElement) => {
		element = el;
		if (typeof window === 'undefined' || !element) return;

		if (triggerOnMount) {
			setTimeout(() => {
				isVisible = true;
				hasAnimated = true;
				updateStyle();
			}, delay);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !hasAnimated) {
						isVisible = true;
						hasAnimated = true;
						updateStyle();
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
		updateStyle();
	};

	return {
		setElement,
		trigger,
		get style() {
			return style;
		}
	};
};

export const createStaggeredAnimation = (
	count: number,
	baseDelay = 0,
	interval = 100,
	triggerOnMount = false
) => {
	const animations = Array.from({ length: count }, (_, index) =>
		createAnimation({
			delay: baseDelay + index * interval,
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
		duration = 600,
		threshold = 0.1,
		rootMargin = '0px 0px -50px 0px',
		initialTransform = 'translateY(30px)',
		finalTransform = 'translateY(0)',
		triggerOnMount = false
	} = options;

	let isVisible = false;
	let hasAnimated = false;

	// Apply initial styles
	node.style.opacity = '0';
	node.style.transform = initialTransform;
	node.style.transition = 'none';

	const updateStyles = () => {
		node.style.opacity = isVisible ? '1' : '0';
		node.style.transform = isVisible ? finalTransform : initialTransform;
		node.style.transition = hasAnimated
			? `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
			: 'none';
	};

	if (typeof window !== 'undefined') {
		if (triggerOnMount) {
			setTimeout(() => {
				isVisible = true;
				hasAnimated = true;
				updateStyles();
			}, delay);
		} else {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !hasAnimated) {
							isVisible = true;
							hasAnimated = true;
							updateStyles();
						}
					});
				},
				{ threshold, rootMargin }
			);

			observer.observe(node);

			return {
				update: (newOptions: AnimationOptions) => {
					const newDelay = newOptions.delay ?? delay;
					const newDuration = newOptions.duration ?? duration;

					if (hasAnimated) {
						node.style.transition = `opacity ${newDuration}ms ease-out ${newDelay}ms, transform ${newDuration}ms ease-out ${newDelay}ms`;
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
