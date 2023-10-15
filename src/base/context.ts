/* eslint-disable @typescript-eslint/return-await */
import {
    APIInteractionGuildMember,
    BaseMessageOptions,
    ChatInputCommandInteraction,
    DMChannel,
    Guild,
    GuildMember,
    GuildTextBasedChannel,
    InteractionDeferReplyOptions,
    InteractionReplyOptions,
    InteractionType,
    Message,
    MessageEditOptions,
    MessagePayload,
    MessageType,
    PartialDMChannel,
    TextChannel,
    User,
    WebhookMessageEditOptions,
} from 'discord.js';

import { MoeClient } from '../extensions/moe-client.js';
import { InteractionUtils, MessageUtils } from '../utils/index.js';

export class Context {
    private _options: ContextOptions;
    public ctx: ChatInputCommandInteraction | Message | null;
    public interaction: ChatInputCommandInteraction | null = null;
    public message: Message | null = null;
    public repliedMessage: any = null;
    public channel: PartialDMChannel | GuildTextBasedChannel | TextChannel | DMChannel | null =
        null;
    public channelId: string;
    public member: GuildMember | APIInteractionGuildMember | null = null;
    public client: MoeClient;
    public applicationId: string | null;
    public type: MessageType | InteractionType.ApplicationCommand;
    public guild: Guild | null = null;
    public guildId: string | null;
    public user: User | null;
    public id: string | null;
    public createdAt: Date | null;
    public createdTimestamp: number;
    public content: string | null;
    public contextMenuContent: string | null;
    constructor(options: ContextOptions) {
        this._options = options;
        this.ctx = this._options.ctx;
        this.content = this._options.content;
        this.interaction = this.ctx instanceof ChatInputCommandInteraction ? this.ctx : null;
        this.message = this.ctx instanceof Message ? this.ctx : null;
        this.channel = this.ctx.channel;
        this.channelId = this.ctx.channelId;
        this.guild = this.ctx.guild;
        this.member = this.ctx.member;
        this.client = this.ctx.client as MoeClient;
        this.applicationId = this.ctx.applicationId;
        this.type = this.ctx.type;
        this.user = this.ctx instanceof Message ? this.ctx.author : this.ctx.user;
        this.guildId = this.ctx.guildId;
        this.id = this.ctx.id;
        this.createdTimestamp = this.ctx.createdTimestamp;
        this.createdAt = this.ctx.createdAt;
        this.contextMenuContent = this.contextMenuContent || null;
    }

    public get isInteraction(): boolean {
        return this.ctx instanceof ChatInputCommandInteraction;
    }

    public get isMessage(): boolean {
        return this.ctx instanceof Message;
    }

    public get inputType(): 'message' | 'interaction' {
        if (this.ctx instanceof Message) return 'message';

        return 'interaction';
    }

    public get args(): any[] {
        if (this.isInteraction) {
            return this._options.args.map(x => x.value) as (
                | string
                | boolean
                | number
                | undefined
            )[];
        } else {
            return this._options.args;
        }
    }

    public get replied(): boolean {
        if (this.isInteraction) {
            return this.interaction?.replied;
        }

        if (this.repliedMessage) return true;

        return false;
    }

    public get deferred(): boolean {
        if (this.isInteraction) {
            return this.interaction.deferred;
        }

        if (this.repliedMessage) return true;

        return false;
    }
    public async sendMessage(
        content: string | BaseMessageOptions | InteractionReplyOptions | MessagePayload
    ): Promise<Message | void> {
        try {
            if (this.isInteraction) {
                this.repliedMessage = await InteractionUtils.send(
                    this.interaction,
                    content as any,
                    false
                );
                return this.repliedMessage;
            } else if (this.message) {
                this.repliedMessage = await MessageUtils.reply(this.message, content as any);
                return this.repliedMessage;
            } else {
                throw new Error('The message property is not defined.');
            }
        } catch (error) {
            console.log(error);
        }
    }
    public async editMessage(
        content: string | BaseMessageOptions | WebhookMessageEditOptions | MessageEditOptions
    ): Promise<Message | void> {
        if (this.isInteraction) {
            return await InteractionUtils.editReply(
                this.interaction,
                content as string | WebhookMessageEditOptions | MessageEditOptions
            );
        } else {
            if (this.repliedMessage && this.repliedMessage.editable)
                return await MessageUtils.edit(this.repliedMessage, content);
        }
    }
    public async sendDeferMessage(
        content: string | BaseMessageOptions | InteractionDeferReplyOptions | MessagePayload
    ): Promise<Message | void> {
        if (this.isInteraction) {
            this.repliedMessage = InteractionUtils.deferReply(this.interaction, false);
            return this.repliedMessage;
        } else {
            this.repliedMessage = await MessageUtils.reply(this.message, content as any);
            return this.repliedMessage;
        }
    }
    public async editReply(
        content: string | BaseMessageOptions | WebhookMessageEditOptions | MessageEditOptions
    ): Promise<Message | void> {
        if (this.isInteraction) {
            return await InteractionUtils.editReply(
                this.interaction,
                content as string | WebhookMessageEditOptions | MessageEditOptions
            );
        } else {
            if (this.repliedMessage && this.repliedMessage.editable)
                return await MessageUtils.edit(this.repliedMessage, content);
        }
    }

    public async deferReply(options?: InteractionDeferReplyOptions | undefined): Promise<any> {
        return await InteractionUtils.deferReply(this.interaction, options as any);
    }

    public deleteReply(): Promise<void> {
        if (this.isInteraction) {
            return InteractionUtils.deleteReply(this.interaction);
        } else {
            if (this.repliedMessage && this.repliedMessage.deletable)
                MessageUtils.delete(this.repliedMessage);
            return;
        }
    }
    /* public async paginate(ctx: Context, content: string | BaseMessageOptions | MessagePayload) {
        return await paginate(ctx, content, 60000);
    }
    public async options(ctx: Context, cmd: any) {
        let prefix: string;
        let serverPrefix = await Servers.getPrefixes(ctx);
        const current_prefix = serverPrefix.find((x: any) =>
            ctx.content.startsWith(x.prefix)
        ) as any;
        const command =
            this.client.commands.get(cmd) ||
            this.client.commands.find(x => x.aliases && x.aliases.includes(cmd));
        if (this.isInteraction) {
            prefix = '/';
        } else {
            prefix = current_prefix ? current_prefix.prefix : this.client.config.prefix;
        }
        return await optionsMessage({
            command: command,
            prefix: prefix,
            ctx: ctx,
            client: this.client,
        });
    } */
}
export interface ContextOptions {
    ctx: ChatInputCommandInteraction | Message;
    args: any[];
    content?: string;
}
