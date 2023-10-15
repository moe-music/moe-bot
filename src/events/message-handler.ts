import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    DMChannel,
    EmbedBuilder,
    Message,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';

import { BaseCommand, BaseEvent, Context } from '../base/index.js';
import { T } from '../models/I18n.js';
import prisma from '../prisma.js';
import { Servers, Users } from '../services/database/index.js';
import { EventDataService, Logger } from '../services/index.js';
import { CommandUtils, MessageUtils } from '../utils/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class MessageHandler implements BaseEvent {
    private logger = new Logger();
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.commands.amount,
        Config.rateLimiting.commands.interval * 1000
    );
    constructor(
        public commands: BaseCommand[],
        private eventDataService: EventDataService
    ) {}
    public async process(message: Message): Promise<void> {
        if (message.author.bot || message.system) return;
        if (message.partial) return;

        let channel = message.channel;

        if (!(channel instanceof TextChannel || channel instanceof DMChannel)) return;

        await Promise.all([
            Servers.createServer(message.guildId),
            Users.createUser(message.author.id),
        ]);

        const locale = await Servers.getLocale(message.guildId);
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        const server = await prisma.guild.findUnique({
            where: { guildId: message.guildId },
        });
        const mention = new RegExp(`^<@!?${message.client.user.id}>( |)$`);
        let prefix: string;
        if ((user && user.noPrefix) || (server && server.noPrefix)) {
            prefix = '';
            if (message.content.match(mention)) {
                prefix = '';
                const embed = new EmbedBuilder()
                    .setColor(Config.colors.dc)
                    .setAuthor({
                        name: T(locale, 'get_started.embed_title'),
                        iconURL: message.client.user.displayAvatarURL(),
                        url: Config.links.website,
                    })
                    .setDescription(
                        T(locale, 'get_started.embed_description2', {
                            user: message.author.id,
                        })
                    );

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setURL(Config.links.patreon)
                        .setLabel(T(locale, 'events.int.buttons.donate'))
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setURL(Config.links.invite)
                        .setLabel(T(locale, 'events.int.buttons.invite'))
                        .setStyle(ButtonStyle.Link)
                );

                await message.channel.send({
                    embeds: [embed],
                    components: [row],
                });
            }
        }

        const prefixes = await Servers.getPrefixes(message);
        if (prefixes && prefixes.length) {
            const prefixList = prefixes.map((x: any) => x.prefix);
            if (message.content.match(mention)) {
                const embed = new EmbedBuilder()
                    .setColor(Config.colors.dc)
                    .setAuthor({
                        name: T(locale, 'get_started.embed_title'),
                        iconURL: message.client.user.displayAvatarURL(),
                        url: Config.links.website,
                    })
                    .setDescription(
                        T(locale, 'get_started.embed_description', {
                            prefix: prefixList[0],
                            prefixList: prefixList.join('`, `'),
                            user: message.author.id,
                        })
                    );
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setURL(Config.links.patreon)
                        .setLabel(T(locale, 'events.int.buttons.donate'))
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setURL(Config.links.invite)
                        .setLabel(T(locale, 'events.int.buttons.invite'))
                        .setStyle(ButtonStyle.Link)
                );
                await message.channel.send({
                    embeds: [embed],
                    components: [row],
                });
            }
            const current_prefix = prefixes.find((p: any) => message.content.startsWith(p.prefix));
            if (current_prefix) prefix = current_prefix.prefix;
            if (typeof prefix === 'undefined') prefix = Config.prefix;
        }
        const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefixRegex = new RegExp(
            `^(<@!?${message.client.user.id}>|${escapeRegex(prefix)})\\s*`
        );
        if (!prefixRegex.test(message.content)) return;
        const [matchedPrefix] = message.content.match(prefixRegex);
        prefix = matchedPrefix;

        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;
        let command = this.commands.find(
            command => command.name === commandName || command.aliases.includes(commandName)
        );
        if (!command) return;
        let limited = this.rateLimiter.take(message.author.id);
        if (limited) {
            return;
        }
        let data = await this.eventDataService.create({
            user: message.author,
            channel: message.channel,
            guild: message.guild,
            args: args as any,
            prefix,
            lang: locale,
        });
        const ctx = new Context({
            ctx: message,
            args: args,
        });
        try {
            let passesChecks = await CommandUtils.runChecks(command, ctx);
            if (passesChecks) {
                // Execute the command
                await command.execute(ctx, data);
            }
        } catch (error) {
            await this.sendError(message);
            this.logger.error(
                message.channel instanceof TextChannel ||
                    message.channel instanceof NewsChannel ||
                    message.channel instanceof ThreadChannel
                    ? `Error in command ${command.name} in channel ${message.channel.name} in guild ${message.guild?.name} (${message.guild?.id}): ${error}`
                    : `Error in command ${command.name} in DMs with ${message.author.tag} (${message.author.id}): ${error}`
            );
        }
    }
    private async sendError(message: Message): Promise<void> {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Something went wrong!')
            .setDescription(
                `An error occurred while executing this command. Please try again later.\n\nError code: \`${
                    message.id
                }\`\nServer ID: \`${message.guild?.id}\`\nShard ID: \`${
                    message.guild?.shardId ?? 0
                }\`\n\nIf this error persists, please contact support at [Here](${
                    Config.links.support
                })`
            )
            .setColor('#ff0000');
        if (message.channel instanceof DMChannel) {
            await MessageUtils.send(message.author, errorEmbed);
        } else {
            await MessageUtils.send(message.channel, errorEmbed);
        }
    }
}
