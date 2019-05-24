module.exports = function(config) {
  config.set({
    maxConcurrentTestRunners: 2, // ref https://github.com/stryker-mutator/stryker/issues/1542#issuecomment-491756095
    mutate: [
      'src/**/*.js',
      '!src/defaults.js',
      '!src/errors.js',
      '!src/index.js'
    ],
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['clear-text'],
    testRunner: 'mocha',
    mochaOptions: {
      spec: ['./test/unit/**/*.test.js'],
      require: ['./test/unitTestHelper.js']
    },
    transpilers: [],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    thresholds: { high: 80, low: 70, break: null }
  })
}
