import { buildPlugin } from '../../libs/obsidian-plugin/esbuild.config.mjs';

buildPlugin({
  pluginId: 'elo-obsidian-spotify-plugin',
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
