import { ContextMessageUpdate } from "telegraf";
import watchlistRepo from "./watchlist";
import tmdbMovieClient from "./tmdb-movie-client";


abstract class Command {
    ctx: ContextMessageUpdate;
    query: string;
    constructor(ctx: ContextMessageUpdate, query: string) {
        this.ctx = ctx;
        this.query = query;
    }
    abstract execute(): void;
}

class CommandFactory {
    create(ctx: ContextMessageUpdate, input: string): Command {
        return undefined;
    }
}

class WatchlistCommand extends Command {
    execute(): void {

    }
}

class InlineQueryProcessor {

    async process({ telegram, inlineQuery }: ContextMessageUpdate) {
        const query = inlineQuery.query.toLowerCase().trim();
        const hasWatchlist = query.indexOf("watchlist ") == 0;
        const hasAdd = query.indexOf("add ") == "watchlist ".length;
        const keyword = query.substring("watchlist add ".length).trim();
        console.log(`Query ${query}`);
        console.log(`hasWatchlist: ${hasWatchlist} | hasAdd: ${hasAdd} | keyword: ${keyword}`);
        if (query == "watchlist") {
            const inlineResults = watchlistRepo.getAll().map(result => result.toInlineArticle());
            telegram.answerInlineQuery(inlineQuery.id, inlineResults, { cache_time: 5 });
            return;
        }

        if (!hasWatchlist || !hasAdd || keyword.length == 0) {
            return;
        }
        const searchResults = await tmdbMovieClient.find(keyword);
        const inlineResults = searchResults.map(result => result.toInlineArticle());
        telegram.answerInlineQuery(inlineQuery.id, inlineResults, { cache_time: 5 });

    }
}


class ChosenInlineResultProcessor {
    process({ update: { chosen_inline_result } }: ContextMessageUpdate) {
        const { query, result_id } = chosen_inline_result;
        const hasWatchlist = query.indexOf("watchlist ") == 0;
        const hasAdd = query.indexOf("add ") == "watchlist ".length;
        if (!hasWatchlist || !hasAdd) {
            return;
        }
        watchlistRepo.add(Number(result_id));
    }
}

const inlineQueryProcessor = new InlineQueryProcessor();
const chosenInlineResultProcessor = new ChosenInlineResultProcessor();
export { inlineQueryProcessor, chosenInlineResultProcessor };