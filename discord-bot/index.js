require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { request } = require('undici');

const API_WEBHOOK_URL = process.env.API_WEBHOOK_URL || 'http://127.0.0.1:8000/api/discord/presence-update';
const TARGET_USER_ID = process.env.TARGET_DISCORD_USER_ID;
const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
    console.error('❌ ERROR: Missing DISCORD_BOT_TOKEN in .env');
    console.log('Please create .env file and set DISCORD_BOT_TOKEN.');
    process.exit(1);
}

function createClient(withPrivilegedIntents = true) {
    const intents = withPrivilegedIntents
        ? [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences]
        : [GatewayIntentBits.Guilds];

    const client = new Client({ intents });

    client.once('clientReady', () => {
        console.log(`\n======================================================`);
        console.log(`🌙 [SleepOrDie Guard] Logged in as: ${client.user.tag} (ID: ${client.user.id})`);
        console.log(`📡 [Mode]: ${withPrivilegedIntents ? 'FULL (Presence Tracking Active)' : 'STANDALONE (Alert & Online Ready)'}`);
        console.log(`👥 [Connected Guilds]: ${client.guilds.cache.size} server(s)`);
        client.guilds.cache.forEach((g) => console.log(`   - Server: ${g.name} (ID: ${g.id})`));
        console.log(`🎯 [Target User]: ${TARGET_USER_ID || 'ALL REGISTERED USERS'}`);
        console.log(`🔗 [Forwarding Webhook]: ${API_WEBHOOK_URL}`);
        console.log(`======================================================\n`);

        try {
            client.user.setPresence({
                activities: [{ name: 'SleepOrDie | Guarding Bedtime 🌙', type: ActivityType.Custom }],
                status: 'online',
            });
        } catch (e) {}
    });

    if (withPrivilegedIntents) {
        client.on('presenceUpdate', async (oldPresence, newPresence) => {
            if (!newPresence || !newPresence.userId) return;

            // If specific target is defined in .env, filter by it; otherwise relay for all guild targets
            if (TARGET_USER_ID && newPresence.userId !== TARGET_USER_ID) {
                return;
            }

            const userId = newPresence.userId;
            const status = newPresence.status; // 'online' | 'idle' | 'dnd' | 'offline'

            const activities = (newPresence.activities || []).map((a) => ({
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
                        console.warn(`⚠️ [PENALTY TRIGGERED] User ${userId} was active during sleep window! HP: ${data.current_hp}`);
                    } else if (data.auto_confirmed) {
                        console.log(`✅ [SLEEP AUTO-CONFIRMED] User ${userId} went offline/idle during sleep window - Sleep confirmed!`);
                    }
                }
            } catch (err) {
                console.error(`[Error] Failed to forward presence update to Laravel:`, err.message);
            }
        });
    }

    client.on('error', (err) => {
        console.error('❌ [Discord Bot Error]:', err.message);
    });

    return client;
}

async function start() {
    console.log('⏳ Attempting login with Full Gateway Intents (Presence Tracking)...');
    let client = createClient(true);

    try {
        await client.login(TOKEN);
    } catch (err) {
        if (err.message && err.message.includes('disallowed intents')) {
            console.warn(`\n⚠️  [NOTICE: Disallowed Intents Encountered]`);
            console.warn(`Discord Gateway ปฏิเสธการขอสิทธิ์ Presence Tracking เนื่องจากยังไม่ได้เปิดสวิตช์ใน Discord Developer Portal`);
            console.warn(`👉 วิธีเปิดสิทธิ์สมบูรณ์:`);
            console.warn(`   1. เปิดลิงก์: https://discord.com/developers/applications/1561354604417908846/bot`);
            console.warn(`   2. เลื่อนลงไปที่ "Privileged Gateway Intents"`);
            console.warn(`   3. เปิดสวิตช์ [✓] PRESENCE INTENT และ [✓] SERVER MEMBERS INTENT`);
            console.warn(`   4. กดปุ่ม "Save Changes" ด้านล่าง`);
            console.warn(`\n🔄 กำลังสลับไปทำงานในโหมด Standalone / Online Alert Bot ชั่วคราว...`);

            client = createClient(false);
            await client.login(TOKEN);
        } else {
            console.error('❌ Login failed with unexpected error:', err);
            process.exit(1);
        }
    }
}

start();

