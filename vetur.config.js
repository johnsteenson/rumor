// vetur.config.js
/** @type {import('vls').VeturConfig} */
module.exports = {
  settings: {
    "vetur.useWorkspaceDependencies": true,
    "vetur.experimental.templateInterpolationService": true
  },
  // **optional** default: `[{ root: './' }]`
  // support monorepos
  projects: [
    {
      root: './rumor-editor',
      package: './package.json',
      tsconfig: './tsconfig.json',
      globalComponents: [
        './src/components/**/*.vue'
      ]
    }
  ]
}
