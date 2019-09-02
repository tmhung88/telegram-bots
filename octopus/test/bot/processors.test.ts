import { AddWatchListCommandHandler, UnknownCommandHandler } from "../../src/bot/processors";
import { mockCtx } from "../mock-utilities";
import { SearchResult, TmdbMovieClient } from "../../src/bot/tmdb-movie-client";
import { anyString, anything, deepEqual, instance, mock, objectContaining, reset, verify, when } from "ts-mockito";
import { InlineQueryResultArticle } from "telegram-typings";
import { Telegram } from "telegraf";

describe("[AddWatchListCommandHandler]", () => {
    const movieClient = mock(TmdbMovieClient);
    const {doHandle, handle} = new AddWatchListCommandHandler(instance(movieClient));
    beforeEach(() => {
        reset(movieClient);
    });
    describe("[doHandle()]", () => {
        it("do handle when the query starts with `wathchlist add` case-insensitive", () => {
            expect(doHandle(mockCtx({query: "Watchlist"}))).toBeFalsy();
            expect(doHandle(mockCtx({query: "Watchlist ADD"}))).toBeTruthy();
        });
    });
    describe("[handle()]", () => {
        const mockSearchResults = (inlineArticles: InlineQueryResultArticle[]): SearchResult[] => {
            return inlineArticles.map(article => {
                const result = mock(SearchResult);
                when(result.toInlineArticle()).thenReturn(article);
                return instance(result);
            });
        };
        const mockArticles = () => {
            return mock<InlineQueryResultArticle>();
        };
        it("not trigger any movie call when keyword is not inputted", () => {
            handle(mockCtx({query: "watchlist add"}));
            verify(movieClient.find(anyString())).never();
        });

        it("reply telegram when there is any result related to the given keyword", async () => {
            const inlineArticles = [mockArticles(), mockArticles(), mockArticles()];
            const searchResults = mockSearchResults(inlineArticles);
            const telegram = mock(Telegram);
            const ctx = mockCtx({id: "412", query: "watchlist add superman"}, instance(telegram));
            when(movieClient.find("superman")).thenReturn(Promise.resolve(searchResults));
            await handle(ctx);
            verify(telegram.answerInlineQuery(ctx.inlineQuery.id, deepEqual(inlineArticles), objectContaining({cache_time: 5}))).once();
        });
    });
});

describe("[ShowWatchlistCommandHandler]", () => {
    describe("[doHandle()]", () => {
    });

    describe("[handle()]", () => {
    });
});

describe("[UnknownCommandHandler]", () => {
    const handler = new UnknownCommandHandler();
    beforeAll(() => {
        jest.spyOn(console, "log");
    });
    afterAll(() => {
        jest.resetAllMocks();
    });
    describe("[doHandle()]", () => {
        it("do handle any command", () => {
            expect(handler.doHandle(mockCtx({}))).toBeTruthy();
        });
    });
    describe("[handle()]", () => {
        it("ignore the inputted command", () => {
            const query = "unknown command";
            handler.handle(mockCtx({query: query}));
            expect(console.log).toHaveBeenCalledWith(`Ignored the query [${query}]`);
        });
    });
});