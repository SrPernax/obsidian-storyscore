import { App, TFile } from 'obsidian';
import {StoryScorePaths} from "../utils/paths";

export function getMarkdownFiles(app: App): TFile[] {
	return app.vault.getMarkdownFiles();
}
export function getTrackFiles(app: App, baseFolder: string): TFile[] {
	const paths = StoryScorePaths.getPaths(baseFolder);
	const allMarkdown = app.vault.getMarkdownFiles();
	return allMarkdown.filter(file => file.path.startsWith(paths.tracks));
}
export function getSoundtrackFiles(app: App, baseFolder: string): TFile[] {
	const paths = StoryScorePaths.getPaths(baseFolder);
	const allMarkdown = app.vault.getMarkdownFiles();
	return allMarkdown.filter(file => file.path.startsWith(paths.soundtracks));
}
export function getLeitmotifFiles(app: App, baseFolder: string): TFile[] {
	const paths = StoryScorePaths.getPaths(baseFolder);
	const allMarkdown = app.vault.getMarkdownFiles();
	return allMarkdown.filter(file => file.path.startsWith(paths.leitmotifs));
}
export function getAudioFiles(app: App): TFile[] {
	const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
	const allFiles = app.vault.getFiles();
	return allFiles.filter(file => audioExtensions.includes(file.extension.toLowerCase()));
}
export function getImageFiles(app: App): TFile[] {
	const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];
	const allFiles = app.vault.getFiles();
	return allFiles.filter(file => imageExtensions.includes(file.extension.toLowerCase()));
}
