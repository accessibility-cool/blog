import { env } from '$env/dynamic/public';

export type NavItem = {
	label: string;
	href: string;
};

const blogNavItem: NavItem = { label: 'Blog', href: '/blog' };
const aboutNavItem: NavItem = { label: 'About Us', href: '/about' };

export function isBlogEnabled(): boolean {
	const value = env.PUBLIC_BLOG_ENABLED ?? 'false';
	return value === 'true' || value === '1';
}

export function getNavItems(): NavItem[] {
	return isBlogEnabled() ? [blogNavItem, aboutNavItem] : [aboutNavItem];
}
