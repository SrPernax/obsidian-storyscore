export interface StoryScoreSettings {
	baseFolder: string;
	compactMode: boolean;
}

export const DEFAULT_SETTINGS: StoryScoreSettings = {
	baseFolder: 'StoryScore',
	compactMode: false,
};
