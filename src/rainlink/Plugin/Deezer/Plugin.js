var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkSearchResultType, } from "../../Interface/Manager.js";
import { RainlinkTrack } from "../../Player/RainlinkTrack.js";
import { SourceRainlinkPlugin } from "../SourceRainlinkPlugin.js";
import { RainlinkEvents, RainlinkPluginType } from "../../Interface/Constants.js";
import { fetch } from "undici";
const API_URL = "https://api.deezer.com/";
const REGEX = /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/;
const SHORT_REGEX = /^https:\/\/deezer\.page\.link\/[a-zA-Z0-9]{12}$/;
export class RainlinkPlugin extends SourceRainlinkPlugin {
    /**
     * Source identify of the plugin
     * @returns string
     */
    sourceIdentify() {
        return "dz";
    }
    /**
     * Source name of the plugin
     * @returns string
     */
    sourceName() {
        return "deezer";
    }
    /**
     * Type of the plugin
     * @returns RainlinkPluginType
     */
    type() {
        return RainlinkPluginType.SourceResolver;
    }
    /**
     * Initialize the plugin.
     */
    constructor() {
        super();
        this.methods = {
            track: this.getTrack.bind(this),
            album: this.getAlbum.bind(this),
            playlist: this.getPlaylist.bind(this),
        };
        this.manager = null;
        this._search = undefined;
    }
    /**
     * load the plugin
     * @param rainlink The rainlink class
     */
    load(manager) {
        this.manager = manager;
        this._search = manager.search.bind(manager);
        manager.search = this.search.bind(this);
    }
    /**
     * Unload the plugin
     * @param rainlink The rainlink class
     */
    unload(rainlink) {
        this.manager = rainlink;
        this.manager.search = rainlink.search.bind(rainlink);
    }
    /** Name function for getting plugin name */
    name() {
        return "rainlink-deezer";
    }
    search(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this._search(query, options);
            if (!this.directSearchChecker(query))
                return res;
            if (res.tracks.length == 0)
                return this.searchDirect(query, options);
            else
                return res;
        });
    }
    /**
     * Directly search from plugin
     * @param query URI or track name query
     * @param options search option like RainlinkSearchOptions
     * @returns RainlinkSearchResult
     */
    searchDirect(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.manager || !this._search)
                throw new Error("rainlink-deezer is not loaded yet.");
            if (!query)
                throw new Error("Query is required");
            const isUrl = /^https?:\/\//.test(query);
            if (SHORT_REGEX.test(query)) {
                const url = new URL(query);
                const res = yield fetch(url.origin + url.pathname, { method: "HEAD" });
                query = String(res.headers.get("location"));
            }
            const [, type, id] = REGEX.exec(query) || [];
            if (type in this.methods) {
                this.debug(`Start search from ${this.sourceName()} plugin`);
                try {
                    const _function = this.methods[type];
                    const result = yield _function(id, options === null || options === void 0 ? void 0 : options.requester);
                    const loadType = type === "track" ? RainlinkSearchResultType.TRACK : RainlinkSearchResultType.PLAYLIST;
                    const playlistName = (_a = result.name) !== null && _a !== void 0 ? _a : undefined;
                    const tracks = result.tracks.filter(this.filterNullOrUndefined);
                    return this.buildSearch(playlistName, tracks, loadType);
                }
                catch (e) {
                    return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
                }
            }
            else if ((options === null || options === void 0 ? void 0 : options.engine) === this.sourceName() && !isUrl) {
                const result = yield this.searchTrack(query, options === null || options === void 0 ? void 0 : options.requester);
                return this.buildSearch(undefined, result.tracks, RainlinkSearchResultType.SEARCH);
            }
            else
                return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
        });
    }
    searchTrack(query, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const req = yield fetch(`${API_URL}/search/track?q=${decodeURIComponent(query)}`);
                const data = yield req.json();
                const res = data;
                return {
                    tracks: res.data.map((track) => this.buildRainlinkTrack(track, requester)),
                };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getTrack(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield fetch(`${API_URL}/track/${id}/`);
                const data = yield request.json();
                const track = data;
                return { tracks: [this.buildRainlinkTrack(track, requester)] };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getAlbum(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield fetch(`${API_URL}/album/${id}/`);
                const data = yield request.json();
                const album = data;
                const tracks = album.tracks.data
                    .filter(this.filterNullOrUndefined)
                    .map((track) => this.buildRainlinkTrack(track, requester));
                return { tracks, name: album.title };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getPlaylist(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const request = yield fetch(`${API_URL}/playlist/${id}`);
                const data = yield request.json();
                const playlist = data;
                const tracks = playlist.tracks.data
                    .filter(this.filterNullOrUndefined)
                    .map((track) => this.buildRainlinkTrack(track, requester));
                return { tracks, name: playlist.title };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    filterNullOrUndefined(obj) {
        return obj !== undefined && obj !== null;
    }
    buildSearch(playlistName, tracks = [], type) {
        return {
            playlistName,
            tracks,
            type: type !== null && type !== void 0 ? type : RainlinkSearchResultType.SEARCH,
        };
    }
    buildRainlinkTrack(dezzerTrack, requester) {
        return new RainlinkTrack({
            encoded: "",
            info: {
                sourceName: this.sourceName(),
                identifier: dezzerTrack.id,
                isSeekable: true,
                author: dezzerTrack.artist ? dezzerTrack.artist.name : "Unknown",
                length: dezzerTrack.duration * 1000,
                isStream: false,
                position: 0,
                title: dezzerTrack.title,
                uri: `https://www.deezer.com/track/${dezzerTrack.id}`,
                artworkUrl: dezzerTrack.album ? dezzerTrack.album.cover : "",
            },
            pluginInfo: {
                name: "rainlink@deezer",
            },
        }, requester);
    }
    debug(logs) {
        this.manager
            ? this.manager.emit(RainlinkEvents.Debug, `[Rainlink Deezer Plugin]: ${logs}`)
            : true;
    }
}
