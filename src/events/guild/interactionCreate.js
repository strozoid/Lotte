var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PermissionsBitField, EmbedBuilder, PermissionFlagsBits, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, } from "discord.js";
import { CheckPermissionServices, } from "../../services/CheckPermissionService.js";
import { CommandHandler } from "../../structures/CommandHandler.js";
import { Accessableby } from "../../structures/Command.js";
import { convertOption } from "../../utilities/ConvertOption.js";
import { RatelimitReplyService } from "../../services/RatelimitReplyService.js";
import { RateLimitManager } from "@sapphire/ratelimits";
import { AutoCompleteService } from "../../services/AutoCompleteService.js";
import { TopggServiceEnum } from "../../services/TopggService.js";
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
const commandRateLimitManager = new RateLimitManager(1000);
/**
 * @param {GlobalInteraction} interaction
 */
export default class {
    execute(client, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (interaction.isAutocomplete())
                return new AutoCompleteService(client, interaction);
            if (!interaction.isChatInputCommand())
                return;
            if (!interaction.guild || interaction.user.bot)
                return;
            if (!client.isDatabaseConnected)
                return client.logger.warn("DatabaseService", "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            let guildModel = yield client.db.language.get(`${interaction.guild.id}`);
            if (!guildModel) {
                guildModel = yield client.db.language.set(`${interaction.guild.id}`, client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            let subCommandName = "";
            try {
                subCommandName = interaction.options.getSubcommand();
            }
            catch (_b) { }
            let subCommandGroupName = "";
            try {
                subCommandGroupName = interaction.options.getSubcommandGroup();
            }
            catch (_c) { }
            const commandNameArray = [];
            if (interaction.commandName)
                commandNameArray.push(interaction.commandName);
            if (subCommandName.length !== 0 && !subCommandGroupName)
                commandNameArray.push(subCommandName);
            if (subCommandGroupName) {
                commandNameArray.push(subCommandGroupName);
                commandNameArray.push(subCommandName);
            }
            const command = client.commands.get(commandNameArray.join("-"));
            if (!command)
                return commandNameArray.length == 0;
            //////////////////////////////// Ratelimit check start ////////////////////////////////
            const ratelimit = commandRateLimitManager.acquire(`${interaction.user.id}@${command.name.join("-")}`);
            if (ratelimit.limited) {
                new RatelimitReplyService({
                    client: client,
                    language: language,
                    interaction: interaction,
                    time: Number(((ratelimit.expires - Date.now()) / 1000).toFixed(1)),
                }).reply();
                return;
            }
            else if (ratelimit.limited)
                return;
            ratelimit.consume();
            //////////////////////////////// Ratelimit check end ////////////////////////////////
            //////////////////////////////// Permission check start ////////////////////////////////
            const permissionChecker = new CheckPermissionServices();
            // Default permission
            const defaultPermissions = [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ReadMessageHistory,
            ];
            const musicPermissions = [PermissionFlagsBits.Speak, PermissionFlagsBits.Connect];
            const managePermissions = [PermissionFlagsBits.ManageChannels];
            function respondError(interaction, permissionResult) {
                return __awaiter(this, void 0, void 0, function* () {
                    const selfErrorString = `${client.i18n.get(language, "error", "no_perms", {
                        perm: permissionResult.result,
                    })}`;
                    const embed = new EmbedBuilder()
                        .setDescription(permissionResult.channel == "Self"
                        ? selfErrorString
                        : `${client.i18n.get(language, "error", "no_perms_channel", {
                            perm: permissionResult.result,
                            channel: permissionResult.channel,
                        })}`)
                        .setColor(client.color);
                    yield interaction.reply({
                        embeds: [embed],
                    });
                });
            }
            if (command.name[0] !== "help") {
                const returnData = yield permissionChecker.interaction(interaction, defaultPermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            if (command.category.toLocaleLowerCase() == "music") {
                const returnData = yield permissionChecker.interaction(interaction, musicPermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            if (command.accessableby.includes(Accessableby.Manager)) {
                const returnData = yield permissionChecker.interaction(interaction, managePermissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            else if (command.permissions.length !== 0) {
                const returnData = yield permissionChecker.interaction(interaction, command.permissions);
                if (returnData.result !== "PermissionPass")
                    return respondError(interaction, returnData);
            }
            //////////////////////////////// Permission check end ////////////////////////////////
            //////////////////////////////// Check avalibility start ////////////////////////////////
            const isNotManager = !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild);
            if (command.accessableby.includes(Accessableby.Manager) && isNotManager)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "no_perms", { perm: "ManageGuild" })}`)
                            .setColor(client.color),
                    ],
                });
            if (command.playerCheck) {
                const player = client.rainlink.players.get(interaction.guild.id);
                const twentyFourBuilder = new AutoReconnectBuilderService(client);
                const is247 = yield twentyFourBuilder.get(interaction.guild.id);
                if (!player ||
                    (is247 && is247.twentyfourseven && player.queue.length == 0 && !player.queue.current))
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(language, "error", "no_player")}`)
                                .setColor(client.color),
                        ],
                    });
            }
            if (command.sameVoiceCheck) {
                const { channel } = interaction.member.voice;
                if (!channel ||
                    interaction.member.voice.channel !==
                        interaction.guild.members.me.voice.channel)
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(language, "error", "no_voice")}`)
                                .setColor(client.color),
                        ],
                    });
            }
            if (command.lavalink && client.lavalinkUsing.length == 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "no_node")}`)
                            .setColor(client.color),
                    ],
                });
            }
            //////////////////////////////// Check avalibility end ////////////////////////////////
            //////////////////////////////// Check accessibility start ////////////////////////////////
            const premiumUser = yield client.db.premium.get(interaction.user.id);
            const premiumGuild = yield client.db.preGuild.get(interaction.guild.id);
            const isPremium = premiumUser && premiumUser.isPremium;
            const isPremiumGuild = premiumGuild && premiumGuild.isPremium;
            const isOwner = interaction.user.id == client.owner;
            const isAdmin = client.config.bot.ADMIN.includes(interaction.user.id);
            const userPerm = {
                owner: isOwner,
                admin: isOwner || isAdmin,
                premium: isOwner || isAdmin || isPremium,
                guildPre: isOwner || isAdmin || isPremium || isPremiumGuild,
            };
            if (command.accessableby.includes(Accessableby.Owner) && !userPerm.owner)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "owner_only")}`)
                            .setColor(client.color),
                    ],
                });
            if (command.accessableby.includes(Accessableby.Admin) && !userPerm.admin)
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "no_perms", { perm: "dreamvast@admin" })}`)
                            .setColor(client.color),
                    ],
                });
            if (command.accessableby.includes(Accessableby.Premium) && !userPerm.premium) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(language, "error", "no_premium_author")}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                    .setDescription(`${client.i18n.get(language, "error", "no_premium_desc")}`)
                    .setColor(client.color)
                    .setTimestamp();
                return interaction.reply({
                    content: " ",
                    embeds: [embed],
                });
            }
            if (command.accessableby.includes(Accessableby.GuildPremium) && !userPerm.guildPre) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(language, "error", "no_premium_author")}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                    .setDescription(`${client.i18n.get(language, "error", "no_guild_premium_desc")}`)
                    .setColor(client.color)
                    .setTimestamp();
                return interaction.reply({
                    content: " ",
                    embeds: [embed],
                });
            }
            const isNotPassAll = Object.values(userPerm).some((data) => data === false);
            if (command.accessableby.includes(Accessableby.Voter) && client.topgg && isNotPassAll) {
                const voteChecker = yield client.topgg.checkVote(interaction.user.id);
                if (voteChecker == TopggServiceEnum.ERROR) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                        name: client.i18n.get(language, "error", "topgg_error_author"),
                    })
                        .setDescription(client.i18n.get(language, "error", "topgg_error_desc"))
                        .setColor(client.color)
                        .setTimestamp();
                    return interaction.reply({ content: " ", embeds: [embed] });
                }
                if (voteChecker == TopggServiceEnum.UNVOTED) {
                    const embed = new EmbedBuilder()
                        .setAuthor({
                        name: client.i18n.get(language, "error", "topgg_vote_author"),
                    })
                        .setDescription(client.i18n.get(language, "error", "topgg_vote_desc"))
                        .setColor(client.color)
                        .setTimestamp();
                    const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
                        .setLabel(client.i18n.get(language, "error", "topgg_vote_button"))
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://top.gg/bot/${(_a = client.user) === null || _a === void 0 ? void 0 : _a.id}/vote`));
                    return interaction.reply({ content: " ", embeds: [embed], components: [row] });
                }
            }
            //////////////////////////////// Check accessibility end ////////////////////////////////
            try {
                const args = [];
                let attachments;
                function argConvert(dataArray) {
                    var _a;
                    for (const data of dataArray) {
                        if (data.type == ApplicationCommandOptionType.Subcommand) {
                            argConvert(data.options);
                        }
                        if (data.type == ApplicationCommandOptionType.SubcommandGroup) {
                            argConvert((_a = data.options.filter((data) => data.name == subCommandName).at(0)) === null || _a === void 0 ? void 0 : _a.options);
                        }
                        const check = convertOption({
                            type: data.type,
                            value: String(data.value),
                        });
                        if (check !== "error") {
                            args.push(check);
                        }
                        else if (data.type == ApplicationCommandOptionType.Attachment) {
                            attachments = data.attachment;
                        }
                        else {
                            if (data.value)
                                args.push(String(data.value));
                            if (data.options) {
                                for (const optionData of data.options) {
                                    if (optionData.value)
                                        args.push(String(optionData.value));
                                }
                            }
                        }
                    }
                }
                argConvert(interaction.options.data);
                const handler = new CommandHandler({
                    interaction: interaction,
                    language: language,
                    client: client,
                    args: args,
                    prefix: "/",
                });
                if (attachments)
                    handler.attactments.push(attachments);
                client.logger.info("CommandManager | Interaction", `[${commandNameArray.join("-")}] used by ${interaction.user.username} from ${interaction.guild.name} (${interaction.guild.id})`);
                command.execute(client, handler);
            }
            catch (error) {
                client.logger.error("CommandManager | Interaction", error);
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(language, "error", "unexpected_error")}\n ${error}`)
                            .setColor(client.color),
                    ],
                });
            }
        });
    }
}
