import { ParsedWikiLink } from '../core/interfaces/parsed-wiki-link';

const WIKI_LINK = /^\[\[([^\]|]+)?(?:\|([^\]]+))?\]\]$/;

export function stripWikiLink(value: string): string {
	const match = WIKI_LINK.exec(value.trim());
	if (!match) return value.trim();
	const target = match[1];
	return target !== undefined && target !== null ? target.trim() : value.trim();
}

export function wikiLinkLabel(value: string): string {
	const match = WIKI_LINK.exec(value.trim());
	if (!match) return value.trim();
	const alias = match[2];
	const target = match[1];
	return alias !== undefined && alias !== null
		? (target !== undefined && target !== null ? target.trim() : value.trim())
		: value.trim();
}

export function parseWikiLink(value: string): ParsedWikiLink | null {
	const match = WIKI_LINK.exec(value.trim());
	if (!match) return null;
	const target = match[1] !== undefined && match[1] !== null ? match[1].trim() : '';
	const alias = match[2] !== undefined && match[2] !== null ? match[2].trim() : target;
	return { target, alias };
}
