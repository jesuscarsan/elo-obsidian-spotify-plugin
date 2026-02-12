import { Command, MarkdownView, TFile, App } from 'obsidian';
import { SpotifyAdapter } from '@/Infrastructure/Adapters/SpotifyAdapter';
import { MusicArtist } from '@elo/core';
import { SpotifyArtistSelectionModal } from '@/Infrastructure/Obsidian/Views/Modals/SpotifyArtistSelectionModal';
import { showMessage } from '@elo/obsidian-plugin';

// Assuming FrontmatterKeys from core, but if not available we can hardcode strings.
// Checking core might be good, but hardcoding keys is safer for decoupling.
// Keys used: spotify_uri, estilos_musicales, elo_images, spotify_popularity
const FrontmatterKeys = {
	SpotifyUri: 'spotify_uri',
	EstilosMusicales: 'estilos_musicales',
	EloImages: 'elo_images',
	SpotifyPopularity: 'spotify_popularity',
};

import { TranslationService } from '@elo/obsidian-plugin';

export class SearchSpotifyArtistCommand implements Command {
	id: string = 'search-spotify-artist';
	name: string;

	constructor(
		private app: App,
		private spotifyAdapter: SpotifyAdapter,
		private translationService: TranslationService,
		private onAuthRequired: () => void,
	) {
		this.name = this.translationService.t('command.searchArtist');
	}

	checkCallback(checking: boolean): boolean | void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view) {
			if (!checking) {
				this.execute(view);
			}
			return true;
		}
		return false;
	}

	async execute(view: MarkdownView) {
		console.log('[SearchSpotifyArtistCommand] Start');
		if (!this.spotifyAdapter.isAuthenticated()) {
			this.onAuthRequired();
			console.log('[SearchSpotifyArtistCommand] End (Auth required)');
			return;
		}

		const file = view.file;
		if (!file) return;

		// Use the file basename as the query, assuming the note name is the artist name
		const query = file.basename;

		showMessage('spotify.searchingArtist', { query }, this.translationService);

		try {
			const artists = await this.spotifyAdapter.searchArtists(query);

			if (artists.length === 0) {
				showMessage('spotify.noArtistsFound', undefined, this.translationService);
				console.log('[SearchSpotifyArtistCommand] End (No artists found)');
				return;
			}

			if (artists.length === 1) {
				this.updateFrontmatter(file, artists[0]);
				showMessage('spotify.artistUpdated', { name: artists[0].name }, this.translationService);
			} else {
				new SpotifyArtistSelectionModal(view.app, artists, (selectedArtist) => {
					this.updateFrontmatter(file, selectedArtist);
					showMessage(
						'spotify.artistUpdated',
						{ name: selectedArtist.name },
						this.translationService,
					);
				}).open();
			}
		} catch (error) {
			console.error(error);
			showMessage('spotify.searchError', undefined, this.translationService);
		}
		console.log('[SearchSpotifyArtistCommand] End');
	}

	private async updateFrontmatter(file: TFile, artist: MusicArtist) {
		await this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
			frontmatter[FrontmatterKeys.SpotifyUri] = artist.uri;
			frontmatter[FrontmatterKeys.EstilosMusicales] = artist.genres;
			frontmatter[FrontmatterKeys.EloImages] = artist.images
				? artist.images.map((img) => img.url)
				: [];
			frontmatter[FrontmatterKeys.SpotifyPopularity] = artist.popularity;
		});

		if (file.basename !== artist.name) {
			const parentPath = file.parent ? file.parent.path : '';
			const newPath = (parentPath === '/' ? '' : parentPath + '/') + artist.name + '.md';
			try {
				await this.app.fileManager.renameFile(file, newPath);
				showMessage('spotify.renamedNote', { name: artist.name }, this.translationService);
			} catch (error) {
				console.error('Failed to rename file:', error);
				showMessage('spotify.renameFailed', { name: artist.name }, this.translationService);
			}
		}
	}
}
