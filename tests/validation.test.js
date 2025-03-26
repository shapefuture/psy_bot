const { validateQuery } = require('../utils/validation');
const config = require('../config');

describe('validateQuery', () => {
    test('should accept valid query', () => {
        const query = 'What are the psychological implications of social media use?';
        const result = validateQuery(query);
        expect(result.isValid).toBe(true);
        expect(result.query).toBe(query);
    });

    test('should reject empty query', () => {
        const result = validateQuery('');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Query cannot be empty');
    });

    test('should reject query with only whitespace', () => {
        const result = validateQuery('   \n\n   ');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Query cannot be empty');
    });

    test('should reject query that is too short', () => {
        const result = validateQuery('Hi');
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Query is too short');
    });

    test('should reject query that is too long', () => {
        const longQuery = 'a'.repeat(1001);
        const result = validateQuery(longQuery);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Query is too long');
    });

    test('should reject spam-like query', () => {
        const spamQuery = 'a'.repeat(100) + '!'.repeat(100);
        const result = validateQuery(spamQuery);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Query contains spam-like patterns');
    });

    test('should sanitize query with excessive whitespace', () => {
        const query = '   This   has   too   much   whitespace   ';
        const result = validateQuery(query);
        expect(result.isValid).toBe(true);
        expect(result.query).toBe('This has too much whitespace');
    });

    test('should handle query with special characters', () => {
        const query = 'What are the psychological effects of @#$%^&*?';
        const result = validateQuery(query);
        expect(result.isValid).toBe(true);
        expect(result.query).toBe(query);
    });
}); 