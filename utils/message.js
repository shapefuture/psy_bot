/**
 * Escapes special characters in text for Telegram markdown
 * @param {string} text - The text to escape
 * @returns {string} The escaped text
 */
function escapeTelegramMarkdown(text) {
    const specialChars = /[_*\[\]()~`>#+\-=\|{}\.!\s]/g;
    return text.replace(specialChars, '\\$&');
}

/**
 * Splits a long message into parts that fit within Telegram's message length limit
 * @param {string} text - The message to split
 * @param {number} maxLength - Maximum length for each part (default: 4096)
 * @returns {string[]} - Array of message parts
 */
function splitMessage(text, maxLength = 4096) {
    if (text.length <= maxLength) return [text];
    
    const parts = [];
    let currentPart = '';
    
    // Split by paragraphs first
    const paragraphs = text.split('\n\n');
    
    for (const paragraph of paragraphs) {
        if (currentPart.length + paragraph.length + 1 <= maxLength) {
            currentPart += (currentPart ? '\n\n' : '') + paragraph;
        } else {
            if (currentPart) parts.push(currentPart);
            currentPart = paragraph;
        }
    }
    
    if (currentPart) parts.push(currentPart);
    
    return parts;
}

module.exports = {
    splitMessage,
};