const merge = require('webpack-merge');
const path = require('path');

const env = process.env.NODE_ENV || 'dev';

const config = {
  devServer: {
    port: 8081
  },
  entry: {
    main: './src/index.ts'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
}

module.exports = env => {
  const envConfig = require(`./webpack/webpack.${env}.js`);

  return merge(config, envConfig);
};