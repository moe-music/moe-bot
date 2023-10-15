-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('Arabic', 'Indonesian', 'EnglishUS', 'EnglishGB', 'German', 'Bulgarian', 'ChineseCN', 'ChineseTW', 'Croatian', 'Czech', 'Danish', 'Dutch', 'Finnish', 'French', 'Greek', 'Hindi', 'Hungarian', 'Italian', 'Japanese', 'Korean', 'Lithuanian', 'Norwegian', 'Polish', 'PortugueseBR', 'Romanian', 'Russian', 'SpanishES', 'Swedish', 'Thai', 'Turkish', 'Ukrainian', 'Vietnamese');

-- CreateEnum
CREATE TYPE "logType" AS ENUM ('ServerUpdate', 'MessageDelete', 'BulkMessageDelete', 'MessageEdit', 'MemberJoin', 'MemberLeave', 'MemberUpdate', 'MemberRoleAdd', 'MemberRoleRemove', 'MembersNicknameUpdate', 'MemberUsernameUpdate', 'MemberAvatarUpdate', 'MemberBan', 'MemberUnban', 'MemberKick', 'ChannelCreate', 'ChannelDelete', 'ChannelUpdate', 'ChannelPinsUpdate', 'EmojiCreate', 'EmojiDelete', 'EmojiUpdate', 'InviteCreate', 'InviteDelete', 'RoleCreate', 'RoleDelete', 'RoleUpdate', 'VoiceJoin', 'VoiceLeave', 'VoiceMove', 'VoiceServerDeafen', 'VoiceServerMute', 'VoiceDeafen', 'VoiceStream', 'threadCreate', 'threadDelete', 'threadUpdate', 'threadListSync', 'threadMemberUpdate', 'threadMembersUpdate');

-- CreateEnum
CREATE TYPE "PunishmentType" AS ENUM ('MUTE', 'KICK', 'BAN', 'WARN', 'OTHER');

-- CreateEnum
CREATE TYPE "Badges" AS ENUM ('OWNER', 'DEVELOPER', 'ADMIN', 'MODERATOR', 'HELPER', 'STAFF', 'SUPPORTER', 'TRANSLATOR', 'TESTER', 'PARTNER', 'DONATOR', 'SPECIAL', 'TEAM', 'NONE');

-- CreateTable
CREATE TABLE "Guild" (
    "guildId" TEXT NOT NULL,
    "noPrefix" BOOLEAN NOT NULL DEFAULT false,
    "language" "Languages" NOT NULL DEFAULT 'EnglishUS'
);

-- CreateTable
CREATE TABLE "Announce" (
    "mode" BOOLEAN NOT NULL DEFAULT false,
    "channelId" TEXT NOT NULL,
    "addTimestamp" BIGINT,
    "moderator" TEXT,
    "guildId" TEXT NOT NULL,
    "prunning" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Announce_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "voteSkip" (
    "mode" BOOLEAN NOT NULL DEFAULT true,
    "moderator" TEXT NOT NULL DEFAULT '977742811132743762',
    "addTimestamp" BIGINT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "voteSkip_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "DefaultVolume" (
    "volume" INTEGER NOT NULL DEFAULT 100,
    "guildId" TEXT NOT NULL,
    "moderator" TEXT NOT NULL DEFAULT '977742811132743762',
    "addTimestamp" BIGINT,

    CONSTRAINT "DefaultVolume_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "prefix" TEXT,
    "noPrefix" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Bot" (
    "botId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Prefix" (
    "id" SERIAL NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '?',
    "moderator" TEXT NOT NULL DEFAULT '977742811132743762',
    "addTimestamp" BIGINT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Prefix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackButton" (
    "mode" BOOLEAN NOT NULL DEFAULT true,
    "moderator" TEXT NOT NULL DEFAULT '977742811132743762',
    "addTimestamp" BIGINT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "TrackButton_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Stay247" (
    "mode" BOOLEAN NOT NULL DEFAULT false,
    "voiceChannelId" TEXT NOT NULL,
    "textChannelId" TEXT NOT NULL,
    "addTimestamp" BIGINT,
    "moderator" TEXT,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Stay247_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "times" BIGINT NOT NULL DEFAULT 0,
    "usedTimestamp" BIGINT,
    "guildId" TEXT,
    "userId" TEXT,
    "botId" TEXT,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisabledCommand" (
    "name" TEXT NOT NULL,
    "moderator" TEXT,
    "addTimestamp" BIGINT,
    "guildId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Dj" (
    "mode" BOOLEAN NOT NULL DEFAULT false,
    "guildId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DjRole" (
    "id" SERIAL NOT NULL,
    "roleId" TEXT NOT NULL,
    "moderator" TEXT,
    "addTimestamp" BIGINT,
    "djGuildId" TEXT,
    "guildGuildId" TEXT,

    CONSTRAINT "DjRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotChannel" (
    "channelId" TEXT NOT NULL,
    "moderator" TEXT,
    "addTimestamp" BIGINT,
    "guildId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VoiceChannel" (
    "channelId" TEXT NOT NULL,
    "moderator" TEXT,
    "addTimestamp" BIGINT,
    "guildId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "track" TEXT,
    "identifier" TEXT NOT NULL,
    "author" TEXT,
    "length" BIGINT,
    "isSeekable" BOOLEAN,
    "isStream" BOOLEAN,
    "uri" TEXT NOT NULL DEFAULT 'https://moebot.pro',
    "times" BIGINT NOT NULL DEFAULT 1,
    "requesters" TEXT[],
    "lastPlayedTimestamp" BIGINT,
    "guildId" TEXT,
    "userId" TEXT,
    "botId" TEXT,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LastPlayed" (
    "id" SERIAL NOT NULL,
    "textChannel" TEXT NOT NULL,
    "tracks" TEXT[],
    "userId" TEXT,

    CONSTRAINT "LastPlayed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Premium" (
    "id" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumType" TEXT NOT NULL DEFAULT 'none',
    "premiumTimestamp" BIGINT NOT NULL,
    "premiumExpiresTimestamp" BIGINT NOT NULL,
    "userId" TEXT,
    "guildId" TEXT,

    CONSTRAINT "Premium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "code" TEXT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "plan" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'none'
);

-- CreateTable
CREATE TABLE "Setup" (
    "moderator" TEXT,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "addTimestamp" BIGINT,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "Profile" (
    "bio" TEXT NOT NULL DEFAULT 'No bio provided.',
    "color" TEXT NOT NULL DEFAULT '#59D893',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "userId" TEXT NOT NULL,
    "badges" "Badges"[] DEFAULT ARRAY['NONE']::"Badges"[],

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Vote" (
    "voted" BOOLEAN NOT NULL DEFAULT false,
    "voteTimestamp" BIGINT,
    "voteExpiresTimestamp" BIGINT NOT NULL,
    "voteIn" TEXT NOT NULL DEFAULT 'none',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tracks" TEXT[],
    "createdTimestamp" BIGINT,
    "lastUpdatedTimestamp" BIGINT,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "likes" BIGINT NOT NULL DEFAULT 0,
    "likedUsers" TEXT[],
    "trackId" TEXT NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("trackId")
);

-- CreateTable
CREATE TABLE "Logger" (
    "id" TEXT NOT NULL,
    "guildId" TEXT,

    CONSTRAINT "Logger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogChannel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "logGuild" TEXT,
    "textId" TEXT,
    "hookUrl" TEXT,
    "mode" BOOLEAN NOT NULL DEFAULT false,
    "type" "logType"[],
    "color" TEXT NOT NULL DEFAULT '#ff0000',
    "moderator" TEXT,

    CONSTRAINT "LogChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Welcome" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "jsonCode" TEXT,
    "jsonCodeLeave" TEXT,
    "welcomeToggle" BOOLEAN NOT NULL DEFAULT false,
    "leaveToggle" BOOLEAN NOT NULL DEFAULT false,
    "welcomeBackground" TEXT,
    "leaveBackground" TEXT,
    "welcomePrivateToggle" BOOLEAN NOT NULL DEFAULT false,
    "leavePrivateToggle" BOOLEAN NOT NULL DEFAULT false,
    "welcomeMessageToggle" BOOLEAN NOT NULL DEFAULT false,
    "leaveMessageToggle" BOOLEAN NOT NULL DEFAULT false,
    "welcomeEmbedToggle" BOOLEAN NOT NULL DEFAULT false,
    "leaveEmbedToggle" BOOLEAN NOT NULL DEFAULT false,
    "welcomeRoleToggle" BOOLEAN NOT NULL DEFAULT false,
    "welcomeMesage" TEXT DEFAULT 'Hello {user}, Welcome to **{server}**!',
    "leaveMessage" TEXT DEFAULT '{user} just left server',
    "welcomeChannel" TEXT,
    "leaveChannel" TEXT,
    "moderator" TEXT,

    CONSTRAINT "Welcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcomeEmbed" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Welcome!',
    "titleUrl" TEXT,
    "description" TEXT DEFAULT 'Welcome {user} to {server}, we now have {memberCount} Members!',
    "color" TEXT DEFAULT '#ff0000',
    "footer" TEXT,
    "footerUrl" TEXT,
    "thumbnail" TEXT,
    "image" TEXT,
    "authorName" TEXT,
    "authorUrl" TEXT,
    "authorIcon" TEXT,

    CONSTRAINT "welcomeEmbed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaveEmbed" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Goodbye!',
    "titleUrl" TEXT,
    "description" TEXT DEFAULT '{user} just left {server}, we now have {memberCount} Members!',
    "color" TEXT DEFAULT '#ff0000',
    "footer" TEXT,
    "footerUrl" TEXT,
    "thumbnail" TEXT,
    "image" TEXT,
    "authorName" TEXT,
    "authorUrl" TEXT,
    "authorIcon" TEXT,

    CONSTRAINT "leaveEmbed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcomeRole" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "welcomeRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Punishment" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "moderator" TEXT,
    "type" "PunishmentType" NOT NULL,
    "reason" TEXT,
    "createdAt" BIGINT,
    "flags" BIGINT NOT NULL DEFAULT 0,
    "expires" BIGINT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "UserId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Punishment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_guildId_key" ON "Guild"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bot_botId_key" ON "Bot"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "Prefix_guildId_prefix_key" ON "Prefix"("guildId", "prefix");

-- CreateIndex
CREATE UNIQUE INDEX "Command_guildId_name_key" ON "Command"("guildId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Command_userId_name_key" ON "Command"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Command_botId_name_key" ON "Command"("botId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DisabledCommand_guildId_name_key" ON "DisabledCommand"("guildId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Dj_guildId_key" ON "Dj"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "DjRole_djGuildId_roleId_key" ON "DjRole"("djGuildId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "BotChannel_guildId_channelId_key" ON "BotChannel"("guildId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceChannel_guildId_channelId_key" ON "VoiceChannel"("guildId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_id_key" ON "Track"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Track_guildId_identifier_key" ON "Track"("guildId", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Track_userId_identifier_key" ON "Track"("userId", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Track_botId_identifier_key" ON "Track"("botId", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "LastPlayed_userId_key" ON "LastPlayed"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Premium_id_key" ON "Premium"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Premium_userId_key" ON "Premium"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Premium_guildId_key" ON "Premium"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Code_code_key" ON "Code"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_id_key" ON "Playlist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_userId_name_key" ON "Playlist"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Logger_guildId_key" ON "Logger"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "LogChannel_guildId_type_key" ON "LogChannel"("guildId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Welcome_guildId_key" ON "Welcome"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Welcome_welcomeChannel_key" ON "Welcome"("welcomeChannel");

-- CreateIndex
CREATE UNIQUE INDEX "Welcome_leaveChannel_key" ON "Welcome"("leaveChannel");

-- CreateIndex
CREATE UNIQUE INDEX "welcomeEmbed_guildId_key" ON "welcomeEmbed"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "leaveEmbed_guildId_key" ON "leaveEmbed"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "welcomeRole_guildId_roleId_key" ON "welcomeRole"("guildId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Punishment_id_key" ON "Punishment"("id");

-- AddForeignKey
ALTER TABLE "Announce" ADD CONSTRAINT "Announce_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voteSkip" ADD CONSTRAINT "voteSkip_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultVolume" ADD CONSTRAINT "DefaultVolume_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prefix" ADD CONSTRAINT "Prefix_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackButton" ADD CONSTRAINT "TrackButton_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stay247" ADD CONSTRAINT "Stay247_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("botId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisabledCommand" ADD CONSTRAINT "DisabledCommand_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dj" ADD CONSTRAINT "Dj_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjRole" ADD CONSTRAINT "DjRole_djGuildId_fkey" FOREIGN KEY ("djGuildId") REFERENCES "Dj"("guildId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DjRole" ADD CONSTRAINT "DjRole_guildGuildId_fkey" FOREIGN KEY ("guildGuildId") REFERENCES "Guild"("guildId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotChannel" ADD CONSTRAINT "BotChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceChannel" ADD CONSTRAINT "VoiceChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("botId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastPlayed" ADD CONSTRAINT "LastPlayed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premium" ADD CONSTRAINT "Premium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premium" ADD CONSTRAINT "Premium_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setup" ADD CONSTRAINT "Setup_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Logger" ADD CONSTRAINT "Logger_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogChannel" ADD CONSTRAINT "LogChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogChannel" ADD CONSTRAINT "LogChannel_logGuild_fkey" FOREIGN KEY ("logGuild") REFERENCES "Logger"("guildId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcomeEmbed" ADD CONSTRAINT "welcomeEmbed_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Welcome"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaveEmbed" ADD CONSTRAINT "leaveEmbed_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Welcome"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcomeRole" ADD CONSTRAINT "welcomeRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Welcome"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("guildId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
