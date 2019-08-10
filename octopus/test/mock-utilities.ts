import { anything, instance, mock, when } from "ts-mockito";
import { WretcherFactory } from "../src/wretcher-factory";
import { Wretcher } from "wretch";

const mockWretcherFactory = (urls: string[]): [WretcherFactory, Wretcher[]] => {
    const factory = mock(WretcherFactory);
    const mappings = urls.map(url => {
        return {url: url, wretcher: mock(Wretcher)};
    });
    for (const {url, wretcher} of mappings) {
        const wretcherInstance = instance(wretcher);
        when(factory.create(url)).thenReturn(wretcherInstance);
        when(wretcher.query(anything())).thenReturn(wretcherInstance);
    }
    const wretchers = mappings.map(mapping => mapping.wretcher);
    return [factory, wretchers];
};


export { mockWretcherFactory };