var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chillout from "chillout";
import readdirRecursive from "recursive-readdir";
import { resolve, relative } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { KeyCheckerEnum } from "../../@types/KeyChecker.js";
import { Command } from "../../structures/Command.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
export class CommandLoader {
    constructor(client) {
        this.client = client;
        this.loader();
    }
    loader() {
        return __awaiter(this, void 0, void 0, function* () {
            let commandPath = resolve(join(__dirname, "..", "..", "commands"));
            let commandFiles = yield readdirRecursive(commandPath);
            yield chillout.forEach(commandFiles, (commandFile) => __awaiter(this, void 0, void 0, function* () {
                yield this.register(commandFile);
            }));
            if (this.client.commands.size) {
                const commandColl = this.client.commands;
                const array1 = commandColl.filter((command) => command.name.length === 1).size;
                const array2 = commandColl.filter((command) => command.name.length === 2).size;
                const array3 = commandColl.filter((command) => command.name.length === 3).size;
                const haveInteraction = commandColl.filter((command) => command.usingInteraction).size;
                this.client.logger.info(CommandLoader.name, `@ | Command Load Results:`);
                this.client.logger.info(CommandLoader.name, `@ | ${array1} Command Without Prefix`);
                this.client.logger.info(CommandLoader.name, `@ | ${array2} Command With 1 Prefix`);
                this.client.logger.info(CommandLoader.name, `@ | ${array3} Command With 2 Prefix`);
                this.client.logger.info(CommandLoader.name, `@ | ${haveInteraction} Command Support Interaction/Prefix`);
                this.client.logger.info(CommandLoader.name, `@ | ${commandColl.size - haveInteraction} Command Support Prefix Only`);
                this.client.logger.info(CommandLoader.name, `@ | Total ${commandColl.size} Command Loaded!`);
            }
            else {
                this.client.logger.warn(CommandLoader.name, `No command loaded, is everything ok?`);
            }
        });
    }
    register(commandFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const rltPath = relative(__dirname, commandFile);
            const command = new (yield import(pathToFileURL(commandFile).toString())).default();
            if (!((_a = command.name) === null || _a === void 0 ? void 0 : _a.length)) {
                this.client.logger.warn(CommandLoader.name, `"${rltPath}" The command file does not have a name. Skipping...`);
                return;
            }
            if (this.client.commands.has(command.name)) {
                this.client.logger.warn(CommandLoader.name, `"${command.name}" command has already been installed. Skipping...`);
                return;
            }
            const checkRes = this.keyChecker(command);
            if (checkRes !== KeyCheckerEnum.Pass) {
                this.client.logger.warn(CommandLoader.name, `"${command.name}" command is not implements correctly [${checkRes}]. Skipping...`);
                return;
            }
            this.client.commands.set(command.name.join("-"), command);
            if (command.aliases && command.aliases.length !== 0)
                command.aliases.forEach((a) => this.client.aliases.set(a, command.name.join("-")));
        });
    }
    keyChecker(obj) {
        const base = new Command();
        const baseKeyArray = Object.keys(base);
        const check = Object.keys(obj);
        const checkedKey = [];
        if (baseKeyArray.length > check.length)
            return KeyCheckerEnum.MissingKey;
        if (baseKeyArray.length < check.length)
            return KeyCheckerEnum.TooMuchKey;
        if (obj.execute == undefined)
            return KeyCheckerEnum.NoRunFunction;
        try {
            for (let i = 0; i < check.length; i++) {
                if (checkedKey.includes(check[i]))
                    return KeyCheckerEnum.DuplicateKey;
                if (!(check[i] in base))
                    return KeyCheckerEnum.InvalidKey;
                checkedKey.push(check[i]);
            }
        }
        finally {
            checkedKey.length = 0;
            return KeyCheckerEnum.Pass;
        }
    }
}
