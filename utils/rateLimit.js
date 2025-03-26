const config = require('../config');

// Rate limiting map
const rateLimit = new Map();

/**
 * Checks if a user has exceeded their rate limit
 * @param {string} userId - The user's ID
 * @returns {boolean} - Whether the user is rate limited
 */
function isRateLimited(userId) {
    const now = Date.now();
    const userLimit = rateLimit.get(userId) || { count: 0, resetTime: now + config.rateLimit.window };
    
    if (now > userLimit.resetTime) {
        userLimit.count = 0;
        userLimit.resetTime = now + config.rateLimit.window;
    }
    
    if (userLimit.count >= config.rateLimit.requests) {
        return true;
    }
    
    userLimit.count++;
    rateLimit.set(userId, userLimit);
    return false;
}

module.exports = {
    isRateLimited,
    rateLimit // Exported for testing
}; 