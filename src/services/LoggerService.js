var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { createLogger, transports, format } from "winston";
const { timestamp, prettyPrint, printf } = format;
import chalk from "chalk";
import util from "node:util";
import { EmbedBuilder } from "discord.js";
export class LoggerService {
  constructor(client, tag) {
    this.client = client;
    this.tag = tag;
    this.padding = 28;
    this.preLog = createLogger({
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        unhandled: 4,
      },
      transports: [
        new transports.Console({
          level: "unhandled",
          format: this.consoleFormat,
        }),
        new transports.File({
          level: "unhandled",
          filename: "./logs/Lotte.log",
          format: this.fileFormat,
        }),
      ],
    });
  }
  info(className, msg) {
    return this.preLog.log({
      level: "info",
      message: `${className.padEnd(this.padding)} | ${msg}`,
    });
  }
  debug(className, msg) {
    this.preLog.log({
      level: "debug",
      message: `${className.padEnd(this.padding)} | ${msg}`,
    });
    return;
  }
  warn(className, msg) {
    this.preLog.log({
      level: "warn",
      message: `${className.padEnd(this.padding)} | ${msg}`,
    });
    this.sendDiscord("warning", msg, className);
    return;
  }
  error(className, msg) {
    this.preLog.log({
      level: "error",
      message: `${className.padEnd(this.padding)} | ${util.inspect(msg)}`,
    });
    this.sendDiscord("error", util.inspect(msg), className);
    return;
  }
  unhandled(className, msg) {
    this.preLog.log({
      level: "unhandled",
      message: `${className.padEnd(this.padding)} | ${util.inspect(msg)}`,
    });
    this.sendDiscord("unhandled", util.inspect(msg), className);
    return;
  }
  filter(info) {
    const pad = 9;
    switch (info.level) {
      case "info":
        return chalk.hex("#00CFF0")(info.level.toUpperCase().padEnd(pad));
      case "debug":
        return chalk.hex("#F5A900")(info.level.toUpperCase().padEnd(pad));
      case "warn":
        return chalk.hex("#FBEC5D")(info.level.toUpperCase().padEnd(pad));
      case "error":
        return chalk.hex("#e12885")(info.level.toUpperCase().padEnd(pad));
      case "unhandled":
        return chalk.hex("#ff0000")(info.level.toUpperCase().padEnd(pad));
    }
  }
  get consoleFormat() {
    const colored = chalk.hex("#86cecb")("|");
    const timeStamp = (info) => chalk.hex("#00ddc0")(info.timestamp);
    const botTag = chalk.hex("#2aabf3")(`bot_${this.tag}`);
    const msg = (info) => chalk.hex("#86cecb")(info.message);
    return format.combine(
      timestamp(),
      printf((info) => {
        return `${timeStamp(info)} ${colored} ${botTag} ${colored} ${this.filter(info)} ${colored} ${msg(info)}`;
      })
    );
  }
  get fileFormat() {
    return format.combine(timestamp(), prettyPrint());
  }
  sendDiscord(type, message, className) {
    return __awaiter(this, void 0, void 0, function* () {
      const channelId = this.client.config.utilities.LOG_CHANNEL;
      if (!channelId || channelId.length == 0) return;
      try {
        const channel = yield this.client.channels
          .fetch(channelId)
          .catch(() => undefined);
        if (!channel || !channel.isTextBased()) return;
        let embed = null;
        if (message.length > 4096) {
          embed = new EmbedBuilder()
            .setDescription("Logs too long to display! please check your host!")
            .setTitle(`${type} from ${className}`)
            .setColor(this.client.color);
        } else {
          embed = new EmbedBuilder()
            .setDescription(message)
            .setTitle(`${type} from ${className}`)
            .setColor(this.client.color);
        }
        yield channel.messages.channel.send({ embeds: [embed] });
      } catch (err) {}
    });
  }
}
