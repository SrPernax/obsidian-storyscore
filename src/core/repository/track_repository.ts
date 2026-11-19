import { TrackResult } from '../models/track-result';
import { IStoryScoreStorage } from '../ports/storage-port';
import { getAllTracks } from './track-queries';

export class TrackRepository {
	private tracks: TrackResult[] = [];
	private loaded = false;

	constructor(
		private storage: IStoryScoreStorage,
		private baseFolder: string = 'StoryScore',
	) {}

	load(): void {
		if (this.loaded) return;
		this.tracks = getAllTracks(this.storage, this.baseFolder);
		this.loaded = true;
	}

	getById(id: string): TrackResult | undefined {
		if (!this.loaded) this.load();
		return this.tracks.find(t => t.id === id);
	}

	getByAlbum(albumId: string): TrackResult[] {
		if (!this.loaded) this.load();
		return this.tracks.filter(t => t.albumId === albumId);
	}

	getAll(): TrackResult[] {
		if (!this.loaded) this.load();
		return this.tracks;
	}

	notifyVaultChange(): void {
		this.loaded = false;
		this.tracks = [];
	}
}
