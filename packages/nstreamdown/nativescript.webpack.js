/**
 * NativeScript webpack configuration for @nstudio/nstreamdown
 *
 * This file is auto-discovered by @nativescript/webpack and configures
 * svelte-loader to process .svelte files from this package.
 *
 * @param {typeof import("@nativescript/webpack")} webpack
 */
module.exports = (webpack) => {
  // Only apply svelte configuration if the project is using svelte
  const hasSvelte = webpack.Utils.dependencies.hasDependency('svelte');
  if (!hasSvelte) {
    return;
  }

  // Allow disabling via config if needed
  const shouldAutoload = webpack.Utils.config.getValue('nstreamdown.svelte.autoload', true);
  if (!shouldAutoload) {
    return;
  }

  webpack.chainWebpack((config) => {
    // Check if svelte rule exists
    if (!config.module.rules.has('svelte')) {
      return;
    }

    // Modify svelte-loader exclude to allow @nstudio/nstreamdown
    config.module
      .rule('svelte')
      .exclude.clear()
      .add(/node_modules[\\/](?!@nstudio[\\/]nstreamdown)/);
  });
};
