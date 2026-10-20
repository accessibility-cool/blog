export interface HomeCard {
	title: string;
	icon: string;
	icon_aria: string;
	description: string;
	background_image?: {
		id: string;
		description?: string;
	} | null;
}

export interface Home {
	title: string;
	logo_aria: string;
	intro_chip: string;
	intro_headline: string;
	intro_description: string;
	cards_headline: string;
	cards: HomeCard[];
}
