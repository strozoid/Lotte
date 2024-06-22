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
import { PlayerButton } from "../../@types/Button.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
export class PlayerButtonsLoader {
    constructor(client) {
        this.client = client;
        this.loader();
    }
    loader() {
        return __awaiter(this, void 0, void 0, function* () {
            let commandPath = resolve(join(__dirname, "..", "..", "buttons"));
            let commandFiles = yield readdirRecursive(commandPath);
            yield chillout.forEach(commandFiles, (commandFile) => __awaiter(this, void 0, void 0, function* () {
                yield this.register(commandFile);
            }));
            if (this.client.plButton.size) {
                this.client.logger.info(PlayerButtonsLoader.name, `${this.client.plButton.size} player buttons Loaded!`);
            }
            else {
                this.client.logger.warn(PlayerButtonsLoader.name, `No player button loaded, is everything ok?`);
            }
        });
    }
    register(commandFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const rltPath = relative(__dirname, commandFile);
            const command = new (yield import(pathToFileURL(commandFile).toString())).default();
            if (!((_a = command.name) === null || _a === void 0 ? void 0 : _a.length)) {
                this.client.logger.warn(PlayerButtonsLoader.name, `"${rltPath}" The player button file does not have a name. Skipping...`);
                return;
            }
            if (this.client.plButton.get(command.name)) {
                this.client.logger.warn(PlayerButtonsLoader.name, `"${command.name}" player button has already been installed. Skipping...`);
                return;
            }
            const checkRes = this.keyChecker(command);
            if (checkRes !== KeyCheckerEnum.Pass) {
                this.client.logger.warn(PlayerButtonsLoader.name, `"${command.name}" player button is not implements correctly [${checkRes}]. Skipping...`);
                return;
            }
            this.client.plButton.set(command.name, command);
        });
    }
    keyChecker(obj) {
        const base = new PlayerButton();
        const baseKeyArray = Object.keys(base);
        const check = Object.keys(obj);
        const checkedKey = [];
        if (baseKeyArray.length > check.length)
            return KeyCheckerEnum.MissingKey;
        if (baseKeyArray.length < check.length)
            return KeyCheckerEnum.TooMuchKey;
        if (obj.run == undefined)
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
