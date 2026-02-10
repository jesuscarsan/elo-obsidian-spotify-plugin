import { buildPlugin } from '../../../libs/obsidian-plugin/scripts/esbuild.config.mjs';

buildPlugin({
  pluginId: 'elo-obsidian-spotify-plugin',
  entryPoints: ['src/main.ts'],
  outfile: 'dist/main.js',
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
