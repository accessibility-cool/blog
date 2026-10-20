import { aboutType } from './aboutType';
import { accessibleImageType } from './accessibleImageType';
import { blockContentType } from './blockContentType';
import { calloutType } from './calloutType';
import { categoryType } from './categoryType';
import { homeType } from './homeType';
import { metaType } from './metaType';
import { pageType } from './pageType';
import { personType } from './personType';
import { postType } from './postType';
import { siteSettingsType } from './siteSettingsType';
import { socialLinkType } from './socialLinkType';

export const schemaTypes = [
	// Documents
	postType,
	pageType,
	personType,
	categoryType,
	homeType,
	aboutType,
	siteSettingsType,
	// Objects
	metaType,
	blockContentType,
	accessibleImageType,
	calloutType,
	socialLinkType
];

/** Document types that exist exactly once, under a fixed `_id` equal to the type name. */
export const singletonTypes = new Set(['siteSettings', 'home', 'about']);
