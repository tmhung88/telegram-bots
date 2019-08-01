import fs from "fs";
import config from "../config";
import tmdbMovieClient, { TmdbMovieClient } from "./tmdb-movie-client";
import { InlineQueryResultArticle } from "telegram-typings";



interface Genre {
    id: number;
    name: string;
}

class Video {
    id: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;

    getUrl(): string {
        switch (this.site.toLowerCase()) {
            case "youtube":
                return `https://www.youtube.com/watch?v=${this.key}`;
            default:
                return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        }
    }
}

class Movie {
    id: number;
    poster_path: string;
    release_date: string;
    runtime: number;
    title: string;
    vote_average: number;
    imdb_id: string;
    original_title: string;
    overview: string;
    genres: Genre[];

    videos?: Video[];

    toInlineArticle(): InlineQueryResultArticle {
        return {
            type: "article",
            id: this.id.toString(),
            title: `${this.title} (${this.year})`,
            input_message_content: {message_text: `Movie ${this.id} - ${this.title} details. ${this.getMostPopularTrailer().getUrl()}`},
            thumb_url: this.thumbUrl,
            description: this.overview
            };
      }
      get thumbUrl(): string {
        return `https://image.tmdb.org/t/p/w200/${this.poster_path}`;
      }
      get year(): number {
        return Number(this.release_date.substring(0, 4));
      }

    getMostPopularTrailer(): Video {
        const trailer = this.videos.find(video => video.type == "Trailer");
    
        if (trailer) {
            console.log(`Trailer ${this.title}`, trailer);
            return trailer;
        } else {
            const teaser =  this.videos.find(video => video.type == "Teaser");
            console.log(`Teaser ${this.title}`, teaser);
            return teaser;
        }
    }
}

class WatchlistRepo {
    private _file: string;
    private _tmdbMovieClient: TmdbMovieClient;
    constructor(file: string, tmdbMovieClient: TmdbMovieClient) {
        this._file = file;
        this._tmdbMovieClient = tmdbMovieClient;
    }
    getAll(): Array<Movie> {
        const rawMovies: Array<any> = JSON.parse(fs.readFileSync(this._file).toString());
        return rawMovies.map(rawMovie => {
            const movie = Object.assign(new Movie(), rawMovie);
            const rawVideos: Array<any> = movie.videos;
            movie.videos = rawVideos.map(rawVideo => Object.assign(new Video(), rawVideo));
            return movie;
        });
    }

    async add(movieId: number): Promise<void> {
        const allMovies = this.getAll();
        const isExisting = allMovies.some(existingMovie => existingMovie.id == movieId);
        if (isExisting) {
            return;
        }
        const movie = await this._tmdbMovieClient.get(movieId);
        console.log("Add movie", movie);
        allMovies.push(movie);
        this._save(allMovies);
    }

    _save(movies: Array<Movie>) {
        fs.writeFileSync(this._file, JSON.stringify(movies));
    }
}

const watchlistRepo = new WatchlistRepo(config.wathlistFile, tmdbMovieClient);
export default watchlistRepo;
export { Movie, Video, Genre };
