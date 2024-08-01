module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', '@babel/preset-flow'],
    env: {
      production: {
        plugins: [
          [
            'babel-plugin-module-resolver', {
            alias: {
              'react-native-vector-icons': '@expo/vector-icons',
            },
          }],
        ],
      },
    },
  };
};
