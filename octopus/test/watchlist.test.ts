import { Movie, Video } from "../src/bot/watchlist";
import { instance, mock, when } from "ts-mockito";

describe("[Video]", () => {

    describe("[getUrl()]", () => {
        it("[return a youtube url when the source is youtube]", () => {
            const video = new Video();
            video.site = "youtube";
            video.key = "trailer-key";
            expect(video.url).toEqual("https://www.youtube.com/watch?v=trailer-key");
        });

        it("return the RickRoll video when the source is unknown", () => {
            const video = new Video();
            video.site = "unknown-site";
            expect(video.url).toEqual("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        });
    });
});

describe("[Movie]", () => {
    describe("[year]", () => {
        it("return the year from the release date", () => {
            const movie = new Movie();
            movie.release_date = "2019-02-02";
            expect(movie.year).toEqual(2019);
        });
    });
    describe("[thumbUrl]", () => {
        it("return the absolute url of the poster", () => {
            const movie = new Movie();
            movie.poster_path = "relative-post-path";
            expect(movie.thumbUrl).toEqual("https://image.tmdb.org/t/p/w200/relative-post-path");
        });
    });
    describe("[toInlineArticle()]", () => {
        it("return an InlineQueryResultArticle format of a movie", () => {
            const video = mock(Video);
            when(video.url).thenReturn("trailer-url");
            const movie = new Movie();
            movie.getMostPopularTrailer = () => instance(video);
            movie.id = 111;
            movie.title = "Hello World";
            movie.release_date = "2000-01-30";
            movie.poster_path = "poster-path";
            movie.overview = "Here the description";

            expect(movie.toInlineArticle()).toEqual({ "description": "Here the description", "id": "111", "input_message_content": { "message_text": "Movie 111 - Hello World details. trailer-url" }, "thumb_url": "https://image.tmdb.org/t/p/w200/poster-path", "title": "Hello World (2000)", "type": "article" });
        });
    });
    describe("[getMostPopularTrailer()]", () => {
        const trailer = (id: string) => {
            const trailer = new Video();
            trailer.type = "Trailer";
            trailer.id = id;
            return trailer;
        };
        const teaser = (id: string) => {
            const teaser = new Video();
            teaser.type = "Teaser";
            teaser.id = id;
            return teaser;
        };
        it("return the first trailer if there is any", () => {
            const movie = new Movie();
            movie.videos = [trailer("15"), trailer("22"), teaser("99")];
            expect(movie.getMostPopularTrailer()).toEqual(trailer("15"));
        });

        it("return teaser if there is no trailer", () => {
            const movie = new Movie();
            movie.videos = [teaser("44")];
            expect(movie.getMostPopularTrailer()).toEqual(teaser("44"));
        });
    });
});
