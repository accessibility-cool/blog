import type { StructureResolver } from 'sanity/structure';

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
	S.listItem()
		.title(title)
		.id(type)
		.schemaType(type)
		.child(S.document().schemaType(type).documentId(type).title(title));

export const structure: StructureResolver = (S) =>
	S.list()
		.title('Content')
		.items([
			singleton(S, 'home', 'Home'),
			singleton(S, 'about', 'About'),
			S.divider(),
			S.documentTypeListItem('post').title('Posts'),
			S.documentTypeListItem('page').title('Pages'),
			S.documentTypeListItem('person').title('People'),
			S.documentTypeListItem('category').title('Categories'),
			S.divider(),
			singleton(S, 'siteSettings', 'Site settings')
		]);
