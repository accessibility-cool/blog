import type { PostQueryResult } from '@a11y.cool/data/sanity/sanity.types';

/** A person with everything the About page and JSON-LD need. */
export type Person = NonNullable<NonNullable<PostQueryResult>['authors']>[number];

export type SocialLink = NonNullable<Person['links']>[number];
