import { REST } from '@discordjs/rest';
import {
    APIApplicationCommand,
    RESTGetAPIApplicationCommandsResult,
    RESTPatchAPIApplicationCommandJSONBody,
    RESTPostAPIApplicationCommandsJSONBody,
    Routes,
} from 'discord.js';
import { createRequire } from 'node:module';

import { Logger } from './logger.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class CommandRegistrationService {
    private logger = new Logger();
    constructor(private rest: REST) {}

    public async process(
        localCmds: RESTPostAPIApplicationCommandsJSONBody[],
        args: string[]
    ): Promise<void> {
        let remoteCmds = (await this.rest.get(
            Routes.applicationCommands(Config.client.id)
        )) as RESTGetAPIApplicationCommandsResult;

        let localCmdsOnRemote = localCmds.filter(localCmd =>
            remoteCmds.some(remoteCmd => remoteCmd.name === localCmd.name)
        );
        let localCmdsOnly = localCmds.filter(
            localCmd => !remoteCmds.some(remoteCmd => remoteCmd.name === localCmd.name)
        );
        let remoteCmdsOnly = remoteCmds.filter(
            remoteCmd => !localCmds.some(localCmd => localCmd.name === remoteCmd.name)
        );

        switch (args[3]) {
            case 'view': {
                this.logger.info(
                    `Local and remote commands: ${this.formatCommandList(
                        localCmdsOnRemote
                    )}\nLocal only commands: ${this.formatCommandList(
                        localCmdsOnly
                    )}\nRemote only commands: ${this.formatCommandList(remoteCmdsOnly)}`
                );
                return;
            }
            case 'register': {
                if (localCmdsOnly.length > 0) {
                    this.logger.info(`Creating commands: ${this.formatCommandList(localCmdsOnly)}`);
                    for (let localCmd of localCmdsOnly) {
                        await this.rest.post(Routes.applicationCommands(Config.client.id), {
                            body: localCmd,
                        });
                    }
                    this.logger.info(`Created commands: ${this.formatCommandList(localCmdsOnly)}`);
                }

                if (localCmdsOnRemote.length > 0) {
                    this.logger.info(
                        `Updating commands: ${this.formatCommandList(localCmdsOnRemote)}`
                    );

                    for (let localCmd of localCmdsOnRemote) {
                        await this.rest.post(Routes.applicationCommands(Config.client.id), {
                            body: localCmd,
                        });
                    }
                    this.logger.info(
                        `Updated commands: ${this.formatCommandList(localCmdsOnRemote)}`
                    );
                }

                return;
            }
            case 'rename': {
                let oldName = args[4];
                let newName = args[5];
                if (!(oldName && newName)) {
                    this.logger.error(
                        `Missing arguments. Usage: ${args[2]} ${args[3]} <old name> <new name>`
                    );
                    return;
                }

                let remoteCmd = remoteCmds.find(remoteCmd => remoteCmd.name == oldName);
                if (!remoteCmd) {
                    this.logger.error(`Command not found: ${oldName}`);
                    return;
                }

                this.logger.info(`Renaming command: ${remoteCmd.name} -> ${newName}`);
                let body: RESTPatchAPIApplicationCommandJSONBody = {
                    name: newName,
                };
                await this.rest.patch(Routes.applicationCommand(Config.client.id, remoteCmd.id), {
                    body,
                });
                this.logger.info(`Renamed command: ${remoteCmd.name} -> ${newName}`);
                return;
            }
            case 'delete': {
                let name = args[4];
                if (!name) {
                    this.logger.error(`Missing argument. Usage: ${args[2]} ${args[3]} <name>`);
                    return;
                }

                let remoteCmd = remoteCmds.find(remoteCmd => remoteCmd.name == name);
                if (!remoteCmd) {
                    this.logger.error(`Command not found: ${name}`);
                    return;
                }
                this.logger.info(`Deleting command: ${remoteCmd.name}`);
                await this.rest.delete(Routes.applicationCommand(Config.client.id, remoteCmd.id));
                this.logger.info(`Deleted command: ${remoteCmd.name}`);
                return;
            }
            case 'clear': {
                this.logger.info(`Clearing commands: ${this.formatCommandList(remoteCmds)}`);
                await this.rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
                this.logger.info(`Cleared commands: ${this.formatCommandList(remoteCmds)}`);
                return;
            }
        }
    }

    private formatCommandList(
        cmds: RESTPostAPIApplicationCommandsJSONBody[] | APIApplicationCommand[]
    ): string {
        return cmds.length > 0
            ? cmds.map((cmd: { name: string }) => `'${cmd.name}'`).join(', ')
            : 'N/A';
    }
}
