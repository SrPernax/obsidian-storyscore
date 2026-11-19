import { LeitmotifData } from '../models/leitmotif-data';
import { SoundtrackData } from '../models/soundtrack-data';
import { TrackData } from '../models/track-data';

const H1 = '#';
const NO_DESCRIPTION = '';
const NO_LYRICS = 'No lyrics defined';

export function generateId(prefix: 'SS' | 'ST' | 'LM', length = 5): string {
	const random = Math.random().toString(36).substring(2, 2 + length);
	return `${prefix}-${random}`;
}

export function safeFileName(name: string): string {
	return name.replace(/[\\/:"*?<>|]/g, '');
}

export function buildTrackMarkdown(uniqueId: string, data: TrackData): string {
	const leitmotifsYaml = data.leitmotifs && data.leitmotifs.length > 0
		? `\nleitmotifs:\n${data.leitmotifs.map(lm => `  - "[[${lm}]]"`).join('\n')}`
		: '';

	return `---
id: ${uniqueId}
album_id: "${data.albumId}"
title: "${data.title}"
description: "${data.description}"
type: "${data.type}"
diegetic: "${data.diegetic}"
status: "${data.status}"
lyrics: ${JSON.stringify(data.lyrics || '')}
audio: "[[${data.audio}]]"${leitmotifsYaml}
---
                   
# 🎵 ${data.title}
                   
> ${data.description || 'No description.'}
                   
### Player
\`\`\`storyscore
id: ${uniqueId}
\`\`\`

### Lyrics
${data.lyrics || '*Instrumental / No lyrics defined.*'}
`;
}

export function updateTrackBody(content: string, data: TrackData): string {
	if (!content.includes(H1)) return content;

	return content
		.replace(
			/^#\s+🎵.*?(?:\n+>[^\n]*)?/m,
			`${H1} 🎵 ${data.title}\n\n> ${data.description || NO_DESCRIPTION}`,
		)
		.replace(
			/(^###\s+Lyrics\s*$)[\s\S]*$/m,
			`$1\n${data.lyrics || NO_LYRICS}\n`,
		);
}

export function buildLeitmotifMarkdown(uniqueId: string, data: LeitmotifData): string {
	const entityNoteLink = data.entityNote ? `"[[${data.entityNote}]]"` : '""';
	const audioLink = data.audio ? `"[[${data.audio}]]"` : '""';

	return `---
id: ${uniqueId}
title: "${data.title}"
description: "${data.description}"
entity_type: "${data.entityType}"
${data.entityType === 'custom' && data.customEntityType ? `custom_entity_type: "${data.customEntityType}"\n` : ''}entity_note: ${entityNoteLink}
motif_type: "${data.motifType}"
audio: ${audioLink}
color: "${data.color}"
musical_annotations: ${JSON.stringify(data.musicalAnnotations || '')}
---
                   
# 🎵 Leitmotif: ${data.title}
                   
> ${data.description || 'No narrative description.'}
                   
**Associated Entity:** ${data.entityType === 'custom' && data.customEntityType ? data.customEntityType : data.entityType} ${data.entityNote ? `([[${data.entityNote}]])` : ''}
**Motif Type:** ${data.motifType}

### Player
\`\`\`storyscore
id: ${uniqueId}
\`\`\`

### Musical Annotations
${data.musicalAnnotations || '*No annotations.*'}
`;
}

export function buildSoundtrackMarkdown(uniqueId: string, data: SoundtrackData): string {
	const coverField = data.cover ? `\ncover: "[[${data.cover}]]"` : '';
	return `---
id: ${uniqueId}
title: "${data.title}"
description: "${data.description}"${coverField}
---
                   
# 🎵 ${data.title}
                   
> ${data.description || 'No description.'}

`;
}
