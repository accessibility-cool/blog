import * as dotenv from 'dotenv';
dotenv.config();

import { error } from '@sveltejs/kit';
import type { Page } from '../types/page.type';

export const apiToken = process.env.VITE_API_TOKEN;
export const apiUrl = process.env.VITE_API_URL;

// request init
export const request = (query: string, token = `Bearer ${process.env.API_TOKEN}`): RequestInit => ({
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Authorization: token
	},
	body: JSON.stringify({
		query: query
	})
});

// get api data
export const getData = async (
	requestInit: RequestInit,
	endpoint = `${process.env.API_URL}/graphql`
) => {
	const response = await fetch(endpoint, requestInit);
	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || 'API request failed');
	}

	return data;
};

// URL to retrieve images (or media in general)
export const mediaUrl = (uuid: string, transformation = '?format=webp'): string =>
	`${process.env.API_URL}/assets/${uuid}${transformation}`;

// img graphql query
export const dataQueryImage = (imageId: string): string => `query {
    directus_files_by_id(id: ${imageId}) {
        id
        url
        transformations {
            format: webp
        }
    }
}`;

// about graphql query
export const dataQueryAbout: string = `query {
    about {
        id
        introduction
        content
        founders {
            id
            name
            image {
                id
                url
            }
        }
    }
}`;

// home graphql query
export const dataQueryHome: string = `query {
    home {
        introduction
        introduction_headline
        expertise_headline
        social_headline
        portfolio_headline
        credits_headline
        home_aria
        social_aria
        social_links {
            id
            link
            text
        }
        expertise {
            id
            skill
        }
    }
}`;

const directusFetch = async (query: string): Promise<Record<string, unknown>> => {
	const endpoint = `${apiUrl}/graphql`;

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiToken}`
			},
			body: JSON.stringify({ query })
		});

		const result = await response.json();

		if (result.errors) {
			console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
			error(500, `GraphQL query failed: ${result.errors[0].message}`);
		}

		if (!response.ok) {
			error(response.status, 'API request failed');
		}

		return result.data;
	} catch (err) {
		console.error('Fetch error:', err);
		error(500, 'An unexpected error occurred while fetching data.');
	}
};

// page graphql query
export const dataQueryPage = (pageTitle: string): string => `query {
    pages(filter: { title: { _eq: "${pageTitle}" } }) {
        id
        title
        content
    }
}`;

export const getPage = async (title: string): Promise<Page> => {
	const data = (await directusFetch(dataQueryPage(title))) as { pages: Page[] };
	if (data?.pages?.length > 0) {
		return data.pages[0];
	}
	error(404, `Page with title "${title}" not found.`);
};
