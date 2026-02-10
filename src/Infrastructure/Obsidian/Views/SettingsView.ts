
import { App, PluginSettingTab, Setting } from 'obsidian';
import EloSpotifyPlugin from '@/main';

export class SettingsView extends PluginSettingTab {
    plugin: EloSpotifyPlugin;

    constructor(app: App, plugin: EloSpotifyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Elocuency Spotify Settings' });

        new Setting(containerEl)
            .setName('Spotify Client ID')
            .setDesc('OAuth 2.0 Client ID')
            .addText(text => text
                .setPlaceholder('Enter your Client ID')
                .setValue(this.plugin.settings.spotifyClientId)
                .onChange(async (value) => {
                    this.plugin.settings.spotifyClientId = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Spotify Client Secret')
            .setDesc('OAuth 2.0 Client Secret (Optional for Implicit/PKCE)')
            .addText(text => text
                .setPlaceholder('Enter your Client Secret')
                .setValue(this.plugin.settings.spotifyClientSecret)
                .onChange(async (value) => {
                    this.plugin.settings.spotifyClientSecret = value;
                    await this.plugin.saveSettings();
                }));
    }
}
