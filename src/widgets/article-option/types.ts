import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import { AlertItem } from "@jetbrains/ring-ui-built/components/alert-service/alert-service";
import { RequestParams } from "@jetbrains/ring-ui-built/components/http/http";
import { ReactNode } from "react";

export interface HttpHandler {
    endpoints: Array<Endpoint>;
}

export type Scope = "issue" | "project" | "article" | "user" | "global";
export type Method = "GET" | "POST" | "PUT" | "DELETE";

export type EndpointForScope<scope extends Scope> =
    scope extends "issue" ? { scope: "issue"; handle: (ctx: Context<"issue">) => void; } :
        scope extends "project" ? { scope: "project"; handle: (ctx: Context<"project">) => void; } :
            scope extends "article" ? { scope: "article"; handle: (ctx: Context<"article">) => void; } :
                scope extends "user" ? { scope: "user"; handle: (ctx: Context<"user">) => void; } :
                    { scope?: undefined, handle: (ctx: Context<"global">) => void }

export type Endpoint<scope extends Scope = Scope> = {
    method: Method;
    path: string;
} & EndpointForScope<scope>

export type ContextForScope<scope extends Scope> =
    scope extends "issue" ? { issue: any } :
        scope extends "project" ? { project: any } :
            scope extends "article" ? { article: any } :
                scope extends "user" ? { user: any } : {};

export type Context<scope extends Scope> = {
    request: Request
    response: Response
} & ContextForScope<scope>

export type Request = {
    body: string;
    bodyAsStream: ReadableStream<Uint8Array>;
    headers: Array<{name: string, value: string}>;
    path: string;
    fullPath: string;
    method: Method;
    parameterNames: Array<string>;
    json(): any;
    getParameter(name: string): string | undefined;
    getParameter(name: string): Array<string>;
}

export type Response = {
    body: string;
    bodyAsStream: ReadableStream<Uint8Array>;
    code: number;
    json(object: any): void;
    text(string: string): string;
    addHeader(header: string, value: string): Response;
}

export interface Host {
    alert(message: ReactNode, type?: AlertType, timeout?: number, options?: Partial<AlertItem>): void;
    fetchYouTrack(relativeURL: string, requestParams?: RequestParams): Promise<any>;
    fetchApp(relativeURL: string, requestParams: RequestParams & { scope?: boolean }): Promise<any>;
}

export interface APIError {
    data: {
        error: string,
        error_description: string
    },
    message: string,
    status: number
}
