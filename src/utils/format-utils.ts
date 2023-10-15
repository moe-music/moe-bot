import { ApplicationCommand, Guild } from 'discord.js';
import { filesize } from 'filesize';
import { Duration } from 'luxon';

export class FormatUtils {
    public static roleMention(guild: Guild, discordId: string): string {
        if (discordId === '@here') {
            return discordId;
        }

        if (discordId === guild.id) {
            return '@everyone';
        }

        return `<@&${discordId}>`;
    }

    public static channelMention(discordId: string): string {
        return `<#${discordId}>`;
    }

    public static userMention(discordId: string): string {
        return `<@!${discordId}>`;
    }

    // TODO: Replace with ApplicationCommand#toString() once discord.js #8818 is merged
    // https://github.com/discordjs/discord.js/pull/8818
    public static commandMention(command: ApplicationCommand, subParts: string[] = []): string {
        let name = [command.name, ...subParts].join(' ');
        return `</${name}:${command.id}>`;
    }
    
    public static duration(milliseconds: number): string {
        return Duration.fromObject(
            Object.fromEntries(
                Object.entries(
                    Duration.fromMillis(milliseconds)
                        .shiftTo(
                            'year',
                            'quarter',
                            'month',
                            'week',
                            'day',
                            'hour',
                            'minute',
                            'second'
                        )
                        .toObject()
                ).filter(([_, value]) => !!value) // Remove units that are 0
            )
        ).toHuman({ maximumFractionDigits: 0 });
    }

    public static fileSize(bytes: number): string {
        return filesize(bytes, { output: 'string', pad: true, round: 2 });
    }

    public static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static formatTime(ms: number): string {
        let seconds = Math.floor(ms / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);

        let secondsStr = (seconds % 60).toString().padStart(2, '0');
        let minutesStr = (minutes % 60).toString().padStart(2, '0');
        let hoursStr = hours.toString().padStart(2, '0');

        return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }
}
