import {
    AutocompleteInteraction,
    CommandInteraction,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';

import { BaseCommand, BaseEvent, Context } from '../base/index.js';
import { EventDataService } from '../services/index.js';
import { CommandUtils } from '../utils/index.js';


const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class InteractionHandler implements BaseEvent {
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.commands.amount,
        Config.rateLimiting.commands.interval * 1000
    );
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
            let passesChecks = await CommandUtils.runChecks(command, intr as any);
            if (passesChecks) {
                // Execute the command
                await command.execute(ctx);
            }
        } catch (error) {
            console.error(error);
        }
    }
}
