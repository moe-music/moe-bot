import {
    AutocompleteInteraction,
    CommandInteraction,
    EmbedBuilder,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';

import { BaseCommand, BaseEvent, Context } from '../base/index.js';
import { EventDataService, Logger } from '../services/index.js';
import { CommandUtils, InteractionUtils } from '../utils/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class InteractionHandler implements BaseEvent {
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.commands.amount,
        Config.rateLimiting.commands.interval * 1000
    );
    private logger = new Logger();
    constructor(
        public commands: BaseCommand[],
        private eventDataService: EventDataService
    ) {}
    public async process(intr: CommandInteraction | AutocompleteInteraction): Promise<void> {
        if (intr.user.id === intr.client.user?.id || intr.user.bot) {
            return;
        }
        let command = this.commands.find(command => command.name === intr.commandName);

        let limited = this.rateLimiter.take(intr.user.id);
        if (limited) {
            return;
        }
        const ctx = new Context({
            ctx: intr as any,
            args: intr.options ? intr.options.data.map(option => option.value) : [],
        });
        try {
            let passesChecks = await CommandUtils.runChecks(command, ctx);
            if (passesChecks) {
                // Execute the command
                await command.execute(ctx);
            }
        } catch (error) {
            await this.sendError(intr);
            this.logger.error(
                intr.channel instanceof TextChannel ||
                    intr.channel instanceof NewsChannel ||
                    intr.channel instanceof ThreadChannel
                    ? `Error in command ${command.name} in channel ${intr.channel.name} in guild ${intr.guild?.name} (${intr.guild?.id}): ${error}`
                    : `Error in command ${command.name} in DMs with ${intr.user.tag} (${intr.user.id}): ${error}`
            );
        }
    }
    private async sendError(intr: any): Promise<void> {
        const errorEmbed = new EmbedBuilder()
            .setTitle('Something went wrong!')
            .setDescription(
                `An error occurred while executing this command. Please try again later.\n\nError code: \`${
                    intr.id
                }\`\nServer ID: \`${intr.guild?.id}\`\nShard ID: \`${
                    intr.guild?.shardId ?? 0
                }\`\n\nIf this error persists, please contact support at [Here](${
                    Config.links.support
                })`
            )
            .setColor('#ff0000');
        await InteractionUtils.send(intr, errorEmbed, true);
    }
}
