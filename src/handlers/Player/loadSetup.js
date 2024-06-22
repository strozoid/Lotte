import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
/**
 *
 * @param {Client} client
 */
export class PlayerSetupLoader {
    constructor(client) {
        this.client = client;
        this.icons = this.client.config.emojis.PLAYER;
        this.registerDisableSwitch();
        this.registerEnableSwitch();
        this.registerEnableSwitchMod();
    }
    registerEnableSwitch() {
        this.client.enSwitch = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sstop")
                .setEmoji(this.icons.stop),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sprevious")
                .setEmoji(this.icons.previous),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("spause")
                .setEmoji(this.icons.play),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sskip")
                .setEmoji(this.icons.skip),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sloop")
                .setEmoji(this.icons.loop),
        ]);
    }
    registerEnableSwitchMod() {
        this.client.enSwitchMod = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sstop")
                .setEmoji(this.icons.stop),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sprevious")
                .setEmoji(this.icons.previous),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("spause")
                .setEmoji(this.icons.pause),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sskip")
                .setEmoji(this.icons.skip),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sloop")
                .setEmoji(this.icons.loop),
        ]);
    }
    registerDisableSwitch() {
        this.client.diSwitch = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sstop")
                .setEmoji(this.icons.stop)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sprevious")
                .setEmoji(this.icons.previous)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("spause")
                .setEmoji(this.icons.play)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sskip")
                .setEmoji(this.icons.skip)
                .setDisabled(true),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("sloop")
                .setEmoji(this.icons.loop)
                .setDisabled(true),
        ]);
    }
}
