export interface SpotifyPluginSettings {
    spotifyClientId: string;
    spotifyClientSecret: string; // Kept for consistency, though unused in implicit flow usually, but might be needed if user wants to use it (e.g. for server-side flow, though we use implicit/PKCE). Actually, PKCE doesn't need secret. But let's keep strictly what is needed. Core didn't seem to use secret in frontend.
    spotifyAccessToken: string;
    spotifyRefreshToken: string;
    spotifyTokenExpirationTime: number;
    spotifyPkceVerifier: string;
}

export const DEFAULT_SETTINGS: SpotifyPluginSettings = {
    spotifyClientId: '',
    spotifyClientSecret: '',
    spotifyAccessToken: '',
    spotifyRefreshToken: '',
    spotifyTokenExpirationTime: 0,
    spotifyPkceVerifier: ''
}
