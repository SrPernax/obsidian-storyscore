import type StoryScorePlugin from '../../main';
import { t } from '../../i18n';
import { getLeitmotifById } from '../repository/leitmotif-queries';
import { getSoundtrackById } from '../repository/soundtrack-queries';
import { getTrackById } from '../repository/track-queries';
import { renderLeitmotifCard } from '../../ui/cards/leitmotif-card';
import { renderSoundtrackCard } from '../../ui/cards/soundtrack-card';
import { renderTrackCard } from '../../ui/cards/track-card';

export const STORYSCORE_CODEBLOCK = 'storyscore';

/**
 * Renders a ```storyscore``` code block. The ID prefix decides which card is
 * rendered: `LM-` for leitmotifs, `ST-` for soundtracks and anything else for
 * tracks.
 */
export function registerStoryScoreCodeBlock(plugin: StoryScorePlugin): void {
	plugin.registerMarkdownCodeBlockProcessor(STORYSCORE_CODEBLOCK, (source, el) => {
		renderStoryScoreCard(plugin, source, el);
	});
}

function renderStoryScoreCard(plugin: StoryScorePlugin, source: string, el: HTMLElement): void {
	const { app } = plugin;
	const id = parseCodeBlockId(source);
	const baseFolder = plugin.settings.baseFolder || 'StoryScore';

	if (id.startsWith('LM-')) {
		const leitmotif = getLeitmotifById(app, baseFolder, id);
		if (!leitmotif) {
			renderNotFound(el, id);
			return;
		}
		renderLeitmotifCard(el, leitmotif, app, plugin);
		return;
	}

	if (id.startsWith('ST-')) {
		const soundtrack = getSoundtrackById(app, baseFolder, id);
		if (!soundtrack) {
			renderNotFound(el, id);
			return;
		}
		renderSoundtrackCard(el, soundtrack, app, plugin);
		return;
	}

	const track = getTrackById(app, baseFolder, id);
	if (!track) {
		renderNotFound(el, id);
		return;
	}

	const soundtrack = getSoundtrackById(app, baseFolder, track.albumId);
	renderTrackCard(el, track, soundtrack, app, plugin);
}

/**
 * Accepts both the bare ID (`SS-abc12`) and the legacy prefixed forms
 * (`id: SS-abc12`, `st: ST-abc12`, `ost: ST-abc12`).
 */
function parseCodeBlockId(source: string): string {
	const raw = source.trim();
	const prefix = /^(?:id|ost|st):/i.exec(raw);
	return prefix ? raw.slice(prefix[0].length).trim() : raw;
}

function renderNotFound(el: HTMLElement, id: string): void {
	el.createEl('p', { text: t('CODEBLOCK_ERR', id), cls: 'storyscore-error' });
}
