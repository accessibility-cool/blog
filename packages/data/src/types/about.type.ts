export interface Member {
	name: string;
	certification: string | null;
	description: string;
	image: Image | null;
	website: string | null;
	linkedin: string | null;
}

export interface Image {
	id: string;
	description: string | null;
	width: number;
	height: number;
}

export interface About {
	id: string;
	title: string;
	about_intro: string;
	members_headline: string;
	members: Member[];
	about_outro_headline: string;
	about_outro_description: string;
}
