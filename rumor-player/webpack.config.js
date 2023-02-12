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
  const envName = env.dev === true ? 'dev' : 'prod'
  const envConfig = require(`./webpack/webpack.${envName}.js`);

  console.log(envConfig)

  return merge.merge(config, envConfig)
};