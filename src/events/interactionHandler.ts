import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Interaction
} from 'discord.js';

import { BaseEvent, MoeClient } from '../base/index.js';



export class InteractionHandler extends BaseEvent {
    constructor(client: MoeClient, file: string) {
        super(client, file, {
            name: 'interactionCreate',
            once: false,
        });
    }
    public run(interaction: Interaction): void {
        if (interaction instanceof ChatInputCommandInteraction) {
            if (interaction.isCommand()) {
                if (interaction.commandName === 'ping') {
                    interaction.reply('Pong!');
                }
            }
        } else if (interaction instanceof AutocompleteInteraction) {
           //

        }
    } 
}
