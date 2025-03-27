require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'OPENROUTER_API_KEY'];
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
            psy: '/psy'
        }
    },

    // API configuration
    api: {
        openrouter: {
            key: process.env.OPENROUTER_API_KEY,
            endpoint: 'https://openrouter.ai/api/v1/chat/completions',
            model: 'anthropic/claude-3-opus-20240229'
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
/psy <query> - Get psychological analysis of your query`,
        errors: {
            emptyQuery: 'Please provide a query after the /psy command.',
            queryTooShort: 'Your query is too short. Please provide more details.',
            queryTooLong: 'Your query is too long. Please keep it concise.',
            invalidFormat: 'Your query contains invalid characters or patterns.',
            rateLimit: 'You have reached the rate limit. Please wait a moment before trying again.',
            apiError: 'An error occurred while processing your request. Please try again later.'
        }
    }
}; 