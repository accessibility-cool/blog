import type { HomeQueryResult } from '@a11y.cool/data/sanity/sanity.types';

export type Home = NonNullable<HomeQueryResult>;

export type HomeCard = NonNullable<Home['cards']>[number];
