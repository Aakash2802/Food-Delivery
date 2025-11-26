const cypress = require('cypress');

cypress.run({
  browser: 'chrome',
  headless: true,
  config: {
    baseUrl: 'http://localhost:5173',
    video: false,
    screenshotOnRunFailure: true,
  },
  env: {
    apiUrl: 'http://localhost:5000/api',
  },
}).then((results) => {
  console.log('\n========================================');
  console.log('CYPRESS TEST RESULTS');
  console.log('========================================\n');

  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passing: ${results.totalPassed}`);
  console.log(`Failing: ${results.totalFailed}`);
  console.log(`Pending: ${results.totalPending}`);
  console.log(`Skipped: ${results.totalSkipped}`);
  console.log(`Duration: ${results.totalDuration}ms`);

  if (results.totalFailed > 0) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}).catch((err) => {
  console.error('Error running Cypress:', err);
  process.exit(1);
});
