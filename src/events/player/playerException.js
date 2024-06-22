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
import util from "node:util";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
export default class {
    execute(client, player, data) {
        return __awaiter(this, void 0, void 0, function* () {
            client.logger.error("PlayerException", `Player get exception ${util.inspect(data).slice(1).slice(0, -1)}`);
            /////////// Update Music Setup //////////
            yield client.UpdateMusic(player);
            /////////// Update Music Setup ///////////
            const fetch_channel = yield client.channels.fetch(player.textId).catch(() => undefined);
            const text_channel = fetch_channel;
            if (text_channel) {
                yield text_channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription("Player get exception, please contact with owner to fix this error"),
                    ],
                });
            }
            const data247 = yield new AutoReconnectBuilderService(client, player).get(player.guildId);
            const channel = (yield client.channels
                .fetch(player.textId)
                .catch(() => undefined));
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
