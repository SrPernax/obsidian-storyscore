import { App } from 'obsidian';
import type StoryScorePlugin from '../../main';
import { getSoundtracks } from '../../core/queries/soundtrack-queries';
import { getAllTracks } from '../../core/queries/track-queries';
import { renderTrackCard } from '../cards/track-card';
import { t } from '../../locales/lenguajes';

export function renderTrackList(
	container: HTMLElement, 
	app: App, 
	plugin: StoryScorePlugin, 
	currentAlbumFilter: string, 
	onFilterChange: (newFilter: string) => void
) {
	container.empty();
	const baseFolder = plugin.settings.baseFolder || 'StoryScore';
	const ostList = getSoundtracks(app, baseFolder);
	const trackList = getAllTracks(app, baseFolder);

	const trackListContainer = container.createDiv({ cls: 'storyscore-track-list-container' });

	// Filter dropdown
	const projectSelect = trackListContainer.createEl('select', { cls: 'dropdown storyscore-project-select' });
	projectSelect.createEl('option', { text: t('MANAGER_ALL_TRACKS'), value: 'all' });

	ostList.forEach(ost => {
		const opt = projectSelect.createEl('option', { text: ost.title, value: ost.id });
		if (ost.id === currentAlbumFilter) {
			opt.selected = true;
		}
	});

	projectSelect.onchange = () => {
		onFilterChange(projectSelect.value);
	};

	let filteredTracks = trackList;
	if (currentAlbumFilter !== 'all') {
		filteredTracks = trackList.filter(track => track.albumId === currentAlbumFilter);
	}

	if (filteredTracks.length === 0) {
		trackListContainer.createEl('p', { text: t('MANAGER_EMPTY_FILTER'), cls: 'storyscore-empty-filter' });
	} else {
		filteredTracks.forEach(track => {
			const cardWrapper = trackListContainer.createDiv();
			const ost = ostList.find(o => o.id === track.albumId);
			renderTrackCard(cardWrapper, track, ost, app, plugin);
		});
	}
}
