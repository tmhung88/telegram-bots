import { TmdbMovieClient } from "../src/bot/tmdb-movie-client";
import { instance, objectContaining, verify } from "ts-mockito";
import { mockWretcherFactory } from "./mock-utilities";

describe("[TmdbMovieClient]", () => {
    describe("[constructor()]", () => {
        const apiKey = "tmdb-api-key";
        it("construct wretchers with correct info", () => {
            const [factory, [movieWretcher, searchWretcher]] = mockWretcherFactory(["https://api.themoviedb.org/3/movie", "https://api.themoviedb.org/3/search/multi"]);
            new TmdbMovieClient(apiKey, instance(factory));
            verify(factory.create("https://api.themoviedb.org/3/movie")).once();
            verify(factory.create("https://api.themoviedb.org/3/search/multi")).once();
            verify(movieWretcher.query(objectContaining({api_key: "tmdb-api-key"}))).called();
            verify(searchWretcher.query(objectContaining({api_key: apiKey, include_adult: false}))).called();
        });
    });


    describe("[find()]", () => {
        it("return movie/tv-related results", async () => {
        });
    });
});