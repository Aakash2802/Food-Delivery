// Custom Cypress commands for Food Delivery App

/**
 * Login command - logs in a user
 * @param {string} email - User email
 * @param {string} password - User password
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"], input[type="email"]').clear().type(email);
  cy.get('input[name="password"], input[type="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();

  // Wait for login to complete and redirect
  cy.wait(5000);

  // Verify we're logged in by checking for token in localStorage
  cy.window().then((window) => {
    const token = window.localStorage.getItem('token');
    if (token) {
      cy.log('Login successful - token found');
    } else {
      cy.log('Login may have failed - no token found');
    }
  });
});

/**
 * Signup command - creates a new user account
 * @param {object} userData - User data (name, email, phone, password)
 */
Cypress.Commands.add('signup', (userData) => {
  cy.visit('/signup');
  cy.get('input[name="name"]').type(userData.name);
  cy.get('input[name="email"], input[type="email"]').type(userData.email);
  cy.get('input[name="phone"]').type(userData.phone);
  cy.get('input[name="password"], input[type="password"]').first().type(userData.password);

  // Handle confirm password if it exists
  cy.get('body').then(($body) => {
    if ($body.find('input[name="confirmPassword"]').length > 0) {
      cy.get('input[name="confirmPassword"]').type(userData.password);
    }
  });

  cy.get('button[type="submit"]').click();
});

/**
 * Logout command
 */
Cypress.Commands.add('logout', () => {
  cy.window().then((window) => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
  });
  cy.visit('/');
});

/**
 * Add item to cart
 * @param {string} itemName - Name of the menu item
 */
Cypress.Commands.add('addToCart', (itemName) => {
  cy.contains(itemName).parents('[class*="card"], [class*="item"]').within(() => {
    cy.contains('Add to Cart', { matchCase: false }).click();
  });
});

/**
 * Search for restaurants
 * @param {string} searchTerm - Search query
 */
Cypress.Commands.add('searchRestaurants', (searchTerm) => {
  cy.get('input[type="search"], input[placeholder*="Search"]').type(searchTerm);
  cy.wait(500); // Wait for debounce
});

/**
 * Select restaurant by name
 * @param {string} restaurantName - Name of the restaurant
 */
Cypress.Commands.add('selectRestaurant', (restaurantName) => {
  cy.contains(restaurantName).click();
  cy.url().should('include', '/restaurant');
});

/**
 * Complete checkout process
 * @param {object} deliveryInfo - Delivery address and contact info
 */
Cypress.Commands.add('checkout', (deliveryInfo = {}) => {
  cy.contains('Checkout', { matchCase: false }).click();

  // Fill delivery address if provided
  if (deliveryInfo.address) {
    cy.get('input[name*="address"], textarea[name*="address"]').type(deliveryInfo.address);
  }

  if (deliveryInfo.phone) {
    cy.get('input[name*="phone"]').type(deliveryInfo.phone);
  }

  // Select payment method (default to COD)
  cy.contains('Cash on Delivery', { matchCase: false }).click();

  // Place order
  cy.contains('Place Order', { matchCase: false }).click();
});

/**
 * Wait for API response
 * @param {string} endpoint - API endpoint pattern
 * @param {string} alias - Alias for the intercept
 */
Cypress.Commands.add('waitForAPI', (endpoint, alias = 'apiCall') => {
  cy.intercept('GET', `**/api/${endpoint}**`).as(alias);
  cy.wait(`@${alias}`);
});

/**
 * Check if user is logged in
 */
Cypress.Commands.add('isLoggedIn', () => {
  cy.window().then((window) => {
    const token = window.localStorage.getItem('token');
    return !!token;
  });
});

/**
 * Mock API response
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {object} response - Mock response data
 */
Cypress.Commands.add('mockAPI', (method, endpoint, response) => {
  cy.intercept(method, `**/api/${endpoint}**`, response).as('mockedAPI');
});
