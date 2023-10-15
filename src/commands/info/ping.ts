import { RateLimiter } from 'discord.js-rate-limiter';

import { BaseCommand, Context } from '../../base/index.js';

export class PingCommand implements BaseCommand {
    public name = 'ping';
    public description = {
        content: 'Get the bot\'s ping',
        usage: '',
        examples: [''],
    };
    public category = 'info';
    public cooldown = new RateLimiter(1, 5000);
    public aliases = ['pong'];
    public permissions = {
        user: [],
        bot: [],
        dev: false,
        vote: false,
        dj: false,
        guildOnly: false,
    };
    public voice = {
        inVoice: false,
        activePlayer: false,
        playingPlayer: false,
    };
    public premium = false;
    public slash = false;
    public args = false;
    public defer = false;
    public deferType = 'NONE' as const;
    public options = [];
    public async execute(ctx: Context): Promise<any> {
        const start = Date.now();
        await ctx.sendMessage(':ping_pong: Pinging...');
        const end = Date.now();
        ctx.editMessage(`API Latency: **${Math.round(ctx.client.ws.ping)}ms**\nBot Latency: **${end - start}ms**`);
    }
}
