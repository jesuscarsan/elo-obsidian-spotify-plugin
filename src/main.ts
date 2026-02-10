import { Plugin } from 'obsidian';
import { SpotifyPluginSettings, DEFAULT_SETTINGS } from './Infrastructure/Obsidian/settings';
import { SettingsView } from './Infrastructure/Obsidian/Views/SettingsView';
import { SpotifyAdapter } from './Infrastructure/Adapters/SpotifyAdapter';
import { SettingsAdapter } from './Infrastructure/Adapters/SettingsAdapter';
import { MusicService } from './Application/Services/MusicService';
import { showMessage } from './Infrastructure/Obsidian/Utils/Messages';
import { SpotifyAuthModal } from './Infrastructure/Obsidian/Views/Modals/SpotifyAuthModal';
import { ImportSpotifyPlaylistCommand } from './Infrastructure/Obsidian/Commands/ImportSpotifyPlaylistCommand';
import { SearchSpotifyArtistCommand } from './Infrastructure/Obsidian/Commands/SearchSpotifyArtistCommand';

export default class EloSpotifyPlugin extends Plugin {
    settings: SpotifyPluginSettings = DEFAULT_SETTINGS;
    spotifyAdapter!: SpotifyAdapter;
    settingsAdapter!: SettingsAdapter;
    musicService!: MusicService;

    async onload() {
        console.log(`Elocuency Spotify plugin loaded ${this.manifest.version}`);

        await this.loadSettings();

        // --- Infrastructure (Adapters) ---
        this.spotifyAdapter = new SpotifyAdapter(
            this.settings.spotifyClientId,
            this.settings.spotifyAccessToken,
            this.settings.spotifyRefreshToken,
            this.settings.spotifyTokenExpirationTime,
            async (newToken, newExpiration) => {
                this.settings.spotifyAccessToken = newToken;
                this.settings.spotifyTokenExpirationTime = newExpiration;
                await this.saveSettings();
            },
            () => {
                showMessage('Spotify token expired. Please re-login.');
                new SpotifyAuthModal(this.app, this.musicService).open();
            }
        );

        this.settingsAdapter = new SettingsAdapter(this);
        
        // --- Application (Services) ---
        this.musicService = new MusicService(this.spotifyAdapter, this.settingsAdapter);

        // --- Commands ---
        const importPlaylistCommand = new ImportSpotifyPlaylistCommand(
            this.app,
            this.spotifyAdapter,
            this.musicService,
            () => new SpotifyAuthModal(this.app, this.musicService).open()
        );
        this.addCommand({
            id: importPlaylistCommand.id,
            name: importPlaylistCommand.name,
            checkCallback: (checking: boolean) => importPlaylistCommand.checkCallback(checking)
        });

        const searchArtistCommand = new SearchSpotifyArtistCommand(
            this.app, 
            this.spotifyAdapter,
            () => new SpotifyAuthModal(this.app, this.musicService).open()
        );
        this.addCommand({
            id: searchArtistCommand.id,
            name: searchArtistCommand.name,
            checkCallback: (checking: boolean) => searchArtistCommand.checkCallback(checking)
        });

        // --- Settings ---
        this.addSettingTab(new SettingsView(this.app, this));
    }

    onunload() {
        console.log('Elocuency Spotify plugin unloaded');
    }

    async loadSettings() {
        const data = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Update adapter if it needs it (e.g. clientId change)
        if (this.spotifyAdapter) {
            this.spotifyAdapter.updateCredentials(this.settings.spotifyClientId, this.settings.spotifyAccessToken);
        }
    }
}
