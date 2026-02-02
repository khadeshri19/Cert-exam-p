// Jest test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for async tests
jest.setTimeout(30000);

// Clear all mocks after each test
afterEach(() => {
    jest.clearAllMocks();
});

// Global teardown
afterAll(async () => {
    // Add any global cleanup here
});
