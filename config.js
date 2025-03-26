module.exports = {
    // API Configuration
    openrouter: {
        apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'deepseek/deepseek-chat-v3-0324:free',
        maxTokens: 4096,
        timeout: 30000, // 30 seconds
    },

    // Rate Limiting
    rateLimit: {
        requests: 5,    // requests per window
        window: 60000,  // window in milliseconds (1 minute)
    },

    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        webhookPath: '/telegram-webhook',
    },

    // Messages
    messages: {
        welcome: `Привет! Я PSY бот - ваш персональный психологический аналитик.
    
Используйте команду /psy и задайте свой вопрос, например:
/psy Почему я боюсь успеха?
/psy Как преодолеть прокрастинацию?

Я проанализирую вашу ситуацию и предоставлю глубокий психологический анализ.`,
        
        help: `Доступные команды:
/start - Начать работу с ботом
/help - Показать это сообщение
/psy [вопрос] - Получить психологический анализ

Примеры вопросов:
/psy Почему я откладываю важные дела?
/psy Как справиться с тревогой?
/psy Почему я не могу найти партнера?`,

        errors: {
            rateLimit: 'Вы достигли лимита запросов. Пожалуйста, подождите минуту перед следующим запросом.',
            apiError: 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.',
            networkError: 'Проблема с подключением. Проверьте интернет и попробуйте снова.',
            unknownError: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.',
            emptyQuery: 'Задайте вопрос, например: /psy Почему я боюсь?',
            queryTooShort: 'Вопрос слишком короткий. Пожалуйста, задайте более подробный вопрос.',
            queryTooLong: 'Вопрос слишком длинный. Пожалуйста, сделайте его короче.',
            invalidFormat: 'Пожалуйста, задайте вопрос в нормальном формате.'
        }
    },

    // Validation
    validation: {
        minQueryLength: 3,
        maxQueryLength: 500,
        spamPatterns: [
            /(.)\1{4,}/,  // Repeated characters
            /[A-Z]{5,}/,  // All caps
            /[!@#$%^&*]{3,}/  // Excessive special characters
        ]
    }
}; 