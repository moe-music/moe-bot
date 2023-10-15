import {
    AutocompleteInteraction,
    ButtonInteraction,
    CommandInteraction,
    Events,
    Guild,
    Interaction,
    Message,
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    RateLimitData,
    RESTEvents,
    User,
} from 'discord.js';
import { createRequire } from 'node:module';

import { InteractionHandler } from '../events/index.js';
import { MoeClient } from '../extensions/moe-client.js';
import { JobService, Logger } from '../services/index.js';
import { PartialUtils } from '../utils/index.js';



const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Debug = require('../../config/debug.json');

export class Bot {
    private ready = false;
    private logger = new Logger();
    constructor(
        private token: string,
        private client: MoeClient,
        private interactionHandler: InteractionHandler,
        private jobService: JobService
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        await this.login(this.token);
    }

    private registerListeners(): void {
        this.client.on(Events.ClientReady, () => this.onReady());
        this.client.on(Events.ShardReady, (shardId: number, unavailableGuilds: Set<string>) =>
            this.onShardReady(shardId, unavailableGuilds)
        );
        this.client.on(Events.GuildCreate, (guild: Guild) => this.onGuildJoin(guild));
        this.client.on(Events.GuildDelete, (guild: Guild) => this.onGuildLeave(guild));
        this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
        this.client.on(Events.InteractionCreate, (intr: Interaction) => this.onInteraction(intr));
        this.client.on(
            Events.MessageReactionAdd,
            (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
                this.onReaction(messageReaction, user)
        );
        this.client.rest.on(RESTEvents.RateLimited, (rateLimitData: RateLimitData) =>
            this.onRateLimit(rateLimitData)
        );
    }
    private async login(token: string): Promise<void> {
        try {
            await this.client.login(token);
        } catch (error) {
            this.logger.error(`Error logging in: ${error}`);
            return;
        }
    }

    private async onReady(): Promise<void> {
        let userTag = this.client.user?.tag;
        this.logger.info(`Logged in as ${userTag}`);

        if (!Debug.dummyMode.enabled) {
            this.jobService.start();
        }

        this.ready = true;
        this.logger.info('Connected to Discord');
    }

    private onShardReady(shardId: number, _unavailableGuilds: Set<string>): void {
        this.logger.info(`Shard ${shardId} is ready`);
    }

    private async onGuildJoin(_guild: Guild): Promise<void> {
        if (!this.ready || Debug.dummyMode.enabled) {
            return;
        }

        try {
            //await this.guildJoinHandler.process(guild);
        } catch (error) {
            this.logger.error(`Error processing guild join: ${error}`);
        }
    }

    private async onGuildLeave(_guild: Guild): Promise<void> {
        if (!this.ready || Debug.dummyMode.enabled) {
            return;
        }

        try {
            //await this.guildLeaveHandler.process(guild);
        } catch (error) {
            this.logger.error(`Error processing guild leave: ${error}`);
        }
    }

    private async onMessage(msg: Message): Promise<void> {
        if (
            !this.ready ||
            (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(msg.author.id))
        ) {
            return;
        }

        try {
            msg = await PartialUtils.fillMessage(msg);
            if (!msg) {
                return;
            }

            // await this.messageHandler.process(msg);
        } catch (error) {
            this.logger.error(`Error processing message: ${error}`);
        }
    }

    private async onInteraction(intr: Interaction): Promise<void> {
        if (
            !this.ready ||
            (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(intr.user.id))
        ) {
            return;
        }
        if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
            try {
                await this.interactionHandler.process(intr);
            } catch (error) {
                this.logger.error(`Error processing command: ${error}`);
            }
        } else if (intr instanceof ButtonInteraction) {
            try {
                // await this.buttonHandler.process(intr);
            } catch (error) {
                this.logger.error(`Error processing button: ${error}`);
            }
        }
    }

    private async onReaction(
        msgReaction: MessageReaction | PartialMessageReaction,
        reactor: User | PartialUser
    ): Promise<void> {
        if (
            !this.ready ||
            (Debug.dummyMode.enabled && !Debug.dummyMode.whitelist.includes(reactor.id))
        ) {
            return;
        }

        try {
            msgReaction = await PartialUtils.fillReaction(msgReaction);
            if (!msgReaction) {
                return;
            }

            reactor = await PartialUtils.fillUser(reactor);
            if (!reactor) {
                return;
            }

            /*             await this.reactionHandler.process(
                msgReaction,
                msgReaction.message as Message,
                reactor
            ); */
        } catch (error) {
            this.logger.error(`Error processing reaction: ${error}`);
        }
    }

    private async onRateLimit(rateLimitData: RateLimitData): Promise<void> {
        if (rateLimitData.timeToReset >= Config.logging.rateLimit.minTimeout * 1000) {
            this.logger.error(`API rate limit: ${JSON.stringify(rateLimitData)}`);
        }
    }
}
