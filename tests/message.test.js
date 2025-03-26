const { splitMessage } = require('../utils/message');

describe('splitMessage', () => {
    test('should return single message for short text', () => {
        const text = 'This is a short message.';
        const result = splitMessage(text);
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(text);
    });

    test('should split long text into multiple parts', () => {
        const text = 'Part 1\n\nPart 2\n\nPart 3';
        const result = splitMessage(text, 10); // Using small maxLength for testing
        expect(result).toHaveLength(3);
        expect(result[0]).toBe('Part 1');
        expect(result[1]).toBe('Part 2');
        expect(result[2]).toBe('Part 3');
    });

    test('should handle text without paragraph breaks', () => {
        const text = 'This is a very long message that should be split into multiple parts because it exceeds the maximum length limit.';
        const result = splitMessage(text, 20); // Using small maxLength for testing
        expect(result.length).toBeGreaterThan(1);
        expect(result.every(part => part.length <= 20)).toBe(true);
    });

    test('should preserve paragraph breaks when possible', () => {
        const text = 'First paragraph.\n\nSecond paragraph with more content that might need to be split.\n\nThird paragraph.';
        const result = splitMessage(text, 30); // Using small maxLength for testing
        expect(result).toContain('First paragraph.');
        expect(result).toContain('Third paragraph.');
    });

    test('should handle empty text', () => {
        const result = splitMessage('');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe('');
    });

    test('should handle text with only whitespace', () => {
        const result = splitMessage('   \n\n   ');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe('');
    });
}); 