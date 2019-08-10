import wretch from "wretch";

class WretcherFactory {
    create = (url: string) => wretch(url);
}

const wretcherFactory = new WretcherFactory();
export { wretcherFactory, WretcherFactory };
