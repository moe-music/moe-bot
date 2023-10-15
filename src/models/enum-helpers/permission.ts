import { PermissionsString } from 'discord.js';

interface PermissionData {
    displayName(): string;
}

export class Permission {
    public static Data: {
        [key in PermissionsString]: PermissionData;
    } = {
        AddReactions: {
            displayName(): string {
                return `Add Reactions`;
            },
        },
        Administrator: {
            displayName(): string {
                return `Administrator`;
            },
        },
        AttachFiles: {
            displayName(): string {
                return `Attach Files`;
            },
        },
        BanMembers: {
            displayName(): string {
                return `Ban Members`;
            },
        },
        ChangeNickname: {
            displayName(): string {
                return `Change Nickname`;
            },
        },
        Connect: {
            displayName(): string {
                return `Connect`;
            },
        },
        CreateInstantInvite: {
            displayName(): string {
                return `Create Instant Invite`;
            },
        },
        CreatePrivateThreads: {
            displayName(): string {
                return `Create Private Threads`;
            },
        },
        CreatePublicThreads: {
            displayName(): string {
                return `Create Public Threads`;
            },
        },
        DeafenMembers: {
            displayName(): string {
                return `Deafen Members`;
            },
        },
        EmbedLinks: {
            displayName(): string {
                return `Embed Links`;
            },
        },
        KickMembers: {
            displayName(): string {
                return `Kick Members`;
            },
        },
        ManageChannels: {
            displayName(): string {
                return `Manage Channels`;
            },
        },
        ManageEmojisAndStickers: {
            displayName(): string {
                return `Manage Emojis and Stickers`;
            },
        },
        ManageEvents: {
            displayName(): string {
                return `Manage Events`;
            },
        },
        ManageGuild: {
            displayName(): string {
                return `Manage Guild`;
            },
        },
        ManageGuildExpressions: {
            displayName(): string {
                return `Manage Guild Expressions`;
            },
        },
        ManageMessages: {
            displayName(): string {
                return `Manage Messages`;
            },
        },
        ManageNicknames: {
            displayName(): string {
                return `Manage Nicknames`;
            },
        },
        ManageRoles: {
            displayName(): string {
                return `Manage Roles`;
            },
        },
        ManageThreads: {
            displayName(): string {
                return `Manage Threads`;
            },
        },
        ManageWebhooks: {
            displayName(): string {
                return `Manage Webhooks`;
            },
        },
        MentionEveryone: {
            displayName(): string {
                return `Mention Everyone`;
            },
        },
        ModerateMembers: {
            displayName(): string {
                return `Moderate Members`;
            },
        },
        MoveMembers: {
            displayName(): string {
                return `Move Members`;
            },
        },
        MuteMembers: {
            displayName(): string {
                return `Mute Members`;
            },
        },
        PrioritySpeaker: {
            displayName(): string {
                return `Priority Speaker`;
            },
        },
        ReadMessageHistory: {
            displayName(): string {
                return `Read Message History`;
            },
        },
        RequestToSpeak: {
            displayName(): string {
                return `Request to Speak`;
            },
        },
        SendMessages: {
            displayName(): string {
                return `Send Messages`;
            },
        },
        SendMessagesInThreads: {
            displayName(): string {
                return `Send Messages in Threads`;
            },
        },
        SendTTSMessages: {
            displayName(): string {
                return `Send TTS Messages`;
            },
        },
        SendVoiceMessages: {
            displayName(): string {
                return `Send Voice Messages`;
            },
        },
        Speak: {
            displayName(): string {
                return `Speak`;
            },
        },
        Stream: {
            displayName(): string {
                return `Stream`;
            },
        },
        UseApplicationCommands: {
            displayName(): string {
                return `Use Application Commands`;
            },
        },
        UseEmbeddedActivities: {
            displayName(): string {
                return `Use Embedded Activities`;
            },
        },
        UseExternalEmojis: {
            displayName(): string {
                return `Use External Emojis`;
            },
        },
        UseExternalSounds: {
            displayName(): string {
                return `Use External Sounds`;
            },
        },
        UseExternalStickers: {
            displayName(): string {
                return `Use External Stickers`;
            },
        },
        UseSoundboard: {
            displayName(): string {
                return `Use Soundboard`;
            },
        },
        UseVAD: {
            displayName(): string {
                return `Use VAD`;
            },
        },
        ViewAuditLog: {
            displayName(): string {
                return `View Audit Log`;
            },
        },
        ViewChannel: {
            displayName(): string {
                return `View Channel`;
            },
        },
        ViewCreatorMonetizationAnalytics: {
            displayName(): string {
                return `View Creator Monetization Analytics`;
            },
        },
        ViewGuildInsights: {
            displayName(): string {
                return `View Guild Insights`;
            },
        },
    };
}
