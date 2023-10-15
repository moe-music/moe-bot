/* eslint-disable import/no-extraneous-dependencies */
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { ApplicationCommandType, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Context } from './index.js';

export interface BaseCommand {
    name: string;
    description: {
        content: string;
        usage?: string;
        examples?: string[];
    };
    aliases?: string[];
    options?: RESTPostAPIChatInputApplicationCommandsJSONBody['options'];
    type?: RESTPostAPIChatInputApplicationCommandsJSONBody['type'];
    category?: string;
    args?: boolean;
    cooldown?: RateLimiter;
    permissions: {
        user: PermissionsString[];
        bot: PermissionsString[];
        dev: boolean;
        vote: boolean;
    };
    premium: boolean;
    voice?: {
        inVoice: boolean;
        activePlayer: boolean;
        playingPlayer: boolean;
    };
    dj?: {
        require: boolean;
        prem: PermissionsString[];
    }
    slash?: boolean;
    contextMenu?: {
        name?: string;
        type?: ApplicationCommandType;
    };
    execute(ctx: Context): Promise<void>;
}

export enum CommandDeferType {
    PUBLIC = 'PUBLIC',
    HIDDEN = 'HIDDEN',
    NONE = 'NONE',
}