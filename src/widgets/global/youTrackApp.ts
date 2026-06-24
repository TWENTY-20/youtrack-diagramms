import {Host} from "../full-page/entities/types.ts";

type YouTrackApp = {
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

declare const YTApp: YouTrackApp;

const youTrackApp = YTApp;

export const host = await youTrackApp.register();

export default youTrackApp;
