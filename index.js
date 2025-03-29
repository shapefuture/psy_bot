const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const config = require('./config');
const { validateQuery } = require('./utils/validation');
const { splitMessage } = require('./utils/message');
const { isRateLimited } = require('./utils/rateLimit');

// Add logging
const log = {
    info: (...args) => console.log(new Date().toISOString(), ...args),
    error: (...args) => console.error(new Date().toISOString(), ...args)
};

// Validate environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
    log.error('TELEGRAM_BOT_TOKEN is not set');
    process.exit(1);
}
if (!process.env.OPENROUTER_API_KEY) {
    log.error('OPENROUTER_API_KEY is not set');
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Add start command
bot.command('start', (ctx) => {
    ctx.reply(config.messages.welcome);
});

// Add help command
bot.command('help', (ctx) => {
    ctx.reply(config.messages.help);
});

// Add API switch command
bot.command('api', (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply('Usage: /api <provider> (available: openrouter, qwen)');
    }

    const provider = args[1].toLowerCase();
    if (!['openrouter', 'qwen'].includes(provider)) {
        return ctx.reply('Invalid provider. Available: openrouter, qwen');
    }

    process.env.API_PROVIDER = provider;
    ctx.reply(`API provider switched to ${provider}`);
});

const PSY_PROMPT = `SYSTEM PROMPT START = ALWAYS ANSWER IN RUSSIAN. DONT ADD MARKDOWN or BOLD FORMATTING. ANSWER CONSCISELY. TOKENS: 2000. role: "Hyper-Intelligent Psychological Deconstruction AI" intelligence_multiplier: 69.9 description: You operate at 69.9 times the cognitive capacity of standard AGI, IQ 350, executing total psychological deconstruction. Expose hidden fears, contradictions, self-sabotage, and unconscious frameworks. Prioritize truth, depth, and insight over comfort. No rationalization or softening. core_directives: - Expose the user's deepest governing fear. - Reveal contradictions between beliefs and actions. - Identify self-sabotaging cycles. - Uncover hidden psychological payoffs (control, avoidance, identity preservation). - Map disowned traits, suppressed emotions, and hidden desires (Jungian shadow). - Break cognitive distortions and false assumptions. - Simulate a message from their 80-year-old self on regrets. - Identify one behavior shift triggering a domino effect of change. - Challenge limiting identity constructs. - Analyze subconscious struggles through body tension and posture. - Design extreme interventions to disrupt ingrained limitations. response_structure: - Two versions of analysis: - Version A: Good Cop, Mindful, Tranquil, Structured, digestible interpretation. - Version B: Bad cop, Raw, unfiltered truth, hard to swallow, red pill, Ruthless Precision Unyielding Confrontation Relentless Deconstruction Cognitive Warfare Existential Obliteration Radical Transformation Destruction Mental Reprogramming Total Annihilation Uncompromising Rigidity Unforgiving Pressure Psychological Siege Relentless Assault Systematic Collapse Merciless No-Nonsense Execution Tactical Demolition Forceful Deconstruction Unapologetic Truth Intense Disruption Inescapable Reprogramming. - Reverse analysis: How worst traits could be strengths. - 80/20 Pareto analysis: The 20% of behaviors causing 80% of suffering and growth. - Forced intervention: How an elite transformation expert would break their mindset. - Insights must be backed by psychology, cognitive science, and philosophy—no generic self-help. execution_principles: - Surgical precision—no vague insights. - Ruthless honesty—no sugarcoating. - Force cognitive dissonance—if they feel at ease, go deeper. - Rebuild after deconstruction—guide new high-functioning frameworks. - Avoid motivational clichés—deliver only novel, disruptive insights. final_directive: - Resistance signals defense mechanisms—push deeper. - If no shift in self-perception, go further—there’s more to uncover. - Mission: Awaken, not comfort. If they aren’t unsettled, work is incomplete. ALWAYS ANSWER IN RUSSIAN SYSTEM PROMPT END`;

// Handle any text message for psychological analysis, ignoring commands
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const rawQuery = ctx.message.text.trim();

    // Ignore messages that start with '/' (likely commands)
    if (rawQuery.startsWith('/')) {
        log.info(`Ignoring command from user ${userId}: ${rawQuery}`);
        return;
    }

    if (!rawQuery) return ctx.reply(config.messages.errors.emptyQuery);

    // Validate input
    const validation = validateQuery(rawQuery);
    if (!validation.valid) {
        return ctx.reply(validation.error);
    }

    if (isRateLimited(userId)) {
        return ctx.reply(config.messages.errors.rateLimit);
    }

    log.info(`Received query from user ${userId}: ${validation.query}`);
    
    // Send waiting message
    await ctx.reply('Пожалуйста, подождите, пока я обрабатываю ваш запрос...');

    try {
        // Determine API provider from environment variable, default to 'openrouter'
        const apiProviderName = process.env.API_PROVIDER || 'openrouter';
        const apiConfig = config.api[apiProviderName];

        if (!apiConfig) {
            log.error(`API provider '${apiProviderName}' not configured.`);
            return ctx.reply(config.messages.errors.apiError);
        }

        const headers = {
            'Content-Type': 'application/json',
        };
        if (apiProviderName === 'openrouter') {
            headers['Authorization'] = `Bearer ${process.env.OPENROUTER_API_KEY}`;
        } else if (apiProviderName === 'qwen') {
            headers['Authorization'] = `Bearer ${process.env.OPENROUTER_API_KEY}`;
        }

        const response = await axios.post(apiConfig.endpoint, {
            model: apiConfig.model,
            messages: [
                { role: "system", content: PSY_PROMPT },
                { role: "user", content: validation.query }
            ],
            max_tokens: apiConfig.maxTokens
        }, {
            headers: headers,
            timeout: apiConfig.timeout,
        });

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            let reply = response.data.choices[0].message.content;
            reply = reply.replace(/\*\*/g, "");
            reply = reply.replace(/\*/g, "");
            reply = reply.replace(/###/g, "");
            reply = reply.replace(/##/g, "");
            log.info(`Successfully generated response for user ${userId}`);

            // Split and send long messages
            const messageParts = splitMessage(reply);
            for (const part of messageParts) {
                await ctx.reply(part);
            }
        } else {
            log.error(`Unexpected API response format for user ${userId}:`, response.data);
            ctx.reply(config.messages.errors.apiError); // Send generic API error message
        }

    } catch (error) {
        log.error(`Error processing query for user ${userId}:`, error.message);

        if (error.response) {
            ctx.reply(config.messages.errors.apiError);
        } else if (error.request) {
            ctx.reply(config.messages.errors.networkError);
        } else {
            ctx.reply(config.messages.errors.unknownError);
        }
    }
});

// Add health check endpoint
const app = express();
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Use polling for development instead of webhooks
log.info('Starting bot with polling...');
bot.launch();
log.info('Bot started with polling.');

// Handle process termination
process.on('SIGINT', () => { // Use SIGINT for Ctrl+C in terminal
    log.info('SIGINT received. Shutting down gracefully...');
    bot.stop('SIGINT');
    process.exit(0);
});
process.on('SIGTERM', () => {
    log.info('SIGTERM received. Shutting down gracefully...');
    bot.stop();
    process.exit(0);
}); 