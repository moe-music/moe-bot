import {
    ApplicationCommandOption,
    ApplicationCommandType,
    PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import {Context} from './context.js';
import { MoeClient } from '../extensions/moe-client.js';

export enum Catagory {
    General = 'general',
    Music = 'music',
    Config = 'config',
    Owner = 'owner',
    Moderation = 'moderation',
    Fun = 'fun',
    Utility = 'utility',
    Image = 'image',
    Anime = 'anime',
    NSFW = 'nsfw',
    Games = 'games',
    Economy = 'economy',
}

export class BaseCommand {
    public _options: CommandOptions;
    public client: MoeClient;
    public name: string | undefined;
    public description: {
        content: string | undefined;
        usage: string | undefined;
        examples: string[] | undefined;
    };
    public options?: ApplicationCommandOption[] | undefined;
    public type?: ApplicationCommandType | undefined;
    public category?: string | undefined;
    public cooldown?: RateLimiter;
    public aliases?: string[] | undefined;
    public args?: boolean | undefined;
    public slash?: boolean | undefined;
    public contextMenu?: {
        name: string | undefined;
        type: ApplicationCommandType | undefined;
    };
    public permissions?: {
        user: PermissionsString[];
        bot: PermissionsString[];
        dev: boolean | undefined;
        vote: boolean | undefined;
        dj: boolean | undefined;
        guildOnly: boolean | undefined;
    };
    public premium?: boolean | undefined;
    public voice?: {
        inVoice: boolean | undefined;
        activePlayer: boolean | undefined;
        playingPlayer: boolean | undefined;
    };
    constructor(client: MoeClient, options: CommandOptions) {
        this.client = client;
        this._options = this.modyfyOptions.bind(this)(options);
        this.name = options.name;
        this.description = {
            content: options.description.content,
            usage: options.description.usage,
            examples: options.description.examples,
        };
        this.options = options.options;
        this.type = options.type;
        this.category = options.category;
        this.cooldown = options.cooldown;
        this.aliases = options.aliases;
        this.slash = options.slash;
        this.args = options.args;
        this.permissions = {
            user: options.permissions?.user || [],
            bot: options.permissions?.bot || [],
            dev: options.permissions?.dev || false,
            vote: options.permissions?.vote || false,
            dj: options.permissions?.dj || false,
            guildOnly: options.permissions?.guildOnly || false,
        };
        this.premium = options.premium || false;
        this.voice = {
            inVoice: options.voice?.inVoice || false,
            activePlayer: options.voice?.activePlayer || false,
            playingPlayer: options.voice?.playingPlayer || false,
        };
        this.contextMenu = {
            name: options.contextMenu?.name || undefined,
            type: options.contextMenu?.type || ApplicationCommandType.User,
        };
    }
    public async execute(_client: MoeClient, _ctx: Context, _args: string[]): Promise<void> {
        return await Promise.resolve();
    }
    private modyfyOptions(options: CommandOptions): CommandOptions {
        if (!options) throw new Error('Options are required!');
        if (!options.name) throw new Error('Command name is required!');
        if (!options.description) throw new Error('Command description is required!');
        if (!options.type) options.type = ApplicationCommandType.ChatInput;
        if (!options.category) options.category = Catagory.General;
        if (!options.cooldown) options.cooldown = new RateLimiter(1, 2000);
        if (!options.permissions)
            options.permissions = {
                user: [],
                bot: ['SendMessages', 'EmbedLinks', 'ViewChannel'],
            };
        if (!options.voice)
            options.voice = {
                inVoice: false,
                activePlayer: false,
                playingPlayer: false,
            };
        if (!options.permissions.user) options.permissions.user = [];
        if (!options.permissions.bot) options.permissions.bot = [];

        if (options.permissions && Array.isArray(options.permissions.user)) {
            if (!options.permissions.bot.includes('SendMessages'))
                options.permissions.bot.push('SendMessages');
            if (!options.permissions.bot.includes('EmbedLinks'))
                options.permissions.bot.push('EmbedLinks');
            if (!options.permissions.bot.includes('ViewChannel'))
                options.permissions.bot.push('ViewChannel');
            if (!options.permissions.bot.includes('ReadMessageHistory'))
                options.permissions.bot.push('ReadMessageHistory');
            if (!options.permissions.bot.includes('UseExternalEmojis'))
                options.permissions.bot.push('UseExternalEmojis');
        }
        return options;
    }
}

interface CommandOptions {
    name: string;
    description: {
        content: string;
        usage?: string;
        examples?: string[];
    };
    options?: ApplicationCommandOption[];
    type?: ApplicationCommandType;
    category?: string;
    args?: boolean;
    cooldown?: RateLimiter;
    aliases?: string[];
    slash?: boolean;
    permissions?: {
        user?: PermissionsString[];
        bot?: PermissionsString[];
        dev?: boolean;
        vote?: boolean;
        dj?: boolean;
        guildOnly?: boolean;
    };
    premium?: boolean;
    voice?: {
        inVoice?: boolean;
        activePlayer?: boolean;
        playingPlayer?: boolean;
    };
    contextMenu?: {
        name?: string;
        type?: ApplicationCommandType;
    };
}
