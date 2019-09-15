module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!**/node_modules/**'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js'
  }
}
