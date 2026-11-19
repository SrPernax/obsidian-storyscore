import { NO_ALBUM_ID } from '../constants/taxonomy';
import { LeitmotifData } from '../models/leitmotif-data';
import { LeitmotifResult } from '../models/leitmotif-result';
import { SoundtrackData } from '../models/soundtrack-data';
import { SoundtrackResult } from '../models/soundtrack-result';
import { TrackData } from '../models/track-data';
import { TrackResult } from '../models/track-result';
import { RawNoteEntry } from '../ports/storage-port';

export function trackFromFrontmatter(fm: Record<string, unknown>): TrackData {
	return {
		title: (fm.title as string) || '',
		description: (fm.description as string) || '',
		type: (fm.type as string) || 'ambient',
		status: (fm.status as string) || 'wip',
		lyrics: (fm.lyrics as string) || '',
		diegetic: (fm.diegetic as string) || 'mixed',
		albumId: (fm.album_id as string) || NO_ALBUM_ID,
		audio: (fm.audio as string) || '',
		leitmotifs: (fm.leitmotifs as string[]) || [],
	};
}

export function trackResultFromEntry(entry: RawNoteEntry): TrackResult {
	const fm = entry.frontmatter;
	return {
		path: entry.path,
		basename: entry.basename,
		id: (fm?.id as string) || entry.path,
		title: (fm?.title as string) || entry.basename,
		description: fm?.description as string | undefined,
		albumId: (fm?.album_id as string) || NO_ALBUM_ID,
		audio: fm?.audio as string | undefined,
		type: (fm?.type as string) || '',
		status: (fm?.status as string) || '',
		lyrics: fm?.lyrics as string | undefined,
		diegesis: fm?.diegetic as string | undefined,
		leitmotifs: (fm?.leitmotifs as string[]) || [],
	};
}

export function applyTrackFrontmatter(frontmatter: Record<string, unknown>, data: TrackData): void {
	frontmatter['album_id'] = data.albumId;
	frontmatter['title'] = data.title;
	frontmatter['description'] = data.description;
	frontmatter['type'] = data.type;
	frontmatter['diegetic'] = data.diegetic;
	frontmatter['status'] = data.status;
	frontmatter['lyrics'] = data.lyrics;
	frontmatter['audio'] = `[[${data.audio}]]`;

	if (data.leitmotifs && data.leitmotifs.length > 0) {
		frontmatter['leitmotifs'] = data.leitmotifs.map((lm: string) => `[[${lm}]]`);
	} else {
		delete frontmatter['leitmotifs'];
	}
}

export function soundtrackFromFrontmatter(fm: Record<string, unknown>): SoundtrackData {
	return {
		title: (fm.title as string) || '',
		description: (fm.description as string) || '',
		cover: (fm.cover as string) || undefined,
	};
}

export function soundtrackResultFromEntry(entry: RawNoteEntry): SoundtrackResult {
	const fm = entry.frontmatter;
	return {
		path: entry.path,
		basename: entry.basename,
		id: (fm?.id as string) || entry.path,
		title: (fm?.title as string) || entry.basename,
		description: fm?.description as string | undefined,
		cover: fm?.cover as string | undefined,
	};
}

export function applySoundtrackFrontmatter(frontmatter: Record<string, unknown>, data: SoundtrackData): void {
	frontmatter['title'] = data.title;
	frontmatter['description'] = data.description;

	if (data.cover) {
		frontmatter['cover'] = `[[${data.cover}]]`;
	} else {
		delete frontmatter['cover'];
	}
}

export function leitmotifFromFrontmatter(fm: Record<string, unknown>): LeitmotifData {
	return {
		title: (fm.title as string) || '',
		description: (fm.description as string) || '',
		entityType: (fm.entity_type as string) || 'Character',
		entityNote: (fm.entity_note as string) || '',
		motifType: (fm.motif_type as string) || 'Melodic motif',
		audio: (fm.audio as string) || '',
		color: (fm.color as string) || '#808080',
		musicalAnnotations: (fm.musical_annotations as string) || '',
		customEntityType: (fm.custom_entity_type as string) || undefined,
	};
}

export function leitmotifResultFromEntry(entry: RawNoteEntry): LeitmotifResult {
	const fm = entry.frontmatter;
	return {
		path: entry.path,
		basename: entry.basename,
		id: (fm?.id as string) || entry.path,
		title: (fm?.title as string) || entry.basename,
		description: fm?.description as string | undefined,
		entityType: fm?.entity_type as string | undefined,
		entityNote: fm?.entity_note as string | undefined,
		motifType: fm?.motif_type as string | undefined,
		audio: fm?.audio as string | undefined,
		musicalAnnotations: (fm?.musical_annotations as string) || '',
		color: fm?.color as string | undefined,
		customEntityType: fm?.custom_entity_type as string | undefined,
	};
}

export function applyLeitmotifFrontmatter(frontmatter: Record<string, unknown>, data: LeitmotifData): void {
	frontmatter['title'] = data.title;
	frontmatter['description'] = data.description;
	frontmatter['entity_type'] = data.entityType;
	if (data.entityType === 'custom' && data.customEntityType) {
		frontmatter['custom_entity_type'] = data.customEntityType;
	} else {
		delete frontmatter['custom_entity_type'];
	}
	frontmatter['motif_type'] = data.motifType;
	frontmatter['color'] = data.color;
	frontmatter['musical_annotations'] = data.musicalAnnotations;

	if (data.entityNote) {
		frontmatter['entity_note'] = `[[${data.entityNote}]]`;
	} else {
		delete frontmatter['entity_note'];
	}

	if (data.audio) {
		frontmatter['audio'] = `[[${data.audio}]]`;
	} else {
		delete frontmatter['audio'];
	}
}
