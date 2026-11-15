const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Alias react-native-worklets to react-native-worklets-core
config.resolver.extraNodeModules = {
  'react-native-worklets': path.resolve(__dirname, 'node_modules/react-native-worklets-core'),
};

// Performance optimizations
config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

// Enable caching
config.resetCache = false;

// Optimize asset resolutions
config.resolver.assetExts = [...config.resolver.assetExts, 'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'];

module.exports = config;
