import {
    Channel,
    CommandInteractionOptionResolver,
    Guild,
    PartialDMChannel,
    User,
} from 'discord.js';

import { EventData } from '../models/internal-models.js';

export class EventDataService {
    public async create(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        options: {
            user?: User;
            channel?: Channel | PartialDMChannel;
            guild?: Guild;
            args?: Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
            prefix: string;
            lang: string;
        } = {
            prefix: '',
            lang: 'EnglishUS',
        }
    ): Promise<EventData> {
        return new EventData(options.args, options.prefix, options.lang);
    }
}
