/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
import type { Guild, LogChannel, Logger, logType, Prefix, Setup, voteSkip, Welcome } from '@prisma/client';
import { Languages } from '@prisma/client';
import { createRequire } from 'node:module';

import prisma from '../../prisma.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');

export class Servers {
    public static async createServer(guildId: any): Promise<Guild> {
        if (!guildId) return;
        const guild = await prisma.guild.findUnique({
            where: { guildId: guildId },
        });

        if (!guild) {
            return await prisma.guild.create({
                data: {
                    guildId: guildId,
                    noPrefix: false,
                },
            });
        } else {
            return guild;
        }
    }
    public static async getSetup(guildID: any): Promise<Setup> {
        if (!guildID) {
            return null;
        }
        const data = await prisma.guild.findUnique({
            where: { guildId: guildID },
            select: { setup: true },
        });
        return data?.setup;
    }

    public static async updateSetup(guildID: any, data: any): Promise<any> {
        const guild = await prisma.setup.findUnique({
            where: { guildId: guildID },
        });
        const newData: Record<string, any> = {};
        if (data.messageId) newData.messageId = data.messageId;
        if (data.channelId) newData.channelId = data.channelId;
        if (data.moderator) newData.moderator = data.moderator;
        if (data.addTimestamp) newData.addTimestamp = data.addTimestamp;
        if (!guild) {
            await prisma.setup.create({
                data: {
                    guildId: guildID,
                    ...(newData as any),
                },
            });
        } else {
            await prisma.setup.update({
                where: { guildId: guildID },
                data: {
                    ...newData,
                },
            });
        }
    }

    public static async removeSetup(guildID: any): Promise<boolean> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: guildID },
        });

        if (!guild) {
            return false;
        }

        const setup = await prisma.setup.findUnique({
            where: { guildId: guildID },
        });

        if (!setup) {
            return false;
        }

        await prisma.setup.delete({
            where: { guildId: guildID },
        });

        return true;
    }

    public static async getPrefixes(message: any): Promise<any> {
        const defaultPrefix: Prefix = {
            id: 1,
            moderator: Config.client.id,
            addTimestamp: Date.now() as any,
            prefix: Config.prefix,
            guildId: message.guild.id,
        };
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guild.id },
            include: { prefixs: true },
        });
        const prefixs = guild?.prefixs.map(prefix => prefix);
        return prefixs && prefixs.length > 0 ? prefixs : [defaultPrefix];
    }
    
    public static async getLocale(guildID: any): Promise<any> {
        const data = await prisma.guild.findUnique({
            where: { guildId: guildID },
            select: { language: true },
        });
        if (!data) {
            return Languages.EnglishUS;
        } else {
            return data.language;
        }
    }
    /*  public static async setPrefix(message: Message<any>, prefix: string): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID }
        });

        if (!guild) {
            await prisma.guild.create({
                data: {
                    guildId: message.guildID,
                    prefixs: {
                        create: {
                            moderator: message.member.id,
                            addTimestamp: Date.now() as any,
                            prefix: prefix
                        }
                    }
                }
            });
        } else {
            await prisma.prefix.create({
                data: {
                    moderator: message.member.id,
                    addTimestamp: Date.now() as any,
                    prefix: prefix,
                    guild: {
                        connect: {
                            guildId: message.guildID
                        }
                    }
                }
            });
        }
        return;
    }

    public static async removePrefix(message: Message<any>, prefix?: string): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID },
            include: { prefixs: true }
        });

        if (!guild) {
            throw new Error('Guild not found');
        }

        if (!prefix) {
            await prisma.prefix.deleteMany({
                where: {
                    guildId: message.guildID
                }
            });
        } else {
            await prisma.prefix.delete({
                where: {
                    guildId_prefix: {
                        guildId: message.guildID,
                        prefix: prefix
                    }
                }
            });
        }
        return;
    }

    public static async getBotChannel(message: Message<any>): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID },
            include: { botChannels: true }
        });
        const array = [];
        if (!guild) {
            return null;
        } else {
            if (guild.botChannels.length > 0) {
                for await (const channel of guild.botChannels) {
                    array.push(channel);
                }
            }
        }
        return array.length > 0 ? array : null;
    }

    public static async setBotChannel(message: Message<any>, channel: string): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID }
        });
        if (!guild) {
            await prisma.guild.create({
                data: {
                    guildId: message.guildID,
                    botChannels: {
                        create: {
                            channelId: channel,
                            moderator: message.member.id,
                            addTimestamp: Date.now() as any
                        }
                    }
                }
            });
        } else {
            await prisma.botChannel.create({
                data: {
                    channelId: channel,
                    moderator: message.member.id,
                    addTimestamp: Date.now() as any,
                    guild: {
                        connect: {
                            guildId: message.guildID
                        }
                    }
                }
            });
        }
        return;
    }

    public static async removeBotChannel(message: Message<any>, channel?: string): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID },
            include: { botChannels: true }
        });

        if (!guild) {
            return null;
        }
        if (!channel) {
            await prisma.botChannel.deleteMany({
                where: {
                    guildId: message.guildID
                }
            });
        } else {
            await prisma.botChannel.delete({
                where: {
                    guildId_channelId: {
                        guildId: message.guildID,
                        channelId: channel
                    }
                }
            });
        }
        return;
    }

    public static async getDisabledCommands(message: Message<any>): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID },
            include: { disabledCommands: true }
        });
        const array = [];
        if (!guild) {
            return null;
        } else {
            if (guild.disabledCommands.length > 0) {
                for await (const command of guild.disabledCommands) {
                    array.push(command);
                }
            }
        }
        return array.length > 0 ? array : null;
    }


    public static async setDisabledCommands(message: Message<any>, command: string): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID }
        });
        if (!guild) {
            await prisma.guild.create({
                data: {
                    guildId: message.guildID,
                    disabledCommands: {
                        create: {
                            name: command,
                            moderator: message.member.id,
                            addTimestamp: Date.now() as any
                        }
                    }
                }
            });
        } else {
            await prisma.disabledCommand.create({
                data: {
                    name: command,
                    moderator: message.member.id,
                    addTimestamp: Date.now() as any,
                    guild: {
                        connect: {
                            guildId: message.guildID
                        }
                    }
                }
            });
        }
        return;
    }

    public static async removeDisabledCommands(message: Message<any>, command?: string): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID },
            include: { disabledCommands: true }
        });

        if (!guild) {
            return null;
        }
        if (!command) {
            await prisma.disabledCommand.deleteMany({
                where: {
                    guildId: message.guildID
                }
            });
        } else {
            await prisma.disabledCommand.delete({
                where: {
                    guildId_name: {
                        guildId: message.guildID,
                        name: command
                    }
                }
            });
        }
        return;
    }

    public static async setTrackButtonMode(message: Context, mode: boolean): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guild.id },
            include: { trackButtons: true }
        });
        if (!guild) {
            await prisma.guild.create({
                data: {
                    guildId: message.guild.id,
                    trackButtons: {
                        create: {
                            mode: mode,
                            addTimestamp: Date.now() as any
                        }
                    }

                }
            });
        } else {
            await prisma.trackButton.update({
                where: {
                    guildId: message.guild.id
                },
                data: {
                    mode: mode,
                    addTimestamp: Date.now() as any
                }
            });
        }
        return;
    }

    public static async getDjRole(message: Message<any>): Promise<any> {
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guildID },
            include: { Dj: true }
        });
        if (!guild) {
            return null;
        } else {
            return guild.Dj;
        }
    }

    public static async setDjRole(message: Message<any>, role: any, mode: boolean) {
        const guild = await prisma.guild.findUnique({ where: { guildId: message.guildID } });

        if (!guild) {
            await prisma.guild.create({
                data: {
                    guildId: message.guildID,
                    Dj: {
                        create: {
                            mode: mode,
                            roles: {
                                create: {
                                    roleId: role.id,
                                    addTimestamp: Date.now(),
                                    moderator: message.member.id
                                }
                            }
                        }
                    }
                },
                include: {
                    Dj: true
                }
            });
        } else {
            const existingDj = await prisma.dj.findUnique({
                where: { guildId: message.guildID },
                include: { roles: true }
            });

            if (existingDj) {
                const existingRole = existingDj.roles.find((r) => r.roleId === role.id);

                if (existingRole) {
                    await prisma.djRole.update({
                        where: { id: existingRole.id },
                        data: {
                            addTimestamp: Date.now(),
                            moderator: message.member.id
                        }
                    });
                } else {
                    await prisma.djRole.create({
                        data: {
                            roleId: role.id,
                            addTimestamp: Date.now(),
                            moderator: message.member.id,
                            Dj: {
                                connect: { guildId: message.guildID }
                            },
                            Guild: {
                                connect: { guildId: message.guildID }
                            }
                        }
                    });
                }
            } else {
                await prisma.dj.create({
                    data: {
                        mode: mode,
                        roles: {
                            create: {
                                roleId: role.id,
                                addTimestamp: Date.now(),
                                moderator: message.member.id
                            }
                        },
                        guild: {
                            connect: { guildId: message.guildID }
                        }
                    }
                });
            }
        }
    }
    public static async removeDjRole(message: Message<any>, role?: any) {
        const guild = await prisma.guild.findUnique({ where: { guildId: message.guildID } });

        if (!guild) {
            return null;
        }
        if (!role) {
            await prisma.djRole.deleteMany({
                where: {
                    djGuildId: message.guildID
                }
            });
        } else {
            const djRole = await prisma.djRole.findUnique({
                where: {
                    djGuildId_roleId: {
                        djGuildId: message.guildID,
                        roleId: role.id
                    }
                }
            });
            if (djRole) {
                await prisma.djRole.delete({
                    where: {
                        id: djRole.id
                    }
                });
            } else {
                // Handle the case when the record doesn't exist
                // For example, you can throw an error or return early
                throw new Error('The DJ role record does not exist.');
            }
        }

        return;
    }

    public static async toogleDjRole(message: Message<any>, mode: boolean): Promise<any> {
        const guild = await prisma.guild.findUnique({ where: { guildId: message.guildID } });

        if (!guild) {
            return null;
        } else {
            await prisma.dj.update({
                where: {
                    guildId: message.guildID
                },
                data: {
                    mode
                }
            });
        }
        return;
    }

    public static async checkDjRole(message: Message<any>): Promise<any> {
        const guild = await prisma.guild.findUnique({ where: { guildId: message.guildID } });

        if (!guild) {
            return true;
        } else {
            const dj = await prisma.dj.findUnique({
                where: {
                    guildId: message.guildID
                },
                include: { roles: true }
            });
            if (!dj) {
                return true;
            } else {
                const roles = dj.roles;
                if (!roles.length) {
                    return true;
                } else {
                    const role = message.member.roles.some((r: any) => roles.some((role: any) => role.roleId === r.id)) || message.member.permissions.has('manageGuild');
                    return role;
                }
            }
        }
    }
    public static async updateCommand(message: Message<any>, commandName: any) {
        const guildId = message.guildID;

        const guild = await prisma.guild.findUnique({ where: { guildId: message.guildID } });

        if (!guild) {
            await prisma.guild.create({ data: { guildId } });
        }

        const command = await prisma.command.findUnique({
            where: { guildId_name: { guildId, name: commandName } }
        });

        if (command) {
            await prisma.command.update({
                where: { guildId_name: { guildId, name: commandName } },
                data: { times: { increment: 1 }, usedTimestamp: Date.now() }
            });
        } else {
            await prisma.command.create({
                data: {
                    name: commandName,
                    times: BigInt(1),
                    usedTimestamp: Date.now(),
                    guild: { connect: { guildId } }
                }
            });
        }
    }

    public static async updateTracks(guildID: any, track: Song) {
        const existingTrack = await prisma.track.findUnique({
            where: {
                guildId_identifier: {
                    guildId: guildID,
                    identifier: track.info.identifier
                }
            }
        });
        if (existingTrack) {
            return await prisma.track.update({
                where: { id: existingTrack.id },
                data: { times: { increment: 1 }, lastPlayedTimestamp: Date.now() }
            });
        } else {
            return await prisma.track.create({
                data: {
                    identifier: track.info.identifier,
                    title: track.info.title,
                    track: track.track,
                    uri: track.info.uri,
                    author: track.info.author,
                    length: track.info.length,
                    isSeekable: track.info.isSeekable,
                    isStream: track.info.isStream,
                    times: 1,
                    lastPlayedTimestamp: Date.now(),
                    requesters: [track.info.requester.id as any],
                    guild: { connect: { guildId: guildID } }

                }
            });
        }
    }
    public static async isTrackButton(guildID: any): Promise<any> {
        const data = await prisma.guild.findUnique({ where: { guildId: guildID } });
        if (!data) {
            return true;
        } else {
            const trackButton = await prisma.trackButton.findUnique({
                where: {
                    guildId: guildID
                }
            });
            if (!trackButton) {
                return true;
            } else {
                return trackButton.mode;
            }
        }
    }
    public static async checkServerPremium(guildID: any): Promise<any> {
        const guildPremium = await prisma.guild.findUnique({
            where: { guildId: guildID },
            select: { premium: true }
        });
        if (!guildPremium) {
            return false;
        }
        if (guildPremium.premium) {
            if (guildPremium.premium.premiumExpiresTimestamp < Date.now()) {
                await prisma.guild.update({
                    where: { guildId: guildID },
                    data: { premium: { delete: true } }
                });
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    public static async getAnnounce(guildID: any): Promise<any> {
        const data = await prisma.guild.findUnique({
            where: { guildId: guildID },
            select: { announce: true }
        });
        if (!data) {
            return null;
        } else {
            return data.announce;
        }
    }
    public static async isPrunning(guildID: any): Promise<any> {
        const data = await prisma.announce.findUnique({
            where: { guildId: guildID },
            select: { prunning: true }
        });
        if (!data) {
            return true;
        } else {
            return data.prunning;
        }
    }

    

    public static async getVoteSkip(guildID: any): Promise<voteSkip> {
        const data = await prisma.voteSkip.findUnique({
            where: { guildId: guildID },
            select: { mode: true }
        }) as voteSkip;
        if (!data) {
            return {
                mode: true,
                moderator: null,
                guildId: guildID,
                addTimestamp: null
            };
        } else {
            return data;
        }
    }
    public static async setLogger(id: string, user: User, types: logType[], channel: TextChannel, color: string): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        const existingChannels = await prisma.logChannel.findMany({
            where: {
                guildId: id,
                type: {
                    hasEvery: types
                }
            }
        });
        await Promise.all(
            existingChannels.map(async (logChannel) => {
                const filteredType = logChannel.type.filter((t) => !types.includes(t));
                await prisma.logChannel.update({
                    where: {
                        id: logChannel.id
                    },
                    data: {
                        type: filteredType
                    }
                });
            })
        );

        if (!server) {
            await prisma.guild.create({
                data: {
                    guildId: id,
                    logger: {
                        create: {
                            LogChannel: {
                                create: {
                                    guildId: id,
                                    textId: channel.id,
                                    type: types,
                                    mode: true,
                                    moderator: user.id,
                                    color: color
                                }
                            }
                        }
                    }
                }
            });
        } else {
            const logChannel = await prisma.logChannel.findFirst({
                where: {
                    guildId: id,
                    textId: channel.id
                }
            });

            if (logChannel) {
                const newTypes = types.filter((t) => !logChannel.type.includes(t));
                const updatedTypes = [...logChannel.type, ...newTypes.filter(Boolean)];

                await prisma.logChannel.update({
                    where: {
                        id: logChannel.id
                    },
                    data: {
                        type: updatedTypes
                    }
                });

            } else {
                await prisma.logChannel.create({
                    data: {
                        guildId: id,
                        textId: channel.id,
                        type: types,
                        mode: true,
                        moderator: user.id,
                        color: color
                    }
                });
            }
        }
    }
    public static async toggleLogger(id: string, user: User, types: logType[], channel: TextChannel, toggle: boolean): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        const existingChannels = await prisma.logChannel.findMany({
            where: {
                guildId: id,
                type: {
                    hasEvery: types
                }
            }
        });
        await Promise.all(
            existingChannels.map(async (logChannel) => {
                await prisma.logChannel.update({
                    where: {
                        id: logChannel.id
                    },
                    data: {
                        mode: toggle
                    }
                });
            })
        );

        if (!server) {
            await prisma.guild.create({
                data: {
                    guildId: id,
                    logger: {
                        create: {
                            LogChannel: {
                                create: {
                                    guildId: id,
                                    textId: channel.id,
                                    type: types,
                                    mode: toggle,
                                    moderator: user.id
                                }
                            }
                        }
                    }
                }
            });
        } else {
            const logChannel = await prisma.logChannel.findFirst({
                where: {
                    guildId: id,
                    textId: channel.id
                }
            });

            if (logChannel) {
                await prisma.logChannel.update({
                    where: {
                        id: logChannel.id
                    },
                    data: {
                        mode: toggle
                    }
                });
            } else {
                await prisma.logChannel.create({
                    data: {
                        guildId: id,
                        textId: channel.id,
                        type: types,
                        mode: toggle,
                        moderator: user.id
                    }
                });
            }
        }
    }

    public static async clearLogger(id: string, user: User, channel: TextChannel): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        if (!server) {
            return;
        }
        const logChannel = await prisma.logChannel.findFirst({
            where: {
                guildId: id,
                textId: channel.id
            }
        });

        if (logChannel) {
            await prisma.logChannel.delete({
                where: {
                    id: logChannel.id
                }
            });
        }
    }
    public static async getLogger(id: string, type: logType): Promise<LogChannel> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        if (!server) {
            return null;
        }
        const logger = await prisma.logChannel.findFirst({
            where: {
                guildId: id,
                mode: true,
                type: {
                    has: type
                }
            }
        });

        return logger;
    }

    public static async getWelcome(id: string): Promise<Welcome> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        if (!server) {
            return null;
        }
        const welcome = await prisma.welcome.findFirst({
            where: {
                guildId: id
            }
        });

        return welcome;
    }

    public static async setWelChannel(id: string, user: User, channel: TextChannel): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        if (!server) {
            await prisma.guild.create({
                data: {
                    guildId: id,
                    welcome: {
                        create: {
                            welcomeChannel: channel.id,
                            welcomeToggle: true,
                            moderator: user.id
                        }
                    }
                }
            });
        } else {
            const welcome = await prisma.welcome.findFirst({
                where: {
                    guildId: id
                }
            });

            if (welcome) {
                await prisma.welcome.update({
                    where: {
                        id: welcome.id
                    },
                    data: {
                        welcomeChannel: channel.id,
                        welcomeToggle: true,
                        moderator: user.id
                    }
                });
            } else {
                await prisma.welcome.create({
                    data: {
                        guildId: id,
                        welcomeChannel: channel.id,
                        welcomeToggle: true,
                        moderator: user.id
                    }
                });
            }
        }
    }
    public static async setWelMessage(id: string, user: User, message: string): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        if (!server) {
            await prisma.guild.create({
                data: {
                    guildId: id,
                    welcome: {
                        create: {
                            welcomeMesage: message,
                            moderator: user.id
                        }
                    }
                }
            });
        } else {
            const welcome = await prisma.welcome.findFirst({
                where: {
                    guildId: id
                }
            });

            if (welcome) {
                await prisma.welcome.update({
                    where: {
                        id: welcome.id
                    },
                    data: {
                        welcomeMesage: message,
                        moderator: user.id
                    }
                });
            } else {
                await prisma.welcome.create({
                    data: {
                        guildId: id,
                        welcomeMesage: message,
                        moderator: user.id
                    }
                });
            }
        }
    }
    //moderation
    public static async setWelToggle(id: string, user: User, toggle: boolean): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        if (!server) {
            await prisma.guild.create({
                data: {
                    guildId: id,
                    welcome: {
                        create: {
                            welcomeToggle: toggle,
                            moderator: user.id
                        }
                    }
                }
            });
        } else {
            const welcome = await prisma.welcome.findFirst({
                where: {
                    guildId: id
                }
            });

            if (welcome) {
                await prisma.welcome.update({
                    where: {
                        id: welcome.id
                    },
                    data: {
                        welcomeToggle: toggle,
                        moderator: user.id
                    }
                });
            } else {
                await prisma.welcome.create({
                    data: {
                        guildId: id,
                        welcomeToggle: toggle,
                        moderator: user.id
                    }
                });
            }
        }
    }

    public static async toggleType(id: string, user: User, options: wlType): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        const toggleField = options.isEmbed ? 'welcomeEmbedToggle' : 'welcomeMessageToggle';
        const data = { [toggleField]: true, moderator: user.id };

        if (!server) {
            await prisma.guild.create({
                data: {
                    guildId: id,
                    welcome: { create: data }
                }
            });
        } else {
            const welcome = await prisma.welcome.findFirst({ where: { guildId: id } });

            if (welcome) {
                await prisma.welcome.update({ where: { id: welcome.id }, data });
            } else {
                await prisma.welcome.create({ data: { guildId: id, ...data } });
            }
        }
    }

    public static async setWelEmbed(id: string, user: User, options: wlEmbed): Promise<void> {
        const server = await prisma.guild.findUnique({
            where: {
                guildId: id
            }
        });
        const toggleField = options.title ? 'title' : options.titleUrl ? 'titleUrl' : options.description ? 'description' : options.color ? 'color' : options.image ? 'image' : options.thumbnail ? 'thumbnail' : options.footer ? 'footer' : options.footerIcon ? 'footerIcon' : options.author ? 'author' : options.authorUrl ? 'authorUrl' : options.authorIcon ? 'authorIcon' : options.timestamp ? 'timestamp' : null;
        const data = { [toggleField]: true, moderator: user.id } as any;

        if (!server) {
            await prisma.guild.create({
                data: {
                    guildId: id,
                    welcome: { create: data }
                }
            });
        } else {
            const welcome = await prisma.welcomeEmbed.findFirst({ where: { guildId: id } });

            if (welcome) {
                await prisma.welcomeEmbed.update({ where: { id: welcome.id }, data });
            } else {
                await prisma.welcomeEmbed.create({ data: { guildId: id, ...data } });
            }
        }
    } */
}

interface wlType {
    isEmbed?: boolean;
    isMessage?: boolean;
}

interface wlEmbed {
    title?: string;
    titleUrl?: string;
    description?: string;
    color?: string;
    image?: string;
    thumbnail?: string;
    footer?: string;
    footerIcon?: string;
    author?: string;
    authorUrl?: string;
    authorIcon?: string;
    timestamp?: boolean;
}
