const jestConfig = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js'
  }
}

// avoid collisions with dev server
process.env = Object.assign(process.env, { PORT: 3000 })

module.exports = jestConfig
