module.exports = {
  testEnvironment: 'node',
  transform: {},
  testRegex: '/test/.*\\.test\\.js$',
  setupFiles: ['<rootDir>/jest.env.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs']
};
