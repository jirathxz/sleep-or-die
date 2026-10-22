require('dotenv').config();
const http = require('http');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { request } = require('undici');

const API_WEBHOOK_URL = process.env.API_WEBHOOK_URL || 'http://127.0.0.1:8000/api/discord/presence-update';
const TARGET_USER_ID = process.env.TARGET_DISCORD_USER_ID || '938410584364429362';
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const STATUS_PORT = parseInt(process.env.BOT_STATUS_PORT || '3001', 10);

if (!TOKEN) {
    console.error('❌ ERROR: Missing DISCORD_BOT_TOKEN in .env');
    process.exit(1);
}

// In-memory cache of user states for instant queries
const userStateCache = new Map();

function evaluateUserStatus(member) {
    if (!member || !member.user) return null;
    const userId = member.id;
    const rawStatus = member.presence?.status || 'offline';
    const voiceState = member.voice;
    const isInVoice = !!(voiceState && voiceState.channelId);
    const voiceChannelName = isInVoice ? (voiceState.channel?.name || 'Voice Room') : null;
    const guildName = member.guild?.name || 'Unknown Guild';

    // Rule 1: สถานะที่ตั้งไว้ (online, idle, dnd, offline)
    // Rule 2: หากยังอยู่ในห้องคุยยังถือว่าออนไลน์ (if in voice channel, always considered online!)
    let effectiveStatus = rawStatus;
    let reason = `สถานะที่ตั้งไว้ใน Discord: ${rawStatus.toUpperCase()}`;

    if (isInVoice) {
        effectiveStatus = 'online';
        reason = `กำลังอยู่ในห้องคุยเสียง "${voiceChannelName}" (ถือว่าออนไลน์ตามกฎข้อ 2)`;
    }

    const state = {
        userId,
        username: member.user.username || member.user.tag,
        tag: member.user.tag || member.user.username,
        rawStatus,
        isInVoice,
        voiceChannelName,
        guildName,
        effectiveStatus,
        isConsideredOnline: effectiveStatus === 'online' || effectiveStatus === 'dnd',
        reason,
        activities: (member.presence?.activities || []).map((a) => ({
            name: a.name,
            type: a.type,
            details: a.details,
        })),
        updatedAt: new Date().toISOString(),
    };

    userStateCache.set(userId, state);
    return state;
}

const DISCORD_WEBHOOK_SECRET = process.env.DISCORD_WEBHOOK_SECRET;

async function forwardPresenceToLaravel(state) {
    if (!state) return;
    try {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        if (DISCORD_WEBHOOK_SECRET) {
            headers['X-Webhook-Secret'] = DISCORD_WEBHOOK_SECRET;
        }

        const { statusCode, body } = await request(API_WEBHOOK_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                discord_user_id: state.userId,
                status: state.effectiveStatus,
                raw_status: state.rawStatus,
                is_in_voice: state.isInVoice,
                voice_channel: state.voiceChannelName,
                guild_name: state.guildName,
                source: 'discord',
                activities: state.activities,
            }),
        });

        const responseText = await body.text();
        if (statusCode === 200) {
            try {
                const data = JSON.parse(responseText);
                if (data.penalized) {
                    console.warn(`⚠️ [PENALTY TRIGGERED] User ${state.tag} (${state.userId}) caught active during bedtime! HP: ${data.current_hp}`);
                } else if (data.auto_confirmed) {
                    console.log(`✅ [SLEEP CONFIRMED] User ${state.tag} went offline/sleep during bedtime - Sleep confirmed!`);
                }
            } catch (e) {}
        }
    } catch (err) {
        console.error(`[Webhook Relay Error]:`, err.message);
    }
}

function printStatusBanner(state, eventTitle = 'Status Update') {
    if (!state) return;
    console.log(`\n======================================================`);
    console.log(`🔔 [${eventTitle}] User: ${state.tag} (ID: ${state.userId})`);
    console.log(`   1. สถานะที่ตั้งไว้: ${state.rawStatus.toUpperCase()}`);
    console.log(`   2. สถานะห้องคุย: ${state.isInVoice ? `อยู่ในห้อง "${state.voiceChannelName}" (${state.guildName})` : 'ไม่ได้อยู่ในห้องคุย'}`);
    console.log(`   👉 ผลการประเมิน: ${state.isConsideredOnline ? '🟢 ถือว่าออนไลน์ (ONLINE)' : '⚪ ถือว่าออฟไลน์ (OFFLINE)'}`);
    console.log(`   📝 เหตุผล: ${state.reason}`);
    console.log(`======================================================\n`);
}

function createClient() {
    const intents = [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ];

    const client = new Client({ intents });

    client.once('clientReady', async () => {
        console.log(`\n======================================================`);
        console.log(`🌙 [SleepOrDie Guard] Logged in as: ${client.user.tag} (ID: ${client.user.id})`);
        console.log(`📡 [Mode]: FULL (Presence + Voice Tracking Active)`);
        console.log(`👥 [Connected Guilds]: ${client.guilds.cache.size} server(s)`);
        client.guilds.cache.forEach((g) => console.log(`   - Server: ${g.name} (ID: ${g.id})`));
        console.log(`🎯 [Target User ID]: ${TARGET_USER_ID || 'ALL USERS'}`);
        console.log(`🔗 [Forwarding Webhook]: ${API_WEBHOOK_URL}`);
        console.log(`======================================================\n`);

        try {
            client.user.setPresence({
                activities: [{ name: 'SleepOrDie | Guarding Bedtime 🌙', type: ActivityType.Custom }],
                status: 'online',
            });
        } catch (e) {}

        // Initial scan of target members across all guilds
        for (const guild of client.guilds.cache.values()) {
            try {
                if (TARGET_USER_ID) {
                    try {
                        const member = await guild.members.fetch(TARGET_USER_ID);
                        if (member) {
                            const state = evaluateUserStatus(member);
                            printStatusBanner(state, 'Initial Scan on Bot Startup');
                            await forwardPresenceToLaravel(state);
                        }
                    } catch (e) {}
                } else {
                    const members = await guild.members.fetch();
                    for (const member of members.values()) {
                        if (member.user.bot) continue;
                        const state = evaluateUserStatus(member);
                        if (state) {
                            await forwardPresenceToLaravel(state);
                        }
                    }
                }
            } catch (err) {
                console.error(`[Initial Scan Error in ${guild.name}]:`, err.message);
            }
        }
    });

    // Event 1: Presence Update (สถานะที่ตั้งไว้: online / idle / dnd / offline)
    client.on('presenceUpdate', async (oldPresence, newPresence) => {
        if (!newPresence || !newPresence.userId) return;
        if (TARGET_USER_ID && newPresence.userId !== TARGET_USER_ID) return;

        let member = newPresence.member;
        if (!member && newPresence.guild) {
            try {
                member = await newPresence.guild.members.fetch(newPresence.userId);
            } catch (e) {}
        }
        if (!member) return;

        const state = evaluateUserStatus(member);
        printStatusBanner(state, 'Presence Change Event');
        await forwardPresenceToLaravel(state);
    });

    // Event 2: Voice State Update (หากยังอยู่ในห้องคุยยังถือว่าออนไลน์)
    client.on('voiceStateUpdate', async (oldState, newState) => {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot) return;
        if (TARGET_USER_ID && member.id !== TARGET_USER_ID) return;

        const state = evaluateUserStatus(member);
        printStatusBanner(state, 'Voice Channel Event');
        await forwardPresenceToLaravel(state);
    });

    client.on('error', (err) => {
        console.error('❌ [Discord Bot Error]:', err.message);
    });

    return client;
}

// Lightweight HTTP server for live status checks from Laravel or Dashboard
function startStatusServer(client) {
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        if (url.pathname === '/status') {
            const queryUserId = url.searchParams.get('user_id') || TARGET_USER_ID;
            let userState = null;

            if (queryUserId) {
                userState = userStateCache.get(queryUserId) || null;
                // If not in cache, try finding in guild members
                if (!userState && client?.guilds?.cache) {
                    for (const guild of client.guilds.cache.values()) {
                        const m = guild.members.cache.get(queryUserId);
                        if (m) {
                            userState = evaluateUserStatus(m);
                            break;
                        }
                    }
                }
            }

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            return res.end(
                JSON.stringify({
                    bot_online: client && client.isReady(),
                    bot_user: client?.user ? { id: client.user.id, tag: client.user.tag } : null,
                    connected_guilds: client?.guilds?.cache ? client.guilds.cache.size : 0,
                    target_user: userState,
                    all_cached_users: Array.from(userStateCache.values()),
                })
            );
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    });

    server.listen(STATUS_PORT, '127.0.0.1', () => {
        console.log(`🌐 [Bot Status API] Listening on http://127.0.0.1:${STATUS_PORT}/status`);
    });

    server.on('error', (err) => {
        if (err.code !== 'EADDRINUSE') {
            console.error('[Status API Error]:', err.message);
        }
    });
}

async function start() {
    console.log('⏳ Starting SleepOrDie Discord Bot with Presence & Voice tracking...');
    const client = createClient();

    try {
        await client.login(TOKEN);
        startStatusServer(client);
    } catch (err) {
        console.error('❌ Discord Login failed:', err.message);
        process.exit(1);
    }
}

start();
