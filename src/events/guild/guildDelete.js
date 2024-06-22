var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from "discord.js";
export default class {
    execute(client, guild) {
        return __awaiter(this, void 0, void 0, function* () {
            client.logger.info("GuildDelete", `Left guild ${guild.name} @ ${guild.id}`);
            const language = client.config.bot.LANGUAGE;
            client.guilds.cache.delete(`${guild.id}`);
            if (!client.config.utilities.GUILD_LOG_CHANNEL)
                return;
            const eventChannel = yield client.channels
                .fetch(client.config.utilities.GUILD_LOG_CHANNEL)
                .catch(() => undefined);
            if (!eventChannel || !eventChannel.isTextBased())
                return;
            const owner = yield guild.fetchOwner();
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.i18n.get(language, "event.guild", "leave_title")}`,
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
            eventChannel.messages.channel.send({ embeds: [embed] }).catch(() => undefined);
        });
    }
}
