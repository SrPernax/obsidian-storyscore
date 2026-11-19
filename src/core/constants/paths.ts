export const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac'] as const;
export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'] as const;

export class StoryScorePaths {
	static getPaths(baseFolder: string) {
		const root = baseFolder.replace(/\/$/, '');

		return {
			root: root,
			tracks: `${root}/tracks`,
			soundtracks: `${root}/soundtracks`,
			leitmotifs: `${root}/leitmotifs`,
		};
	}
}
