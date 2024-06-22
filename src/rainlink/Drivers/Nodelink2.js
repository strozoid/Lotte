var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { metadata } from "../metadata.js";
import { LavalinkLoadType, RainlinkEvents } from "../Interface/Constants.js";
import { AbstractDriver } from "./AbstractDriver.js";
import util from "node:util";
import { RainlinkWebsocket } from "../Utilities/RainlinkWebsocket.js";
import { RainlinkDatabase } from "../Utilities/RainlinkDatabase.js";
export var Nodelink2loadType;
(function (Nodelink2loadType) {
    Nodelink2loadType["SHORTS"] = "shorts";
    Nodelink2loadType["ALBUM"] = "album";
    Nodelink2loadType["ARTIST"] = "artist";
    Nodelink2loadType["SHOW"] = "show";
    Nodelink2loadType["EPISODE"] = "episode";
    Nodelink2loadType["STATION"] = "station";
    Nodelink2loadType["PODCAST"] = "podcast";
})(Nodelink2loadType || (Nodelink2loadType = {}));
export class Nodelink2 extends AbstractDriver {
    constructor() {
        super();
        this.id = "nodelink/v2/nari";
        this.wsUrl = "";
        this.httpUrl = "";
        this.manager = null;
        this.node = null;
        this.sessionId = null;
        this.playerFunctions = new RainlinkDatabase();
        this.functions = new RainlinkDatabase();
        this.playerFunctions.set("getLyric", this.getLyric);
    }
    get isRegistered() {
        return (this.manager !== null &&
            this.node !== null &&
            this.wsUrl.length !== 0 &&
            this.httpUrl.length !== 0);
    }
    initial(manager, node) {
        this.manager = manager;
        this.node = node;
        this.wsUrl = `${this.node.options.secure ? "wss" : "ws"}://${this.node.options.host}:${this.node.options.port}/v4/websocket`;
        this.httpUrl = `${this.node.options.secure ? "https://" : "http://"}${this.node.options.host}:${this.node.options.port}/v4`;
    }
    connect() {
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        const isResume = this.manager.rainlinkOptions.options.resume;
        const ws = new RainlinkWebsocket(this.wsUrl, {
            headers: {
                Authorization: this.node.options.auth,
                "user-id": this.manager.id,
                "accept-encoding": process.isBun ? "gzip, deflate" : "br, gzip, deflate",
                "client-name": `${metadata.name}/${metadata.version}`,
                "session-id": this.sessionId !== null && isResume ? this.sessionId : "",
                "user-agent": this.manager.rainlinkOptions.options.userAgent,
                "num-shards": this.manager.shardCount,
            },
        });
        ws.on("open", () => {
            this.node.wsOpenEvent();
        });
        ws.on("message", (data) => this.wsMessageEvent(data));
        ws.on("error", (err) => this.node.wsErrorEvent(err));
        ws.on("close", (code, reason) => {
            this.node.wsCloseEvent(code, reason);
            ws.removeAllListeners();
        });
        this.wsClient = ws;
        return ws;
    }
    requester(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!this.isRegistered)
                throw new Error(`Driver ${this.id} not registered by using initial()`);
            if (options.path.includes("/sessions") && this.sessionId == null)
                throw new Error("sessionId not initalized! Please wait for nodelink get connected!");
            const url = new URL(`${this.httpUrl}${options.path}`);
            if (options.params)
                url.search = new URLSearchParams(options.params).toString();
            if (options.data) {
                options.body = JSON.stringify(options.data);
            }
            const lavalinkHeaders = Object.assign({ authorization: this.node.options.auth, "user-agent": this.manager.rainlinkOptions.options.userAgent, "accept-encoding": process.isBun ? "gzip, deflate" : "br, gzip, deflate" }, options.headers);
            options.headers = lavalinkHeaders;
            const res = yield fetch(url, options);
            if (res.status == 204) {
                this.debug(`${(_a = options.method) !== null && _a !== void 0 ? _a : "GET"} ${url.pathname + url.search} payload=${options.body ? String(options.body) : "{}"}`);
                return undefined;
            }
            if (res.status !== 200) {
                this.debug(`${(_b = options.method) !== null && _b !== void 0 ? _b : "GET"} ${url.pathname + url.search} payload=${options.body ? String(options.body) : "{}"}`);
                this.debug("Something went wrong with nodelink server. " +
                    `Status code: ${res.status}\n Headers: ${util.inspect(options.headers)}`);
                return undefined;
            }
            const preFinalData = (yield res.json());
            let finalData = preFinalData;
            if (finalData.loadType) {
                finalData = this.convertV4trackResponse(finalData);
            }
            this.debug(`${(_c = options.method) !== null && _c !== void 0 ? _c : "GET"} ${url.pathname + url.search} payload=${options.body ? String(options.body) : "{}"}`);
            return finalData;
        });
    }
    wsMessageEvent(data) {
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        const wsData = JSON.parse(data.toString());
        this.node.wsMessageEvent(wsData);
    }
    debug(logs) {
        var _a;
        if (!this.isRegistered)
            throw new Error(`Driver ${this.id} not registered by using initial()`);
        this.manager.emit(RainlinkEvents.Debug, `[Rainlink] / [Node @ ${(_a = this.node) === null || _a === void 0 ? void 0 : _a.options.name}] / [Driver] / [Nodelink2] | ${logs}`);
    }
    wsClose() {
        if (this.wsClient)
            this.wsClient.close(1006, "Self closed");
    }
    convertV4trackResponse(nl2Data) {
        if (!nl2Data)
            return {};
        switch (nl2Data.loadType) {
            case Nodelink2loadType.SHORTS: {
                nl2Data.loadType = LavalinkLoadType.TRACK;
                return nl2Data;
            }
            case Nodelink2loadType.ALBUM: {
                nl2Data.loadType = LavalinkLoadType.PLAYLIST;
                return nl2Data;
            }
            case Nodelink2loadType.ARTIST: {
                nl2Data.loadType = LavalinkLoadType.PLAYLIST;
                return nl2Data;
            }
            case Nodelink2loadType.EPISODE: {
                nl2Data.loadType = LavalinkLoadType.PLAYLIST;
                return nl2Data;
            }
            case Nodelink2loadType.STATION: {
                nl2Data.loadType = LavalinkLoadType.PLAYLIST;
                return nl2Data;
            }
            case Nodelink2loadType.PODCAST: {
                nl2Data.loadType = LavalinkLoadType.PLAYLIST;
                return nl2Data;
            }
            case Nodelink2loadType.SHOW: {
                nl2Data.loadType = LavalinkLoadType.PLAYLIST;
                return nl2Data;
            }
        }
        return nl2Data;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSession(sessionId, mode, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug("WARNING: Nodelink doesn't support resuming, set resume to true is useless");
            return;
        });
    }
    getLyric(player, language) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const options = {
                path: "/loadlyrics",
                params: {
                    encodedTrack: String((_a = player.queue.current) === null || _a === void 0 ? void 0 : _a.encoded),
                    language: language,
                },
                headers: { "content-type": "application/json" },
                method: "GET",
            };
            const data = yield player.node.driver.requester(options);
            return data;
        });
    }
    testJSON(text) {
        if (typeof text !== "string") {
            return false;
        }
        try {
            JSON.parse(text);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
