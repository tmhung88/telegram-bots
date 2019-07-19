
import * as restm from "typed-rest-client/RestClient";
import { Video, Movie } from "./watchlist";
import config from "../config";
import { InlineQueryResultArticle } from "telegram-typings";


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
    private _apiKey: string;
    private restClient: restm.RestClient;

    constructor(apiKey: string) {
        this._apiKey = apiKey;
        this.restClient = new restm.RestClient("tmdb-movie-client", "https://api.themoviedb.org");
    }

    async find(query: string): Promise<Array<SearchResult>> {
        const response: restm.IRestResponse<Page<SearchResult>> = await this.restClient.get<Page<SearchResult>>(`/3/search/multi?page=1&include_adult=false&api_key=${this._apiKey}&query=${query}`);
        const searchResults = response.result.results;
        // filter out movies that don't have poster
        // Display runtime, score, tv series next to title
        return searchResults.map(result => Object.assign(new SearchResult(), result))
                    .filter(result => result.media_type == "movie" || result.media_type == "tv")
                    .sort((m1, m2) => m2.year - m1.year);
    }

    async get(movieId: number): Promise<Movie> {
        const detailResponse: restm.IRestResponse<Movie> = await this.restClient.get<Movie>(`/3/movie/${movieId}?api_key=${this._apiKey}`);
        const trailerResponse: restm.IRestResponse<TrailerDetails> = await this.restClient.get<TrailerDetails>(`/3/movie/${movieId}/videos?api_key=${this._apiKey}`);
        const movieDetails = detailResponse.result;
        movieDetails.videos = trailerResponse.result.results;
        return movieDetails;
    }
}

const tmdbMovieClient = new TmdbMovieClient(config.tmdbApiKey);
export default tmdbMovieClient;
export { TmdbMovieClient };