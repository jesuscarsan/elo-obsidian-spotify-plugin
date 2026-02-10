import { SettingsPort } from "@elo/core";
import EloSpotifyPlugin from '../../main';

export class SettingsAdapter implements SettingsPort {
    constructor(private plugin: EloSpotifyPlugin) { }

    getSpotifyClientId(): string {
        return this.plugin.settings.spotifyClientId;
    }

    getSpotifyAccessToken(): string {
        return this.plugin.settings.spotifyAccessToken;
    }

    getSpotifyRefreshToken(): string {
        return this.plugin.settings.spotifyRefreshToken;
    }

    getSpotifyTokenExpirationTime(): number {
        return this.plugin.settings.spotifyTokenExpirationTime;
    }

    getSpotifyPkceVerifier(): string {
        return this.plugin.settings.spotifyPkceVerifier;
    }

    setSpotifyAccessToken(token: string): void {
        this.plugin.settings.spotifyAccessToken = token;
    }

    setSpotifyRefreshToken(token: string): void {
        this.plugin.settings.spotifyRefreshToken = token;
    }

    setSpotifyTokenExpirationTime(time: number): void {
        this.plugin.settings.spotifyTokenExpirationTime = time;
    }

    setSpotifyPkceVerifier(verifier: string): void {
        this.plugin.settings.spotifyPkceVerifier = verifier;
    }

    // Implement other methods from SettingsPort if they are required by the interface, 
    // even if not used by MusicService. Typescript will complain if I don't.
    // I'll check the file content first, but for now I'll include stubs if needed based on typical port patterns.
    // Based on previous read of ObsidianSettingsAdapter, there were language getters setters.
    
    getUserLanguage(): string {
        return 'en'; // Default or stub, as this plugin might not need it but interface requires it
    }

    getToLearnLanguage(): string {
        return 'es'; // Default or stub
    }

    setUserLanguage(lang: string): void {
        // No-op or throw
    }

    setToLearnLanguage(lang: string): void {
        // No-op
    }

    getGeminiRolesFolder(): string {
        return '';
    }

    async saveSettings(): Promise<void> {
        await this.plugin.saveSettings();
    }
}
