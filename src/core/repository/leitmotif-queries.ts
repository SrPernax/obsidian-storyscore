import { StoryScorePaths } from '../constants/paths';
import { LeitmotifResult } from '../models/leitmotif-result';
import { leitmotifResultFromEntry } from '../parsing/frontmatter';
import { IStoryScoreStorage } from '../ports/storage-port';

export function getLeitmotifs(storage: IStoryScoreStorage, baseFolder: string): LeitmotifResult[] {
	const paths = StoryScorePaths.getPaths(baseFolder);
	const entries = storage.listNotesInFolder(paths.leitmotifs);

	return entries.map(leitmotifResultFromEntry);
}

export function getLeitmotifById(storage: IStoryScoreStorage, baseFolder: string, id: string): LeitmotifResult | undefined {
	const allLeitmotifs = getLeitmotifs(storage, baseFolder);
	return allLeitmotifs.find(lm => lm.id === id || lm.basename === id || lm.title === id);
}
