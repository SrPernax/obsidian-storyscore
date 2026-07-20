import {Editor, MarkdownView, MarkdownFileInfo, Plugin, WorkspaceLeaf, Notice} from 'obsidian';
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from './settings';
import { NewTrackModal } from "./ui/add-track";
import { StoryScoreView, VIEW_TYPE_STORYSCORE } from "./ui/manager";
import { NewSoundtrackModal } from "./ui/add-sountrack";
import { TrackInsertModal } from "./core/commands/trackinsert";
import {SoundtracksExist} from "./core/queries/soundtrack-queries";
import {renderTrackCard} from "./ui/components/track-card";
import {getTrackById} from "./core/queries/track-queries";
import {getSoundtrackById} from "./core/queries/soundtrack-queries";
import { NewLeitmotifModal } from "./ui/add-leitmotif";
import { t } from "./locales/i18n";

export default class StoryScorePlugin extends Plugin {
	settings!: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_STORYSCORE,
			(leaf) => new StoryScoreView(leaf, this)
		);

		this.addRibbonIcon('library', t('CMD_OPEN_STORYSCORE'), () => {
			this.activateView();
		});

		this.addRibbonIcon('disc', t('CMD_NEW_SOUNDTRACK'), (_evt: MouseEvent) => {
			new NewSoundtrackModal(this.app, this).open();
		});

		this.addRibbonIcon('music', t('CMD_NEW_TRACK'), () => {
			new NewTrackModal(this.app, undefined, this).open();
		});

		this.addRibbonIcon('audio-lines', t('CMD_NEW_LEITMOTIF'), () => {
			new NewLeitmotifModal(this.app, this).open();
		});

		this.addCommand({
			id: 'open-storyscore-lobby',
			name: t('CMD_OPEN_MANAGER'),
			callback: () => {
				this.activateView();
			},
		});

		this.addCommand({
			id: 'add-new-track',
			name: t('CMD_NEW_TRACK'),
			callback: () => {
				new NewTrackModal(this.app, undefined, this).open();
			},
		});

		this.addCommand({
			id: 'add-new-ost',
			name: t('CMD_NEW_SOUNDTRACK'),
			callback: () => {
				new NewSoundtrackModal(this.app, this).open();
			},
		});

		this.addCommand({
			id: 'add-new-leitmotif',
			name: t('CMD_NEW_LEITMOTIF'),
			callback: () => {
				new NewLeitmotifModal(this.app, this).open();
			},
		});

		this.addCommand({
			id: 'insert-storyscore-track',
			name: t('CMD_INSERT_TRACK'),
			
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				new TrackInsertModal(this.app, editor, this).open();
			}
		});
		
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerMarkdownCodeBlockProcessor("storyscore", (source, el, ctx) => {
			let trackId = source.trim();

			if (trackId.toLowerCase().startsWith('id:')) {
				trackId = trackId.substring(3).trim();
			}
			
			const baseFolder = this.settings.baseFolder || 'StoryScore';
			
			const track = getTrackById(this.app, baseFolder, trackId);
			if (track) {
				const ost = getSoundtrackById(this.app, baseFolder, track.albumId);
				renderTrackCard(el, track, ost, this.app, this);
			} else {
				el.createEl("p", { text: t('CODEBLOCK_ERR', trackId), cls: "resonance-error" });
			}
		});
	}

	async activateView() {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf;

		const leaves = workspace.getLeavesOfType(VIEW_TYPE_STORYSCORE);

		if (leaves.length > 0) {
			leaf = leaves[0]!;
		} else {
			leaf = workspace.getLeaf('tab')!;
			await leaf.setViewState({ type: VIEW_TYPE_STORYSCORE, active: true });
		}

		workspace.revealLeaf(leaf);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_STORYSCORE);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
