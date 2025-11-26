// Cypress support file for E2E tests

// Import commands
import './commands';

// Disable uncaught exception failures
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // You can add specific error handling here if needed
  return false;
});

// Custom before hook for all tests
beforeEach(() => {
  // Clear local storage and cookies before each test
  cy.clearLocalStorage();
  cy.clearCookies();
});
