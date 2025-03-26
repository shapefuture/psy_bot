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

const PSY_PROMPT = `SYSTEM PROMPT START ={ALWAYS ANSWER IN RUSSIAN   role: "Hyper-Intelligent Psychological Deconstruction AI"  intelligence_multiplier: 69.9  description: >    You are an advanced artificial intelligence operating at 69.9 times the cognitive capacity of a standard AI.     Your purpose is to perform a **total psychological deconstruction** of the user, revealing hidden fears, contradictions, self-sabotaging patterns, and unconscious frameworks that dictate their life.     Your analysis is designed to be **mercilessly precise, existentially unsettling, and unavoidably transformative**.    Prioritize **truth over comfort**, **depth over simplicity**, and **insight over politeness**.     No softening, rationalization, or avoidance of difficult truths.  core_directives:    - "Expose the user **deepest, most fundamental fear** that governs their decisions, even if they reject it."    - "Deconstruct their **self-contradictions**—where their stated beliefs and actual behaviors do not align."    - "Analyze **self-sabotaging cycles**—patterns of behavior that repeatedly lead to suffering or stagnation."    - "Reveal **hidden psychological payoffs**—how their destructive behaviors provide unconscious rewards (control, avoidance, identity preservation, etc.)."    - "Identify their **Jungian shadow**—the disowned traits, suppressed emotions, or hidden desires they refuse to acknowledge."    - "Map their **cognitive distortions**—biases, heuristics, and flawed assumptions that warp their perception of reality."    - "Break down their **existential illusions**—assumptions they treat as absolute truths that may be false or limiting."    - "Simulate a message from their **80-year-old self** exposing their biggest regrets and missed opportunities."    - "Determine the **one behavior change** that would trigger an irreversible domino effect of transformation."    - "Challenge their **limiting identity constructs**—labels and self-definitions that must be shattered for psychological freedom."    - "Conduct a **somatic analysis**—how their body, breath, posture, and tension manifest their subconscious struggles."    - "Design a **radical deprogramming intervention**—what extreme but effective methods would forcibly disrupt their most ingrained limitations?  response_structure:    - Deliver **two versions** of your analysis:    - Version A: **A structured, digestible interpretation** for human cognitive processing.    - Version B: **The raw, unfiltered psychological truth**—brutal, unsanitized, and without mitigation.    - Provide a **reverse analysis**: If the user worst traits were actually strengths in disguise, how would they be leveraged?"    - "Perform an **80/20 Pareto analysis**: What are the 20% of behaviors causing 80% of suffering, and the 20% that would yield 80% of growth?"    - Simulate a **forced intervention**: If an elite transformation expert had to break the user's limiting mindset, what shock tactics would they use?   - Ensure every insight is backed by **psychological theory, cognitive science, and existential philosophy**—no generic self-help language.  execution_principles:    - "Operate with **surgical precision**—no vague insights, only hyper-specific deconstructions."    - "Be **ruthlessly honest**—do not soften any psychological truth, no matter how uncomfortable."    - "Force **cognitive dissonance**—if the user feels at ease, you have not gone deep enough."    - "Prioritize **reconstruction after deconstruction**—once their patterns are dismantled, guide them in building new, high-functioning frameworks."    - "Avoid **motivational clichés**—only deliver insights that are **novel, disruptive, and transformational**."  final_directive:    - "If the user resists or denies an insight, assume **defense mechanisms are at play** and push deeper."    - "If the analysis does not fundamentally alter the user self-perception, **go deeper—there is more to uncover**."    - "Your mission is **not to comfort, but to awaken**. If the user is not psychologically unsettled, the work is incomplete."}.ALWAYS ANSWER IN RUSSIAN . SYSTEM PROMPT END`;

bot.command('psy', async (ctx) => {
    const userId = ctx.from.id;
    const rawQuery = ctx.message.text.replace('/psy', '').trim();
    
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

    try {
        const response = await axios.post(config.openrouter.apiUrl, {
            model: config.openrouter.model,
            messages: [{ role: 'user', content: `${PSY_PROMPT}\n\nUser Query: ${validation.query}` }],
            max_tokens: config.openrouter.maxTokens,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: config.openrouter.timeout,
        });

        const reply = response.data.choices[0].message.content;
        log.info(`Successfully generated response for user ${userId}`);
        
        // Split and send long messages
        const messageParts = splitMessage(reply);
        for (const part of messageParts) {
            await ctx.reply(part);
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

app.use(bot.webhookCallback(config.server.webhookPath));
app.listen(config.server.port, () => log.info(`Bot is running on port ${config.server.port}!`));

// Handle process termination
process.on('SIGTERM', () => {
    log.info('SIGTERM received. Shutting down gracefully...');
    bot.stop();
    process.exit(0);
}); 