// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "karma-typescript"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-coverage"),
      require("karma-typescript")
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"]
      }
    },
    coverageReporter: {
      type: "lcov",
      subdir: "."
    },
    reporters: ["progress", "coverage"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadlessNoSandbox"],
    singleRun: false,
    restartOnFileChange: true,
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },
    files: ["src/lib/**/*.ts"]
  });
};
