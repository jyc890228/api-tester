import {ServerRequest, ServerResponse} from "./Http";

export interface ApiCallResults {
    order: number;
    path: string;
    payload: string;
    left: ApiCallResult;
    right: ApiCallResult;
}

export interface ApiCallResult {
    request: ServerRequest;
    response: ServerResponse;
}