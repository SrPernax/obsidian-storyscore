import { App } from 'obsidian';
import type StoryScorePlugin from '../../main';
import { getSoundtracks } from '../../core/queries/soundtrack-queries';
import { renderSoundtrackCard } from '../cards/soundtrack-card';
import { t } from '../../locales/lenguajes';

export function renderSoundtrackList(
	container: HTMLElement, 
	app: App, 
	plugin: StoryScorePlugin
) {
	container.empty();
	const baseFolder = plugin.settings.baseFolder || 'StoryScore';
	const ostList = getSoundtracks(app, baseFolder);

	const listContainer = container.createDiv({ cls: 'storyscore-track-list-container' });

	if (ostList.length === 0) {
		listContainer.createEl('p', { text: t('MANAGER_EMPTY_FILTER'), cls: 'storyscore-empty-filter' }); // You can add a specific string for empty soundtracks later
	} else {
		ostList.forEach(ost => {
			const cardWrapper = listContainer.createDiv();
			renderSoundtrackCard(cardWrapper, ost, app, plugin);
		});
	}
}
