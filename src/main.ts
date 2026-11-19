import { Editor, MarkdownView, MarkdownFileInfo, Plugin, WorkspaceLeaf } from 'obsidian';
import { ObsidianStorageAdapter } from './adapters/obsidian-storage';
import { DEFAULT_SETTINGS, StoryScoreSettings, StoryScoreSettingTab } from './settings';
import { registerStoryScoreCodeBlock } from './ui/codeblock-processor';
import { NewLeitmotifModal } from './ui/modals/creators/add-leitmotif';
import { NewSoundtrackModal } from './ui/modals/creators/add-soundtrack';
import { NewTrackModal } from './ui/modals/creators/add-track';
import { LeitmotifInsertModal } from './ui/modals/insert/insert-leitmotif';
import { SoundtrackInsertModal } from './ui/modals/insert/insert-soundtrack';
import { TrackInsertModal } from './ui/modals/insert/insert-track';
import { StoryScoreView, VIEW_TYPE_STORYSCORE } from './ui/view/manager-view';
import { t } from './localization';

export default class StoryScorePlugin extends Plugin {
	settings!: StoryScoreSettings;
	storage!: ObsidianStorageAdapter;

	async onload() {
		this.storage = new ObsidianStorageAdapter(this.app);
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_STORYSCORE,
			(leaf) => new StoryScoreView(leaf, this)
		);

		this.addRibbonIcon('library', t('CMD_OPEN_STORYSCORE'), () => {
			void this.activateView();
		});

		this.addRibbonIcon('disc', t('CMD_NEW_SOUNDTRACK'), (_evt: MouseEvent) => {
			new NewSoundtrackModal(this.app, null, this).open();
		});

		this.addRibbonIcon('music', t('CMD_NEW_TRACK'), () => {
			new NewTrackModal(this.app, undefined, this).open();
		});

		this.addRibbonIcon('audio-lines', t('CMD_NEW_LEITMOTIF'), () => {
			new NewLeitmotifModal(this.app, null, this).open();
		});

		this.addCommand({
			id: 'open-lobby',
			name: t('CMD_OPEN_MANAGER'),
			callback: () => {
				void this.activateView();
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
				new NewSoundtrackModal(this.app, null, this).open();
			},
		});

		this.addCommand({
			id: 'add-new-leitmotif',
			name: t('CMD_NEW_LEITMOTIF'),
			callback: () => {
				new NewLeitmotifModal(this.app, null, this).open();
			},
		});

		this.addCommand({
			id: 'insert-track',
			name: t('CMD_INSERT_TRACK'),
			editorCallback: (editor: Editor, _view: MarkdownView | MarkdownFileInfo) => {
				new TrackInsertModal(this.app, editor, this).open();
			}
		});

		this.addCommand({
			id: 'insert-ost',
			name: t('CMD_INSERT_OST') || 'Insert Soundtrack Card',
			editorCallback: (editor: Editor, _view: MarkdownView | MarkdownFileInfo) => {
				new SoundtrackInsertModal(this.app, editor, this).open();
			}
		});

		this.addCommand({
			id: 'insert-lm',
			name: t('CMD_INSERT_LM') || 'Insert Leitmotif Card',
			editorCallback: (editor: Editor, _view: MarkdownView | MarkdownFileInfo) => {
				new LeitmotifInsertModal(this.app, editor, this).open();
			}
		});

		this.addSettingTab(new StoryScoreSettingTab(this.app, this));

		registerStoryScoreCodeBlock(this);
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

		void workspace.revealLeaf(leaf);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<StoryScoreSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
