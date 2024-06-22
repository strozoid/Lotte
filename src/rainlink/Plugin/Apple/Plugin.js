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
const REGEX = /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/;
const REGEX_SONG_ONLY = /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)(\?|\&)([^=]+)\=([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/;
const credentials = {
    APPLE_TOKEN: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNzA5Njg5NTM4LCJleHAiOjE3MTY5NDcxMzgsInJvb3RfaHR0cHNfb3JpZ2luIjpbImFwcGxlLmNvbSJdfQ.QuL8x1Wb-EjFfRUKmaUlAX4TchI4EmeqYt1tVm2OMvM5Lbmuv45ON5qIDYOPQEPALfaElh1lh3_6g5BNToJh6A",
};
export class RainlinkPlugin extends SourceRainlinkPlugin {
    /**
     * Source identify of the plugin
     * @returns string
     */
    sourceIdentify() {
        return "am";
    }
    /**
     * Source name of the plugin
     * @returns string
     */
    sourceName() {
        return "apple";
    }
    /**
     * Type of the plugin
     * @returns RainlinkPluginType
     */
    type() {
        return RainlinkPluginType.SourceResolver;
    }
    /** Name function for getting plugin name */
    name() {
        return "rainlink-apple";
    }
    /**
     * Initialize the plugin.
     * @param appleOptions The rainlink apple plugin options
     */
    constructor(appleOptions) {
        var _a, _b, _c, _d, _e, _f;
        super();
        this.methods = {
            artist: this.getArtist.bind(this),
            album: this.getAlbum.bind(this),
            playlist: this.getPlaylist.bind(this),
            track: this.getTrack.bind(this),
        };
        this.options = appleOptions;
        this.manager = null;
        this._search = undefined;
        this.countryCode = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.countryCode) ? (_b = this.options) === null || _b === void 0 ? void 0 : _b.countryCode : "us";
        this.imageHeight = ((_c = this.options) === null || _c === void 0 ? void 0 : _c.imageHeight) ? (_d = this.options) === null || _d === void 0 ? void 0 : _d.imageHeight : 900;
        this.imageWidth = ((_e = this.options) === null || _e === void 0 ? void 0 : _e.imageWidth) ? (_f = this.options) === null || _f === void 0 ? void 0 : _f.imageWidth : 600;
        this.baseURL = "https://api.music.apple.com/v1/";
        this.fetchURL = `https://amp-api.music.apple.com/v1/catalog/${this.countryCode}`;
        this.credentials = {
            Authorization: `Bearer ${credentials.APPLE_TOKEN}`,
            origin: "https://music.apple.com",
        };
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
            let type;
            let id;
            let isTrack = false;
            if (!this.manager || !this._search)
                throw new Error("rainlink-apple is not loaded yet.");
            if (!query)
                throw new Error("Query is required");
            const isUrl = /^https?:\/\//.test(query);
            if (!REGEX_SONG_ONLY.exec(query) || REGEX_SONG_ONLY.exec(query) == null) {
                const extract = REGEX.exec(query) || [];
                id = extract[4];
                type = extract[1];
            }
            else {
                const extract = REGEX_SONG_ONLY.exec(query) || [];
                id = extract[8];
                type = extract[1];
                isTrack = true;
            }
            if (type in this.methods) {
                try {
                    this.debug(`Start search from ${this.sourceName()} plugin`);
                    let _function = this.methods[type];
                    if (isTrack)
                        _function = this.methods.track;
                    const result = yield _function(id, options === null || options === void 0 ? void 0 : options.requester);
                    const loadType = isTrack
                        ? RainlinkSearchResultType.TRACK
                        : RainlinkSearchResultType.PLAYLIST;
                    const playlistName = (_a = result.name) !== null && _a !== void 0 ? _a : undefined;
                    const tracks = result.tracks.filter(this.filterNullOrUndefined);
                    return this.buildSearch(playlistName, tracks, loadType);
                }
                catch (e) {
                    return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
                }
            }
            else if ((options === null || options === void 0 ? void 0 : options.engine) === "apple" && !isUrl) {
                const result = yield this.searchTrack(query, options === null || options === void 0 ? void 0 : options.requester);
                return this.buildSearch(undefined, result.tracks, RainlinkSearchResultType.SEARCH);
            }
            else
                return this.buildSearch(undefined, [], RainlinkSearchResultType.SEARCH);
        });
    }
    getData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = yield fetch(`${this.fetchURL}${params}`, {
                headers: this.credentials,
            });
            const res = (yield req.json());
            return res.data;
        });
    }
    searchTrack(query, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield this.getData(`/search?types=songs&term=${query.replace(/ /g, "+").toLocaleLowerCase()}`).catch((e) => {
                    throw new Error(e);
                });
                return {
                    tracks: res.results.songs.data.map((track) => this.buildRainlinkTrack(track, requester)),
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
                const track = yield this.getData(`/songs/${id}`).catch((e) => {
                    throw new Error(e);
                });
                return { tracks: [this.buildRainlinkTrack(track[0], requester)] };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getArtist(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const track = yield this.getData(`/artists/${id}/view/top-songs`).catch((e) => {
                    throw new Error(e);
                });
                return { tracks: [this.buildRainlinkTrack(track[0], requester)] };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getAlbum(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const album = yield this.getData(`/albums/${id}`).catch((e) => {
                    throw new Error(e);
                });
                const tracks = album[0].relationships.tracks.data
                    .filter(this.filterNullOrUndefined)
                    .map((track) => this.buildRainlinkTrack(track, requester));
                return { tracks, name: album[0].attributes.name };
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    getPlaylist(id, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const playlist = yield this.getData(`/playlists/${id}`).catch((e) => {
                    throw new Error(e);
                });
                const tracks = playlist[0].relationships.tracks.data
                    .filter(this.filterNullOrUndefined)
                    .map((track) => this.buildRainlinkTrack(track, requester));
                return { tracks, name: playlist[0].attributes.name };
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
    buildRainlinkTrack(appleTrack, requester) {
        const artworkURL = String(appleTrack.attributes.artwork.url)
            .replace("{w}", String(this.imageWidth))
            .replace("{h}", String(this.imageHeight));
        return new RainlinkTrack({
            encoded: "",
            info: {
                sourceName: this.sourceName(),
                identifier: appleTrack.id,
                isSeekable: true,
                author: appleTrack.attributes.artistName ? appleTrack.attributes.artistName : "Unknown",
                length: appleTrack.attributes.durationInMillis,
                isStream: false,
                position: 0,
                title: appleTrack.attributes.name,
                uri: appleTrack.attributes.url || "",
                artworkUrl: artworkURL ? artworkURL : "",
            },
            pluginInfo: {
                name: "rainlink@apple",
            },
        }, requester);
    }
    debug(logs) {
        this.manager
            ? this.manager.emit(RainlinkEvents.Debug, `[Rainlink] -> [Plugin] -> [Apple] | ${logs}`)
            : true;
    }
}
