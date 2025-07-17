// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for database files (for WatermelonDB)
config.resolver.assetExts.push('db');

// Add support for additional source extensions
config.resolver.sourceExts.push('cjs');

// Configure transformer for better crypto library support
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true
  }
});

// Add resolver aliases to match your babel.config.js
config.resolver.alias = {
  '@api': './src/api',
  '@appTypes': './src/appTypes',
  '@assets': './src/assets',
  '@components': './src/components',
  '@constants': './src/constants',
  '@contexts': './src/contexts',
  '@crypto': './crypto',
  '@database': './src/database',
  '@hooks': './src/hooks',
  '@lib': './src/lib',
  '@models': './src/models',
  '@navigation': './src/navigation',
  '@screens': './src/screens',
  '@theme': './src/theme',
  '@utils': './src/utils',
  // Node.js polyfills
  'crypto': 'react-native-quick-crypto',
  'stream': 'stream-browserify',
  'buffer': '@craftzdog/react-native-buffer',
  'http': '@tradle/react-native-http',
  'https': 'https-browserify',
  'os': 'react-native-os',
  'url': 'url',
  'events': 'events'
};

// Increase Metro's memory limit for large crypto libraries
config.maxWorkers = 2;

// Configure Metro to handle node_modules better
config.resolver.nodeModulesPaths = ['./node_modules'];

// Add custom resolver for better compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configure watchman ignore patterns for better performance
config.watchFolders = [__dirname];

module.exports = config;
