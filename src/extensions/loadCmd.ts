import { PermissionsBitField, RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadCommands(): RESTPostAPIApplicationCommandsJSONBody[] {
    let cmd: RESTPostAPIApplicationCommandsJSONBody[] = [];
    const commandFiles = readdirSync(join(__dirname, '../commands'));
    commandFiles.forEach(async file => {
        const Catagory = readdirSync(join(__dirname, `../commands/${file}`)).filter(file =>
            file.endsWith('.js')
        );
        Catagory.forEach(async command => {
            const Command = (await import(`../commands/${file}/${command}`));
            const commandClass = new Command();
            if (commandClass.slash) {
                const data = {
                    name: commandClass.name,
                    description: commandClass.description.content,
                    options: commandClass.options,
                    default_member_permissions:
                        commandClass.permissions.user.length > 0
                            ? commandClass.permissions.user
                            : null,
                };

                if (commandClass.permissions.user.length > 0) {
                    const permissionValue = PermissionsBitField.resolve(
                        commandClass.permissions.user
                    );
                    if (typeof permissionValue === 'bigint') {
                        data.default_member_permissions = permissionValue.toString();
                    } else {
                        data.default_member_permissions = permissionValue;
                    }
                }
                const json = JSON.stringify(data);
                cmd.push(JSON.parse(json));
            }
            if (commandClass.contextMenu && commandClass.contextMenu.name) {
                const data = {
                    name: commandClass.contextMenu.name,
                    type: commandClass.contextMenu.type,
                };
                const json = JSON.stringify(data);
                cmd.push(JSON.parse(json));
            }
        });
    });
    return cmd;
}
