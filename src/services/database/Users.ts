/* eslint-disable object-shorthand */


import prisma from '../../prisma.js';

export class Users {

    public static async createUser(userId: any): Promise<any> {
        const existingUser = await prisma.user.findFirst({
            where: { userId: userId }
        });
        if (existingUser) {
            return existingUser;
        } else {
            return await prisma.user.create({
                data: {
                    userId: userId,
                    noPrefix: false,
                    profile: {
                        create: {
                            bio: 'This user has not set a bio yet.',
                            color: '#55ff00',
                            visibility: 'public'
                        }
                    }
                }
            });
        }
    }
    public static async getUserTrack(user: any): Promise<any> {
        const existingUser = await prisma.user.findUnique({
            where: { userId: user.id },
            select: { tracks: true }
        });
        if (existingUser) {
            return existingUser;
        } else {
            return await prisma.user.create({
                data: {
                    userId: user.id
                }
            });
        }
    }

  /*   public static async updateCommand(message: Message | Context, commandName: string): Promise<any> {
        const userId = message.member.id;
        const user = await prisma.user.findUnique({
            where: { userId: userId }
        });
        if (!user) {
            await prisma.user.create({
                data: {
                    userId: userId
                }
            });
        }

        const command = await prisma.command.findUnique({
            where: {
                userId_name: {
                    userId: userId,
                    name: commandName
                }
            }
        });
        if (command) {
            await prisma.command.update({
                where: { userId_name: { userId: userId, name: commandName } },
                data: { times: { increment: 1 }, usedTimestamp: Date.now() }
            });
        } else {
            await prisma.command.create({
                data: {
                    name: commandName,
                    times: 1,
                    usedTimestamp: Date.now(),
                    user: { connect: { userId: userId } }
                }
            });
        }
    }

    public static async updateTracks(user: any, track: any) {
        const existingTrack = await prisma.track.findUnique({
            where: {
                userId_identifier: {
                    userId: user.id,
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
                    requesters: [track.info.requester.id],
                    user: { connect: { userId: user.id } }
                }
            });
        }
    }
    public static async toggleLike(userId: string, trackId: string): Promise<boolean> {
        const trackID = await this.getTrackId(trackId);
        if (trackID) {
            const like = await prisma.like.findUnique({
                where: { trackId: trackID }
            });
            if (!like) {
                await prisma.track.update({
                    where: { id: trackID },
                    data: {
                        like: {
                            create: {
                                likes: 1,
                                likedUsers: [userId as any]
                            }
                        },
                        bot: { connect: { botId: config.clientId } }
                    }
                });
                return true;
            } else {
                const like = await prisma.like.findUnique({
                    where: { trackId: trackID }
                });
                if (like) {
                    const likedUsers = like.likedUsers;
                    const index = likedUsers.indexOf(userId);
                    if (index >= 0) {
                        likedUsers.splice(index, 1);
                        await prisma.like.update({
                            where: { trackId: trackID },
                            data: {
                                likes: { decrement: 1 },
                                likedUsers: { set: likedUsers }
                            }
                        });
                        return false;
                    } else {
                        await prisma.like.update({
                            where: { trackId: trackID },
                            data: {
                                likes: { increment: 1 },
                                likedUsers: { push: userId }
                            }
                        });
                    }
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    public static async getTrackId(track: any): Promise<any> {
        const existingTrack = await prisma.track.findUnique({
            where: {
                botId_identifier: {
                    botId: config.clientId,
                    identifier: track
                }
            }
        });
        if (existingTrack) {
            return existingTrack.id;
        } else {
            return null;
        }
    }
    public static async checkUserPremium(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { userId },
            select: { premium: true }
        });
        if (!user) {
            return false;
        }
        if (user.premium) {
            if (user.premium.premiumExpiresTimestamp < Date.now()) {
                await prisma.premium.delete({
                    where: { userId }
                });
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    public static async checkVoteInDb(user: any): Promise<boolean> {
        const vote = await prisma.vote.findUnique({
            where: { userId: user.id }
        });
        if (vote) {
            if (vote.voteExpiresTimestamp < Date.now()) {
                await prisma.vote.delete({
                    where: { userId: user.id }
                });
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    public static async checkVoteInTopGG(user: any): Promise<boolean> {
        const topgg = new TopGG();
        const vote = await topgg.voteCheck(config.moe, user.id);
        if (vote) {
            return true;
        } else {
            return false;
        }
    }

    public static async checkVoteInDBL(user: any): Promise<boolean> {
        const dbl = new DBL();
        const vote = await dbl.voteCheck(config.moe, user.id);
        if (vote) {
            return true;
        } else {
            return false;
        }
    }

    public static async checkVote(user: any): Promise<boolean> {
        const userHasVoted = await this.checkVoteInDb(user);
        if (userHasVoted) {
            return true;
        }
        const userHasVotedOnOtherSites = await Promise.all([
            //this.checkVoteInDBL(user),
            this.checkVoteInTopGG(user)
        ]).then((results) => results.some((result) => result));

        if (userHasVotedOnOtherSites) {
            await this.recordUserVote(user);
            return true;
        }
        return false;
    }

    private static async recordUserVote(user: any): Promise<void> {
        await prisma.vote.create({
            data: {
                userId: user.id,
                voted: true,
                voteTimestamp: Date.now(),
                voteExpiresTimestamp: Date.now() + 432000000
            }
        });
    } */
}
