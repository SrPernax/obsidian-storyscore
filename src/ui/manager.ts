import { ItemView, WorkspaceLeaf, debounce } from 'obsidian';
import { NewSoundtrackModal } from "./creators/add-sountrack";
import { NewTrackModal } from "./creators/add-track";
import { NewLeitmotifModal } from "./creators/add-leitmotif";

import LogoBlack from '../../assets/plugin/logo-black.svg';
import LogoWhite from '../../assets/plugin/logo-white.svg';
import { renderTrackList } from "./lists/track-list";
import { renderSoundtrackList } from "./lists/soundtrack-list";
import { renderLeitmotifList } from "./lists/leitmotif-list";
import { t } from "../locales/lenguajes";
import type StoryScorePlugin from '../main';

export const VIEW_TYPE_STORYSCORE = "storyscore-view";

export class StoryScoreView extends ItemView {
	currentAlbumFilter: string = "all";
	currentTab: 'soundtracks' | 'tracks' | 'leitmotifs' = 'tracks';
	plugin: StoryScorePlugin;

	debouncedRender = debounce(() => {
		void this.renderView();
	}, 500, true);

	constructor(leaf: WorkspaceLeaf, plugin: StoryScorePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() { return VIEW_TYPE_STORYSCORE; }
	getDisplayText() { return t('MANAGER_TITLE'); }
	getIcon(): string { return "music"; }

	async onOpen() {
		await this.renderView();

		this.registerEvent(this.app.metadataCache.on('changed', this.debouncedRender));
		this.registerEvent(this.app.vault.on('create', this.debouncedRender));
		this.registerEvent(this.app.vault.on('delete', this.debouncedRender));
		this.registerEvent(this.app.vault.on('rename', this.debouncedRender));
		// @ts-ignore
		this.registerEvent(this.app.workspace.on('csschange', this.debouncedRender));
	}

	async renderView() {
		const container = this.contentEl;
		container.empty();

		const settings = this.plugin.settings;
		const baseFolder = settings.baseFolder || 'StoryScore';
		const compactMode = settings.compactMode || false;
		const isDarkTheme = document.body.classList.contains('theme-dark');

		container.addClass('storyscore-manager-container');
		if (isDarkTheme) {
			container.addClass('storyscore-theme-dark');
		}

		this.renderHeader(container, compactMode, isDarkTheme);
		this.renderToolbar(container);
		this.renderTabs(container);

		const listContainer = container.createDiv({ cls: 'storyscore-list-wrapper' });

		if (this.currentTab === 'soundtracks') {
			renderSoundtrackList(listContainer, this.app, this.plugin);
		} else if (this.currentTab === 'tracks') {
			renderTrackList(listContainer, this.app, this.plugin, this.currentAlbumFilter, (val) => {
				this.currentAlbumFilter = val;
				void this.renderView();
			});
		} else if (this.currentTab === 'leitmotifs') {
			renderLeitmotifList(listContainer, this.app, this.plugin);
		}
	}

	renderTabs(container: HTMLElement) {
		const tabsBox = container.createDiv({ cls: 'storyscore-tabs-container' });
		
		const btnSoundtracks = tabsBox.createEl('button', { text: "Soundtracks", cls: 'storyscore-tab-btn' });
		const btnTracks = tabsBox.createEl('button', { text: "Tracks", cls: 'storyscore-tab-btn' });
		const btnLeitmotifs = tabsBox.createEl('button', { text: "Leitmotifs", cls: 'storyscore-tab-btn' });

		if (this.currentTab === 'soundtracks') btnSoundtracks.addClass('active');
		if (this.currentTab === 'tracks') btnTracks.addClass('active');
		if (this.currentTab === 'leitmotifs') btnLeitmotifs.addClass('active');

		btnSoundtracks.onclick = () => { this.currentTab = 'soundtracks'; void this.renderView(); };
		btnTracks.onclick = () => { this.currentTab = 'tracks'; void this.renderView(); };
		btnLeitmotifs.onclick = () => { this.currentTab = 'leitmotifs'; void this.renderView(); };
	}

	renderHeader(container: HTMLElement, compactMode: boolean, isDarkTheme: boolean) {
		const staffBox = container.createDiv({ cls: 'storyscore-staff-box' });
		if (compactMode) staffBox.addClass('compact');

		if (!compactMode) {
			for(let i = 0; i < 4; i++) {
				staffBox.createDiv({ cls: 'storyscore-staff-line' });
			}
		}

		const titleBox = staffBox.createDiv({ cls: 'storyscore-title-box' });
		if (compactMode) titleBox.addClass('compact');

		const logoData = "data:image/svg+xml;base64," + (isDarkTheme ? LogoWhite : LogoBlack);
		
		const logo = titleBox.createEl('img', { cls: 'storyscore-logo' });
		logo.src = logoData;
		if (compactMode) logo.addClass('compact');

		const textContainer = titleBox.createDiv({ cls: 'storyscore-text-container' });
		if (compactMode) textContainer.addClass('compact');

		const title = textContainer.createEl('h2', { text: t('MANAGER_TITLE'), cls: 'storyscore-title' });
		if (compactMode) title.addClass('compact');

		const version = textContainer.createSpan({ text: `v${this.plugin.manifest.version}`, cls: 'storyscore-version' });
		if (compactMode) version.addClass('compact');

		if (!compactMode) {
			staffBox.createSpan({ text: '𝄞', cls: 'storyscore-clef' });
			const notesContainer = staffBox.createDiv({ cls: 'storyscore-notes-container' });
			
			notesContainer.createSpan({ text: '♩', cls: 'storyscore-note-1' });
			notesContainer.createSpan({ text: '♪', cls: 'storyscore-note-2' });
			notesContainer.createSpan({ text: '♫', cls: 'storyscore-note-3' });
		}
	}

	renderToolbar(container: HTMLElement) {
		const hBox = container.createDiv({ cls: 'storyscore-toolbar' });

		const createColoredButton = (parent: HTMLElement, fullText: string) => {
			const btn = parent.createEl('button', { cls: 'storyscore-toolbar-btn' });
			const spaceIdx = fullText.indexOf(' ');
			if (spaceIdx > 0 && spaceIdx < 5) { 
				const emoji = fullText.substring(0, spaceIdx);
				const rest = fullText.substring(spaceIdx);
				btn.createSpan({ text: emoji, cls: 'storyscore-toolbar-emoji' });
				btn.appendChild(document.createTextNode(rest.trim()));
			} else {
				btn.setText(fullText);
			}
			return btn;
		};

		const btnRefreshAll = createColoredButton(hBox, t('MANAGER_REFRESH_ALL'));
		btnRefreshAll.onclick = () => this.renderView();

		const btnAddProject = createColoredButton(hBox, t('MANAGER_ADD_SOUNDTRACK'));
		btnAddProject.onclick = () => { new NewSoundtrackModal(this.app, null, this.plugin).open(); };

		const btnAddTrack = createColoredButton(hBox, t('MANAGER_ADD_TRACK'));
		btnAddTrack.onclick = () => { new NewTrackModal(this.app, undefined, this.plugin).open(); };

		const btnAddLeitmotif = createColoredButton(hBox, t('MANAGER_ADD_LEITMOTIF'));
		btnAddLeitmotif.onclick = () => { new NewLeitmotifModal(this.app, null, this.plugin).open(); };
	}

	async onClose() {}
}
