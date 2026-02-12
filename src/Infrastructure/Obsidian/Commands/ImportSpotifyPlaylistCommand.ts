import { Command, MarkdownView, App, Notice } from 'obsidian';
import { getActiveMarkdownView, showMessage } from '@elo/obsidian-plugin';
import { SpotifyAdapter } from '@/Infrastructure/Adapters/SpotifyAdapter';
import { SpotifyPlaylistModal } from '@/Infrastructure/Obsidian/Views/Modals/SpotifyPlaylistModal';
import { MusicService } from '@/Application/Services/MusicService';
import { MusicTrack } from '@elo/core';

import { TranslationService } from '@elo/obsidian-plugin';

export class ImportSpotifyPlaylistCommand implements Command {
	id: string = 'import-spotify-playlist';
	name: string;

	constructor(
		private app: App,
		private spotifyAdapter: SpotifyAdapter,
		private musicService: MusicService,
		private translationService: TranslationService,
		private onAuthRequired: () => void,
	) {
		this.name = this.translationService.t('command.importPlaylist');
	}

	checkCallback(checking: boolean): boolean | void {
		const view = getActiveMarkdownView(this.app);
		if (view) {
			if (!checking) {
				this.execute(view);
			}
			return true;
		}
		if (!checking) {
			new Notice(this.translationService.t('spotify.openNote'));
		}
		return false;
	}

	async execute(view: MarkdownView) {
		console.log('[ImportSpotifyPlaylistCommand] Start');

		if (!this.spotifyAdapter.isAuthenticated()) {
			this.onAuthRequired();
			console.log('[ImportSpotifyPlaylistCommand] End (Auth required)');
			return;
		}

		new SpotifyPlaylistModal(this.app, this.musicService, (tracks) => {
			this.importTracks(view, tracks);
		}).open();

		console.log('[ImportSpotifyPlaylistCommand] End');
	}

	private async importTracks(view: MarkdownView, tracks: MusicTrack[]) {
		if (!tracks || tracks.length === 0) {
			showMessage('spotify.noTracks', undefined, this.translationService);
			return;
		}

		const editor = view.editor;
		const currentContent = editor.getValue();

		// Create checklist string with URI
		const trackList = tracks
			.map((track) => {
				const artistNames = track.artists.join(', ');
				return `- [ ] ${track.name} - ${artistNames} (${track.uri})`;
			})
			.join('\n');

		// Append to the end of the file with a header if not present
		const header = '\n\n## Imported Spotify Tracks\n';
		const newContent = currentContent + header + trackList;

		editor.setValue(newContent);

		showMessage('spotify.importedTracks', { count: tracks.length }, this.translationService);
	}
}
