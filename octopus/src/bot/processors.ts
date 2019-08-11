import { ContextMessageUpdate } from "telegraf";
import watchlistRepo from "./watchlist";
import tmdbMovieClient from "./tmdb-movie-client";


interface CommandHandler {
    doHandle(ctx: ContextMessageUpdate): boolean;

    handle(ctx: ContextMessageUpdate): Promise<void> | void;
}

class WatchlistCommandHandler implements CommandHandler {
    subCommandHandlers: CommandHandler[];

    constructor(subCommandHandlers: CommandHandler[]) {
        this.subCommandHandlers = subCommandHandlers;
    }

    doHandle = (ctx: ContextMessageUpdate): boolean => {
        const query = ctx.inlineQuery.query.toLowerCase().trim();
        return query.includes("watchlist");
    };

    handle = async (ctx: ContextMessageUpdate): Promise<void> => {
        const subCommandHandler = this.subCommandHandlers.find(handler => handler.doHandle(ctx));
        subCommandHandler.handle(ctx);
    };
}

class AddWatchListCommandHandler implements CommandHandler {
    doHandle = (ctx: ContextMessageUpdate): boolean => {
        const query = ctx.inlineQuery.query.toLowerCase().trim();
        return query.startsWith("watchlist add");
    };
    handle = async (ctx: ContextMessageUpdate): Promise<void> => {
        const {telegram, inlineQuery} = ctx;
        const query = inlineQuery.query.toLowerCase().trim();
        const keyword = query.substring("watchlist add ".length).trim();
        if (keyword.length == 0) {
            return;
        }
        const searchResults = await tmdbMovieClient.find(keyword);
        const inlineResults = searchResults.map(result => result.toInlineArticle());
        telegram.answerInlineQuery(inlineQuery.id, inlineResults, {cache_time: 5});
    };
}


class ShowWatchlistCommandHandler implements CommandHandler {
    doHandle = (ctx: ContextMessageUpdate): boolean => {
        const query = ctx.inlineQuery.query.toLowerCase().trim();
        return query === "watchlist";
    };
    handle = (ctx: ContextMessageUpdate): void => {
        const {telegram, inlineQuery} = ctx;
        const inlineResults = watchlistRepo.getAll().map(result => result.toInlineArticle());
        telegram.answerInlineQuery(inlineQuery.id, inlineResults, {cache_time: 5});
    };
}

class EmptyCommandHandler implements CommandHandler {
    doHandle = (ctx: ContextMessageUpdate): boolean => {
        return true;
    };
    handle = (ctx: ContextMessageUpdate): void | Promise<void> => {
        console.log(`Ignored the query [${ctx.inlineQuery.query}]`);
    };
}

class InlineQueryProcessor {
    commandHandlers: CommandHandler[];

    constructor(commandHandlers: CommandHandler[]) {
        this.commandHandlers = commandHandlers;
    }

    process = (ctx: ContextMessageUpdate) => {
        const handler = this.commandHandlers.find(handler => handler.doHandle);
        handler.handle(ctx);
    };
}


class ChosenInlineResultProcessor {
    process = ({update: {chosen_inline_result}}: ContextMessageUpdate) => {
        const {query, result_id} = chosen_inline_result;
        const hasWatchlist = query.indexOf("watchlist ") == 0;
        const hasAdd = query.indexOf("add ") == "watchlist ".length;
        if (!hasWatchlist || !hasAdd) {
            return;
        }
        watchlistRepo.add(Number(result_id));
    };
}

const watchlistCommandHandler = new WatchlistCommandHandler([
    new ShowWatchlistCommandHandler(),
    new AddWatchListCommandHandler(),
    new EmptyCommandHandler()]);
const inlineQueryProcessor = new InlineQueryProcessor([watchlistCommandHandler]);
const chosenInlineResultProcessor = new ChosenInlineResultProcessor();
export { inlineQueryProcessor, chosenInlineResultProcessor };