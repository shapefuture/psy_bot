# Telegram PSY Bot

A Telegram bot that acts as a Hyper-Intelligent Psychological Deconstruction AI. It responds to user queries with deep psychological analysis in Russian.

## Features

- Responds to `/psy` commands with detailed psychological analysis
- Provides deep psychological deconstruction in Russian
- Uses the OpenRouter API to generate responses
- Rate limiting to prevent abuse
- Health check endpoint
- Comprehensive error handling
- Development tools (ESLint, Jest, Nodemon)

## Setup Instructions

### Prerequisites

- Telegram account
- Render.com account
- GitHub account
- OpenRouter API key
- Node.js (v14 or higher)
- npm or yarn

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/telegram-psy-bot.git
   cd telegram-psy-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   OPENROUTER_API_KEY=your_openrouter_api_key
   PORT=3000
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Run tests:
   ```bash
   npm test
   ```

6. Lint code:
   ```bash
   npm run lint
   ```

### Production Deployment

1. Create Your Bot in Telegram:
   - Open Telegram, search for "BotFather", and type `/newbot`
   - Name your bot (e.g., "PsyBot") and give it a username (e.g., "@MyPsyBot")
   - Copy the token BotFather gives you

2. Host on Render:
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Configure:
     - Runtime: Node
     - Build Command: `npm install`
     - Start Command: `node index.js`
   - Add Environment Variables:
     - `TELEGRAM_BOT_TOKEN`: Your bot token from Step 1
     - `OPENROUTER_API_KEY`: Your API key from OpenRouter

3. Link to Telegram:
   ```bash
   curl -F "url=https://your-render-url.onrender.com/telegram-webhook" https://api.telegram.org/bot<your-token>/setWebhook
   ```

4. Use the Bot:
   Open Telegram, find your bot, and type:
   ```
   /psy Почему я откладываю дела?
   ```

## Available Commands

- `/start` - Begin interaction with the bot
- `/help` - Show available commands and examples
- `/psy [вопрос]` - Get psychological analysis

## Rate Limiting

The bot implements rate limiting to prevent abuse:
- 5 requests per minute per user
- Rate limit messages are shown in Russian

## Health Monitoring

The bot includes a health check endpoint at `/health` that returns:
```json
{
  "status": "ok"
}
```

## Notes

- The free Render plan sleeps after inactivity, so first responses may be slow
- The bot always responds in Russian
- All responses are logged with timestamps
- Error handling includes specific messages for different types of failures

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 