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
import { resolve } from "path";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
export class ClientEventsLoader {
    constructor(client) {
        this.counter = 0;
        this.client = client;
        this.loader();
    }
    loader() {
        return __awaiter(this, void 0, void 0, function* () {
            yield chillout.forEach(["client", "guild", "shard", "websocket"], (path) => __awaiter(this, void 0, void 0, function* () {
                let eventsPath = resolve(join(__dirname, "..", "events", path));
                let eventsFile = yield readdirRecursive(eventsPath);
                yield this.registerPath(eventsFile);
            }));
            this.client.logger.info(ClientEventsLoader.name, `${this.counter} Events Loaded!`);
        });
    }
    registerPath(eventsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield chillout.forEach(eventsPath, (path) => __awaiter(this, void 0, void 0, function* () {
                yield this.registerEvents(path);
            }));
        });
    }
    registerEvents(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = new (yield import(pathToFileURL(path).toString())).default();
            var splitPath = function (str) {
                return str.split("\\").pop().split("/").pop().split(".")[0];
            };
            const eName = splitPath(path);
            if (!events.execute)
                return this.client.logger.warn(ClientEventsLoader.name, `Event [${eName}] doesn't have exeture function on the class, Skipping...`);
            this.client.on(eName, (...args) => events.execute(this.client, ...args));
            this.counter = this.counter + 1;
        });
    }
}
