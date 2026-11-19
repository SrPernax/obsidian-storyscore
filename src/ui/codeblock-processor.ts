import type StoryScorePlugin from '../main';
import { t } from '../i18n';
import { parseCodeBlockId, STORYSCORE_CODEBLOCK } from '../core/parsing/codeblock-parser';
import { getLeitmotifById } from '../core/repository/leitmotif-queries';
import { getSoundtrackById } from '../core/repository/soundtrack-queries';
import { getTrackById } from '../core/repository/track-queries';
import { renderLeitmotifCard } from './cards/leitmotif-card';
import { renderSoundtrackCard } from './cards/soundtrack-card';
import { renderTrackCard } from './cards/track-card';

export function registerStoryScoreCodeBlock(plugin: StoryScorePlugin): void {
	plugin.registerMarkdownCodeBlockProcessor(STORYSCORE_CODEBLOCK, (source, el) => {
		renderStoryScoreCard(plugin, source, el);
	});
}

function renderStoryScoreCard(plugin: StoryScorePlugin, source: string, el: HTMLElement): void {
	const { app, storage } = plugin;
	const id = parseCodeBlockId(source);
	const baseFolder = plugin.settings.baseFolder || 'StoryScore';

	if (id.startsWith('LM-')) {
		const leitmotif = getLeitmotifById(storage, baseFolder, id);
		if (!leitmotif) {
			renderNotFound(el, id);
			return;
		}
		renderLeitmotifCard(el, leitmotif, app, plugin);
		return;
	}

	if (id.startsWith('ST-')) {
		const soundtrack = getSoundtrackById(storage, baseFolder, id);
		if (!soundtrack) {
			renderNotFound(el, id);
			return;
		}
		renderSoundtrackCard(el, soundtrack, app, plugin);
		return;
	}

	const track = getTrackById(storage, baseFolder, id);
	if (!track) {
		renderNotFound(el, id);
		return;
	}

	const soundtrack = getSoundtrackById(storage, baseFolder, track.albumId);
	renderTrackCard(el, track, soundtrack, app, plugin);
}

function renderNotFound(el: HTMLElement, id: string): void {
	el.createEl('p', { text: t('CODEBLOCK_ERR', id), cls: 'storyscore-error' });
}
