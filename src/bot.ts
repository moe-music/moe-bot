import { REST } from '@discordjs/rest';
import { Options, Partials } from 'discord.js';
import { createRequire } from 'node:module';

import { BaseCommand } from './base/base-command.js';
import { PingCommand } from './commands/info/index.js';
import { InteractionHandler } from './events/interactionHandler.js';
import { loadCommands } from './extensions/loadCmd.js';
import { MoeClient } from './extensions/moe-client.js';
import { Job } from './jobs/index.js';
import { Bot } from './models/bot.js';
import { CommandRegistrationService, EventDataService, JobService, Logger as Log } from './services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../config/config.json');

const Logger = new Log();
async function start(): Promise<void> {
    // Services
    let eventDataService = new EventDataService();
    
    // Client
    let client = new MoeClient({
        intents: Config.client.intents,
        partials: (Config.client.partials as string[]).map(partial => Partials[partial]),
        makeCache: Options.cacheWithLimits({
            // Keep default caching behavior
            ...Options.DefaultMakeCacheSettings,
            // Override specific options from config
            ...Config.client.caches,
        }),
    });
    // Commands
    let commands: BaseCommand[] = [new PingCommand()].sort((a, b) => (a.name > b.name ? 1 : -1));
    let commandHandler = new InteractionHandler(commands, eventDataService);

    let jobs: Job[] = [
        // TODO: Add new jobs here
    ];
    // Bot
    let bot = new Bot(Config.client.token, client, commandHandler, new JobService(jobs));

    // Register
    if (process.argv[2] == 'commands') {
        try {
            let rest = new REST({ version: '10' }).setToken(Config.client.token);
            let commandRegistrationService = new CommandRegistrationService(rest);
            let localCmds = loadCommands();
            await commandRegistrationService.process(localCmds, process.argv);
        } catch (error) {
            Logger.error(`Error registering commands: ${error}`);
        }
        // Wait for any final logs to be written.
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.exit();
    }

    await bot.start();
}

process.on('unhandledRejection', (reason, _promise) => {
    Logger.error(`Unhandled rejection: ${JSON.stringify(reason)}`);
});

start().catch(error => {
    Logger.error(`Error starting bot: ${error}`);
});
