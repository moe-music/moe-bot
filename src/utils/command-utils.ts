import {
    CommandInteraction,
    GuildChannel,
    ThreadChannel,
} from 'discord.js';

import { FormatUtils, InteractionUtils } from './index.js';
import { BaseCommand } from '../base/index.js';
import { Permission } from '../models/enum-helpers/index.js';

export class CommandUtils {
    public static findCommand(commands: BaseCommand[], commandParts: string[]): BaseCommand {
        let found = [...commands];
        let closestMatch: BaseCommand;
        for (let [index, commandPart] of commandParts.entries()) {
            found =
                found.filter(command => command.name[index] === commandPart);
            if (found.length === 0) {
                return closestMatch;
            }

            if (found.length === 1) {
                return found[0];
            }

            let exactMatch =
                found.find(command => command.name.length === index + 1);
            if (exactMatch) {
                closestMatch = exactMatch;
            }
        }
        return closestMatch;
    }

    public static async runChecks(
        command: BaseCommand,
        intr: CommandInteraction
    ): Promise<boolean> {
        if (command.cooldown) {
            let limited = command.cooldown.take(intr.user.id);
            if (limited) {
                await InteractionUtils.send(
                    intr,
                    `Please wait ${FormatUtils.duration(
                        command.cooldown.interval
                    )} before using this command again.`
                );
                return false;
            }
        }

        if (
            (intr.channel instanceof GuildChannel || intr.channel instanceof ThreadChannel) &&
            !intr.channel.permissionsFor(intr.client.user).has(command.permissions.bot)
        ) {
            await InteractionUtils.send(
                intr,
                `I'm missing the following permissions: ${command.permissions.bot
                    .map(perm => `**${Permission.Data[perm].displayName()}**`)
                    .join(', ')}`
            );
            return false;
        }

        return true;
    }
}
