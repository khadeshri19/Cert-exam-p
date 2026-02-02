import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase Jest timeout for integration tests
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
    // Clean up any resources
});
