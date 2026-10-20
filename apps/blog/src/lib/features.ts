import { PUBLIC_BLOG_ENABLED } from '$app/env/public';

export type NavItem = {
	label: string;
	href: string;
};

const blogNavItem: NavItem = { label: 'Blog', href: '/blog' };
const aboutNavItem: NavItem = { label: 'About Us', href: '/about' };

export function isBlogEnabled(): boolean {
	const value = PUBLIC_BLOG_ENABLED ?? 'false';
	return value === 'true' || value === '1';
}

export function getNavItems(): NavItem[] {
	return isBlogEnabled() ? [blogNavItem, aboutNavItem] : [aboutNavItem];
}
