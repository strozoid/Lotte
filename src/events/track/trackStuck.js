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
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
export default class {
    execute(client, player, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.isDatabaseConnected)
                return client.logger.warn("DatabaseService", "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            /////////// Update Music Setup //////////
            yield client.UpdateMusic(player);
            /////////// Update Music Setup ///////////
            const guild = yield client.guilds.fetch(player.guildId).catch(() => undefined);
            const channel = (yield client.channels
                .fetch(player.textId)
                .catch(() => undefined));
            if (!channel)
                return player.destroy().catch(() => { });
            let guildModel = yield client.db.language.get(`${channel.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${channel.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.i18n.get(language, "event.player", "error_desc")}`);
            if (channel) {
                const setup = yield client.db.setup.get(player.guildId);
                const msg = yield channel.send({ embeds: [embed] });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    return !setup || setup == null || setup.channel !== channel.id
                        ? msg.delete().catch(() => null)
                        : true;
                }), client.config.utilities.DELETE_MSG_TIMEOUT);
            }
            client.logger.error("TrackStuck", `Track Stuck in ${guild.name} / ${player.guildId}.`);
            const data247 = yield new AutoReconnectBuilderService(client, player).get(player.guildId);
            if (data247 !== null && data247 && data247.twentyfourseven && channel)
                new ClearMessageService(client, channel, player);
            const currentPlayer = client.rainlink.players.get(player.guildId);
            if (!currentPlayer)
                return;
            if (currentPlayer.queue.length > 0)
                return yield player.skip().catch(() => { });
            if (!currentPlayer.sudoDestroy)
                yield player.destroy().catch(() => { });
        });
    }
}
