const config = require('../config');

/**
 * Validates and sanitizes a user query
 * @param {string} query - The user's query to validate
 * @returns {Object} - Validation result with valid flag and either query or error message
 */
function validateQuery(query) {
    // Remove excessive whitespace
    query = query.replace(/\s+/g, ' ').trim();
    
    // Check minimum length
    if (query.length < config.validation.minQueryLength) {
        return {
            valid: false,
            error: config.messages.errors.queryTooShort
        };
    }
    
    // Check maximum length
    if (query.length > config.validation.maxQueryLength) {
        return {
            valid: false,
            error: config.messages.errors.queryTooLong
        };
    }
    
    // Check for common spam patterns
    for (const pattern of config.validation.spamPatterns) {
        if (pattern.test(query)) {
            return {
                valid: false,
                error: config.messages.errors.invalidFormat
            };
        }
    }
    
    return { valid: true, query };
}

module.exports = {
    validateQuery
}; 