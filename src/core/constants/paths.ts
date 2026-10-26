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
