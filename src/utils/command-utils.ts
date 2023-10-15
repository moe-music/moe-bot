import { GuildChannel, ThreadChannel } from 'discord.js';

import { FormatUtils } from './index.js';
import { BaseCommand, Context } from '../base/index.js';
import { Permission } from '../models/enum-helpers/index.js';

export class CommandUtils {
    public static findCommand(commands: BaseCommand[], commandParts: string[]): BaseCommand {
        let found = [...commands];
        let closestMatch: BaseCommand;
        for (let [index, commandPart] of commandParts.entries()) {
            found = found.filter(command => command.name[index] === commandPart);
            if (found.length === 0) {
                return closestMatch;
            }

            if (found.length === 1) {
                return found[0];
            }

            let exactMatch = found.find(command => command.name.length === index + 1);
            if (exactMatch) {
                closestMatch = exactMatch;
            }
        }
        return closestMatch;
    }

    public static async runChecks(command: BaseCommand, ctx: Context): Promise<boolean> {
        if (command.cooldown) {
            let limited = command.cooldown.take(ctx.user.id);
            if (limited) {
                await ctx.sendMessage(
                    `Please wait ${FormatUtils.duration(
                        command.cooldown.interval
                    )} before using this command again.`
                );
                return false;
            }
        }

        if (
            (ctx.channel instanceof GuildChannel || ctx.channel instanceof ThreadChannel) &&
            !ctx.channel.permissionsFor(ctx.client.user).has(command.permissions.bot)
        ) {
            await ctx.sendMessage(
                `I'm missing the following permissions: ${command.permissions.bot
                    .map(perm => `**${Permission.Data[perm].displayName()}**`)
                    .join(', ')}`
            );
            return false;
        }
        if (ctx.isInteraction && command.slash) {
            return true;
        }
        return true;
    }
}
