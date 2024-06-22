var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { stripIndents } from "common-tags";
import { EmbedBuilder } from "discord.js";
import fs from "fs";
export default class {
    execute(client, guild) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            client.logger.info("GuildCreate", `Joined guild ${guild.name} @ ${guild.id}`);
            const owner = yield guild.fetchOwner();
            const language = client.config.bot.LANGUAGE;
            client.guilds.cache.set(`${guild.id}`, guild);
            let PREFIX = client.prefix;
            const GuildPrefix = yield client.db.prefix.get(`${guild.id}`);
            if (GuildPrefix)
                PREFIX = GuildPrefix;
            else if (!GuildPrefix)
                PREFIX = String(yield client.db.prefix.set(`${guild.id}`, client.prefix));
            const userDm = yield owner.createDM(true).catch(() => null);
            const dmEmbed = new EmbedBuilder()
                .setTitle(`${client.i18n.get(language, "event.guild", "join_dm_title", {
                username: String((_a = client.user) === null || _a === void 0 ? void 0 : _a.username),
            })}`)
                .setDescription(stripIndents `
          ${client.i18n.get(language, "event.message", "intro1", {
                bot: String((_b = client.user) === null || _b === void 0 ? void 0 : _b.displayName),
            })}
          ${client.i18n.get(language, "event.message", "prefix", {
                prefix: `\`${PREFIX}\` or \`/\``,
            })}
          ${client.i18n.get(language, "event.message", "help1", {
                help: `\`${PREFIX}help\` or \`/help\``,
            })}
          ${client.i18n.get(language, "event.message", "help2", {
                botinfo: `\`${PREFIX}status\` or \`/status\``,
            })}
          ${client.i18n.get(language, "event.message", "ver", {
                botver: client.metadata.version,
            })}
          ${client.i18n.get(language, "event.message", "djs", {
                djsver: JSON.parse(fs.readFileSync("package.json", "utf-8")).dependencies["discord.js"],
            })}
          ${client.i18n.get(language, "event.message", "lavalink", {
                aver: client.metadata.autofix,
            })}
          ${client.i18n.get(language, "event.message", "codename", {
                codename: client.metadata.codename,
            })}
        `)
                .setColor(client.color);
            if (userDm)
                userDm.send({ embeds: [dmEmbed] }).catch(() => { });
            if (!client.config.utilities.GUILD_LOG_CHANNEL)
                return;
            const eventChannel = yield client.channels
                .fetch(client.config.utilities.GUILD_LOG_CHANNEL)
                .catch(() => undefined);
            if (!eventChannel || !eventChannel.isTextBased())
                return;
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.i18n.get(language, "event.guild", "joined_title")}`,
            })
                .addFields([
                {
                    name: `${client.i18n.get(language, "event.guild", "guild_name")}`,
                    value: String(guild.name),
                },
                {
                    name: `${client.i18n.get(language, "event.guild", "guild_id")}`,
                    value: String(guild.id),
                },
                {
                    name: `${client.i18n.get(language, "event.guild", "guild_owner")}`,
                    value: `${owner.displayName} [ ${guild.ownerId} ]`,
                },
                {
                    name: `${client.i18n.get(language, "event.guild", "guild_member_count")}`,
                    value: `${guild.memberCount}`,
                },
                {
                    name: `${client.i18n.get(language, "event.guild", "guild_creation_date")}`,
                    value: `${guild.createdAt}`,
                },
                {
                    name: `${client.i18n.get(language, "event.guild", "current_server_count")}`,
                    value: `${client.guilds.cache.size}`,
                },
            ])
                .setTimestamp()
                .setColor(client.color);
            eventChannel.messages.channel.send({ embeds: [embed] }).catch(() => null);
        });
    }
}
