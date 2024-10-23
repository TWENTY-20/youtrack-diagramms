import { Host } from "./types.ts";

declare const YTApp: {
    locale: string,
    register: () => Promise<Host>,
    entity: {
        id: string,
        type: string,
    }
    me: {
        avatarUrl: string,
        id: string,
        login: string,
        name: string,
    }
};

export const host = await YTApp.register();

export default YTApp;
