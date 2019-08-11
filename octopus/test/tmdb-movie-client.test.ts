import { SearchResult, TmdbMovieClient } from "../src/bot/tmdb-movie-client";
import { instance, objectContaining, verify, when } from "ts-mockito";
import { mockWretcherFactory, success } from "./mock-utilities";

describe("[SearchResult]", () => {
    const searchResult = (data: any): SearchResult => {
        return Object.assign(new SearchResult(), data);
    };
    describe("[first_air_date]", () => {
        it("assign to release date when it's empty", () => {
            expect(searchResult({first_air_date: "2015-01-30"}).release_date).toEqual("2015-01-30");
        });
        it("release_date takes precedence over first_air_date", () => {
            expect(searchResult({first_air_date: "2018-03-30", release_date: "2018-03-01"}).release_date).toEqual("2018-03-01");
        });
    });
    describe("[year]", () => {
        it("return year of the release date", () => {
            expect(searchResult({first_air_date: "2013-12-12"}).year).toEqual(2013);
        });
        it("return undefined when release_date is unavailable", () => {
            expect(searchResult({}).year).toBeUndefined();
        });
    });
    describe("[thumbUrl]", () => {
        it("return the absolute url of the thumbnail", () => {
            expect(searchResult({poster_path: "huge_poster.jpg"}).thumbUrl).toEqual("https://image.tmdb.org/t/p/w200/huge_poster.jpg");
        });
    });

    describe("[toInlineArticle()]", () => {
        it("return details in Telegram format", () => {
            const result = searchResult({
                id: 123,
                title: "Lion King",
                poster_path: "king.jpg",
                overview: "About a king",
                release_date: "2019-07-07"
            });
            expect(result.toInlineArticle())
                .toEqual({
                    id: "123",
                    type: "article",
                    title: "Lion King (2019)",
                    description: "About a king",
                    input_message_content: {"message_text": "Movie 123 - Lion King added"},
                    thumb_url: "https://image.tmdb.org/t/p/w200/king.jpg"
                });
        });
    });
});

describe("[TmdbMovieClient]", () => {
    const apiKey = "tmdb-api-key";
    const [factory, [movieWretcher, searchWretcher]] = mockWretcherFactory([
        "https://api.themoviedb.org/3/movie", "https://api.themoviedb.org/3/search/multi"
    ]);
    let client: TmdbMovieClient;

    beforeEach(() => {
        client = new TmdbMovieClient(apiKey, instance(factory));
    });

    describe("[constructor()]", () => {
        it("construct wretchers with correct info", () => {
            verify(factory.create("https://api.themoviedb.org/3/movie")).called();
            verify(factory.create("https://api.themoviedb.org/3/search/multi")).called();
            verify(movieWretcher.query(objectContaining({api_key: "tmdb-api-key"}))).called();
            verify(searchWretcher.query(objectContaining({api_key: apiKey, include_adult: false}))).called();
        });
    });

    describe("[find()]", () => {
        const searchResult = (mediaType: "movie" | "tv" | "actor", year: number) => {
            return {media_type: mediaType, release_date: `${year}-01-01`};
        };
        it("return movie/tv-related results ordered by year", async () => {
            const keywords = "hello world";
            const response = {results: [searchResult("movie", 2009), searchResult("actor", 2000), searchResult("tv", 2019)]};
            when(searchWretcher.query(objectContaining({page: 1, query: keywords}))).thenReturn(success(response));
            const results = await client.find(keywords);
            expect(results).toEqual([{_release_date: "2019-01-01", media_type: "tv"}, {
                _release_date: "2009-01-01",
                media_type: "movie"
            }]);
        });
    });

    describe("[get()]", () => {
        it("return movie details plus trailers", async () => {
            const movieId = 7582;
            const movieDetailResponse = {id: movieId, title: "Superman versus Batman"};
            const trailerResponse = {results: ["youtube.com/trailer1"]};
            when(movieWretcher.url(`/${movieId}`)).thenReturn(success(movieDetailResponse));
            when(movieWretcher.url(`/${movieId}/videos`)).thenReturn(success(trailerResponse));
            const movie = await client.get(movieId);
            expect(movie).toEqual({id: movieId, title: "Superman versus Batman", videos: ["youtube.com/trailer1"]});
        });
    });
});