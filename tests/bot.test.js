const TelegramBot = require('node-telegram-bot-api');
const { validateQuery } = require('../utils/validation');
const { splitMessage } = require('../utils/message');
const { isRateLimited } = require('../utils/rateLimit');

// Mock TelegramBot
jest.mock('node-telegram-bot-api');

describe('Bot Functionality', () => {
    let bot;
    const mockChatId = 123456789;
    const mockMessageId = 987654321;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Create a new bot instance for each test
        bot = new TelegramBot('test-token', { polling: false });
    });

    describe('Command Handlers', () => {
        test('should handle /start command', () => {
            const mockMsg = {
                chat: { id: mockChatId },
                message_id: mockMessageId,
                text: '/start'
            };
            
            bot.emit('message', mockMsg);
            
            expect(bot.sendMessage).toHaveBeenCalledWith(
                mockChatId,
                expect.stringContaining('Welcome'),
                expect.any(Object)
            );
        });

        test('should handle /help command', () => {
            const mockMsg = {
                chat: { id: mockChatId },
                message_id: mockMessageId,
                text: '/help'
            };
            
            bot.emit('message', mockMsg);
            
            expect(bot.sendMessage).toHaveBeenCalledWith(
                mockChatId,
                expect.stringContaining('help'),
                expect.any(Object)
            );
        });

        test('should handle /psy command with valid query', () => {
            const mockMsg = {
                chat: { id: mockChatId },
                message_id: mockMessageId,
                text: '/psy What are the psychological effects of social media?'
            };
            
            bot.emit('message', mockMsg);
            
            expect(bot.sendMessage).toHaveBeenCalledWith(
                mockChatId,
                expect.any(String),
                expect.any(Object)
            );
        });

        test('should handle /psy command with invalid query', () => {
            const mockMsg = {
                chat: { id: mockChatId },
                message_id: mockMessageId,
                text: '/psy ' // Empty query
            };
            
            bot.emit('message', mockMsg);
            
            expect(bot.sendMessage).toHaveBeenCalledWith(
                mockChatId,
                expect.stringContaining('error'),
                expect.any(Object)
            );
        });
    });

    describe('Rate Limiting', () => {
        test('should allow requests within rate limit', () => {
            const userId = 123;
            const result = isRateLimited(userId);
            expect(result).toBe(false);
        });

        test('should block requests exceeding rate limit', () => {
            const userId = 123;
            // Make multiple requests to exceed the limit
            for (let i = 0; i < 10; i++) {
                isRateLimited(userId);
            }
            const result = isRateLimited(userId);
            expect(result).toBe(true);
        });
    });

    describe('Message Handling', () => {
        test('should split long messages', () => {
            const longMessage = 'Part 1\n\nPart 2\n\nPart 3';
            const result = splitMessage(longMessage, 10);
            expect(result).toHaveLength(3);
            expect(result[0]).toBe('Part 1');
            expect(result[1]).toBe('Part 2');
            expect(result[2]).toBe('Part 3');
        });

        test('should validate user queries', () => {
            const validQuery = 'What are the psychological effects of stress?';
            const result = validateQuery(validQuery);
            expect(result.isValid).toBe(true);
            expect(result.query).toBe(validQuery);
        });
    });

    describe('Error Handling', () => {
        test('should handle API errors gracefully', async () => {
            const mockMsg = {
                chat: { id: mockChatId },
                message_id: mockMessageId,
                text: '/psy Test query'
            };

            // Simulate API error
            bot.sendMessage.mockRejectedValueOnce(new Error('API Error'));
            
            bot.emit('message', mockMsg);
            
            expect(bot.sendMessage).toHaveBeenCalledWith(
                mockChatId,
                expect.stringContaining('error'),
                expect.any(Object)
            );
        });
    });
}); 