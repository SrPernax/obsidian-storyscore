export const STORYSCORE_CODEBLOCK = 'storyscore';

export function parseCodeBlockId(source: string): string {
	const raw = source.trim();
	const prefix = /^(?:id|ost|st):/i.exec(raw);
	return prefix ? raw.slice(prefix[0].length).trim() : raw;
}

export function formatCodeBlock(id: string): string {
	return `\n\`\`\`${STORYSCORE_CODEBLOCK}\nid: ${id}\n\`\`\`\n`;
}
