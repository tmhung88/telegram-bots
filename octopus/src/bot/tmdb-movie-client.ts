import { Movie, Video } from "./watchlist";
import config from "../config";
import { InlineQueryResultArticle } from "telegram-typings";

import * as formData from "form-data";
import { URLSearchParams } from "url";
import nodeFetch from "node-fetch";
import wretch, { Wretcher } from "wretch";
import { WretcherFactory, wretcherFactory } from "../wretcher-factory";

wretch().polyfills({
    fetch: nodeFetch,
    FormData: formData,
    URLSearchParams,
});


interface TrailerDetails {
    id: number;
    results: Video[];
}


interface Page<T> {
    page: number;
    total_results: number;
    total_pages: number;
    results: Array<T>;
}

class SearchResult {
    id: number;
    media_type: string;
    overview?: string;
    _release_date?: string;
    _title?: string;
    vote_average?: number;
    poster_path?: string;

    get year(): number {
        if (this.release_date) {
            return Number(this.release_date.substring(0, 4));
        } else {
            return undefined;
        }
    }

    get title(): string {
        return this._title;
    }

    get thumbUrl(): string {
        return `https://image.tmdb.org/t/p/w200/${this.poster_path}`;
    }

    set first_air_date(date: string) {
        this._release_date = date;
    }

    set release_date(date: string) {
        this._release_date = date;
    }

    get release_date(): string {
        return this._release_date;
    }

    set title(title: string) {
        this._title = title;
    }

    set name(name: string) {
        this._title = name;
    }

    public toInlineArticle(): InlineQueryResultArticle {
        return {
            type: "article",
            id: this.id.toString(),
            title: `${this.title} (${this.year})`,
            input_message_content: {message_text: `Movie ${this.id} - ${this.title} added`},
            thumb_url: this.thumbUrl,
            description: this.overview
        };
    }
}

class TmdbMovieClient {
    static v3Api = {
        movie: "https://api.themoviedb.org/3/movie",
        search: "https://api.themoviedb.org/3/search/multi"
    };
    apiKey: string;
    movieClient: Wretcher;
    searchClient: Wretcher;

    constructor(apiKey: string, wretcherFactory: WretcherFactory) {
        this.apiKey = apiKey;
        this.movieClient = wretcherFactory.create(TmdbMovieClient.v3Api.movie).query({api_key: apiKey});
        this.searchClient = wretcherFactory.create(TmdbMovieClient.v3Api.search)
            .query({api_key: apiKey, include_adult: false});
    }

    async find(query: string): Promise<SearchResult[]> {
        const response = await this.searchClient.query({page: 1, query: query}).get().json();
        const searchResults: SearchResult[] = response.results;
        return searchResults.map(result => Object.assign(new SearchResult(), result))
            .filter(result => result.media_type == "movie" || result.media_type == "tv")
            .sort((m1, m2) => m2.year - m1.year);
    }

    async get(movieId: number): Promise<Movie> {
        const detailResponse: Movie = await this.movieClient.url(`/${movieId}`).get().json();
        const trailerResponse: TrailerDetails = await this.movieClient.url(`/${movieId}/videos`).get().json();
        const movieDetails = detailResponse;
        movieDetails.videos = trailerResponse.results;
        return movieDetails;
    }
}

const tmdbMovieClient = new TmdbMovieClient(config.tmdbApiKey, wretcherFactory);
export default tmdbMovieClient;
export { TmdbMovieClient };