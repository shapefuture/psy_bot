require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'OPENROUTER_API_KEY', 'GOOGLE_API_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

module.exports = {
    // Bot configuration
    bot: {
        token: process.env.TELEGRAM_BOT_TOKEN,
        commands: {
            start: '/start',
            help: '/help',
            api: '/api'
        }
    },

    // API configuration
    api: {
        openrouter: {
            key: process.env.OPENROUTER_API_KEY,
            endpoint: 'https://openrouter.ai/api/v1/chat/completions',
            model: 'deepseek/deepseek-chat-v3-0324:free',
            maxTokens: 2000, // Default max tokens
            temperature: 1.2,
            timeout: 45000 // Increased timeout for longer responses
        },

        qwen: {
            key: process.env.OPENROUTER_API_KEY,
            endpoint: 'https://openrouter.ai/api/v1/chat/completions',
            model: 'google/gemma-3-27b-it:free',
            temperature: 1.2,
            maxTokens: 2000, // Default max tokens
            timeout: 45000 // Increased timeout for longer responses
        }
    },

    // Server configuration
    server: {
        port: process.env.PORT || 3000
    },

    // Rate limiting configuration
    rateLimit: {
        maxRequests: 10,
        timeWindow: 60 * 1000 // 1 minute in milliseconds
    },

    // Query validation configuration
    validation: {
        minLength: 10,
        maxLength: 1000,
        spamPatterns: [
            /^[A-Z\s!@#$%^&*()]+$/, // All caps with special characters
            /(.)\1{4,}/, // Repeated characters
            /^[!@#$%^&*()]+$/ // Only special characters
        ]
    },

    // Messages
    messages: {
        welcome: 'Welcome to the Psychological Analysis Bot! Use /help to see available commands.',
        help: `Available commands:
/start - Start the bot
/help - Show this help message
/api openrouter or /api qwen - Change the model`,
        errors: {
            emptyQuery: 'Please provide a query.',
            queryTooShort: 'Your query is too short. Please provide more details.',
            queryTooLong: 'Your query is too long. Please keep it concise.',
            invalidFormat: 'Your query contains invalid characters or patterns.',
            rateLimit: 'You have reached the rate limit. Please wait a moment before trying again.',
            apiError: 'An error occurred while processing your request. Please try again later.'
        }
    }
}; 