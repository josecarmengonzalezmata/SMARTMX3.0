module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 👈 ELIMINADO: 'react-native-reanimated/plugin'
      // Si tienes otros plugins, déjalos aquí
    ],
  };
};