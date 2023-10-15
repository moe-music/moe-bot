import { REST } from '@discordjs/rest';
import { Options, Partials, PermissionsBitField, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { createRequire } from 'node:module';

import { BaseCommand } from './base/base-command.js';
import { PingCommand } from './commands/info/index.js';
import { InteractionHandler, MessageHandler } from './events/index.js';
import { MoeClient } from './extensions/moe-client.js';
import { Job } from './jobs/index.js';
import { Bot } from './models/bot.js';
import {
    CommandRegistrationService,
    EventDataService,
    JobService,
    Logger as Log,
} from './services/index.js';


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
        allowedMentions: {
            repliedUser: false,
            parse: ['roles', 'users', 'everyone'],
        },
    });
    // Commands
    let commands: BaseCommand[] = [new PingCommand()].sort((a, b) => (a.name > b.name ? 1 : -1));
    let intHandler = new InteractionHandler(commands, eventDataService);
    let messageHandler = new MessageHandler(commands, eventDataService);


    let jobs: Job[] = [
        // TODO: Add new jobs here
    ];
    // Bot
    let bot = new Bot(Config.client.token, client,messageHandler, intHandler, new JobService(jobs));

    // Register
    if (process.argv[2] == 'commands') {
        try {
            let rest = new REST({ version: '10' }).setToken(Config.client.token);
            let commandRegistrationService = new CommandRegistrationService(rest);
            let cmd: RESTPostAPIApplicationCommandsJSONBody[] = [];
            commands.forEach((command: any) => {
                if (command.slash) {
                    const data = {
                        name: command.name,
                        description: command.description.content,
                        options: command.options,
                        default_member_permissions:
                            command.permissions.user.length > 0 ? command.permissions.user : null,
                        default_permission: 
                            command.permissions.bot.length > 0 ? command.permissions.bot : null,
                    };
                    data
                    if (command.permissions.user.length > 0) {
                        const permissionValue = PermissionsBitField.resolve(
                            command.permissions.user
                        );
                        if (typeof permissionValue === 'bigint') {
                            data.default_member_permissions = permissionValue.toString();
                        } else {
                            data.default_member_permissions = permissionValue;
                        }
                    }
                    if (command.permissions.bot.length > 0) {
                        const permissionValue = PermissionsBitField.resolve(
                            command.permissions.bot
                        );
                        if (typeof permissionValue === 'bigint') {
                            data.default_permission = permissionValue.toString();
                        } else {
                            data.default_permission = permissionValue;
                        }
                    }
                    const json = JSON.stringify(data);
                    cmd.push(JSON.parse(json));
                }
            });
            await commandRegistrationService.process(cmd, process.argv);
        } catch (error) {
            Logger.error(`Error registering commands: ${error}`);
        }
        // Wait for any final logs to be written.
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.exit();
    }

    await bot.start();
}

process.on('unhandledRejection', (reason: any, _promise) => {
    Logger.error(`Unhandled rejection: ${reason}}`);
});

start().catch(error => {
    Logger.error(`Error starting bot: ${error}`);
});
