import { App } from 'obsidian';
import type StoryScorePlugin from '../../main';
import { getLeitmotifs } from '../../core/queries/leitmotif-queries';
import { renderLeitmotifCard } from '../cards/leitmotif-card';
import { t } from '../../locales/lenguajes';

export function renderLeitmotifList(
	container: HTMLElement, 
	app: App, 
	plugin: StoryScorePlugin
) {
	container.empty();
	const baseFolder = plugin.settings.baseFolder || 'StoryScore';
	const lmList = getLeitmotifs(app, baseFolder);

	const listContainer = container.createDiv({ cls: 'storyscore-track-list-container' });

	if (lmList.length === 0) {
		listContainer.createEl('p', { text: t('MANAGER_EMPTY_FILTER'), cls: 'storyscore-empty-filter' });
	} else {
		lmList.forEach(lm => {
			const cardWrapper = listContainer.createDiv();
			renderLeitmotifCard(cardWrapper, lm, app, plugin);
		});
	}
}
