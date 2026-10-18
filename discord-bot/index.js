require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { request } = require('undici');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

const API_WEBHOOK_URL = process.env.API_WEBHOOK_URL || 'http://127.0.0.1:8000/api/discord/presence-update';
const TARGET_USER_ID = process.env.TARGET_DISCORD_USER_ID;

client.once('ready', () => {
    console.log(`[SleepOrDie Guard] Logged in as ${client.user.tag}`);
    console.log(`[SleepOrDie Guard] Watching Target: ${TARGET_USER_ID || 'ALL REGISTERED USERS'}`);
    console.log(`[SleepOrDie Guard] Forwarding updates to: ${API_WEBHOOK_URL}`);
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.userId) return;

    // If specific target is defined in .env, filter by it; otherwise relay for all guild targets
    if (TARGET_USER_ID && newPresence.userId !== TARGET_USER_ID) {
        return;
    }

    const userId = newPresence.userId;
    const status = newPresence.status; // 'online' | 'idle' | 'dnd' | 'offline'

    const activities = newPresence.activities.map((a) => ({
        name: a.name,
        type: a.type,
        details: a.details,
    }));

    console.log(`[Presence Update] User ${userId} is now ${status.toUpperCase()} (${activities.length} activities)`);

    try {
        const { statusCode, body } = await request(API_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                discord_user_id: userId,
                status: status,
                activities: activities,
            }),
        });

        const responseText = await body.text();
        if (statusCode === 200) {
            const data = JSON.parse(responseText);
            if (data.penalized) {
                console.warn(`[PENALTY TRIGGERED] User ${userId} was active during sleep window! HP: ${data.current_hp}`);
            } else if (data.auto_confirmed) {
                console.log(`[SLEEP AUTO-CONFIRMED] User ${userId} went offline/idle during sleep window - Sleep confirmed!`);
            }
        }
    } catch (err) {
        console.error(`[Error] Failed to forward presence update to Laravel:`, err.message);
    }
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
    console.error('ERROR: Missing DISCORD_BOT_TOKEN in .env');
    console.log('Please create .env file and set DISCORD_BOT_TOKEN.');
    process.exit(1);
}

client.login(TOKEN);
