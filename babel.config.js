module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // reanimated v4 : le plugin Babel est fourni par react-native-worklets.
    plugins: ['react-native-worklets/plugin'],
  };
};
