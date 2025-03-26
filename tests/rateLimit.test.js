const { isRateLimited } = require('../utils/rateLimit');

describe('isRateLimited', () => {
    beforeEach(() => {
        // Reset rate limit map before each test
        global.rateLimit = new Map();
    });

    test('should allow requests within limit', () => {
        const userId = '123';
        for (let i = 0; i < 5; i++) {
            expect(isRateLimited(userId)).toBe(false);
        }
    });

    test('should block requests exceeding limit', () => {
        const userId = '123';
        for (let i = 0; i < 5; i++) {
            isRateLimited(userId);
        }
        expect(isRateLimited(userId)).toBe(true);
    });

    test('should reset limit after window', () => {
        const userId = '123';
        // Fill up the limit
        for (let i = 0; i < 5; i++) {
            isRateLimited(userId);
        }
        // Mock time passing
        jest.advanceTimersByTime(61000); // Advance past the window
        expect(isRateLimited(userId)).toBe(false);
    });

    test('should handle multiple users independently', () => {
        const user1 = '123';
        const user2 = '456';
        
        // Fill up user1's limit
        for (let i = 0; i < 5; i++) {
            isRateLimited(user1);
        }
        
        // User2 should still be able to make requests
        expect(isRateLimited(user2)).toBe(false);
        // User1 should be limited
        expect(isRateLimited(user1)).toBe(true);
    });
}); 