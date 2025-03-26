// Mock console methods to avoid cluttering test output
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// Mock Date.now() for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());

// Mock process.env for testing
process.env.TELEGRAM_BOT_TOKEN = 'test-token';
process.env.OPENROUTER_API_KEY = 'test-key';
process.env.PORT = '3000';

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
}); 