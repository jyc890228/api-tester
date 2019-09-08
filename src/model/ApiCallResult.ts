import {ServerRequest, ServerResponse} from "./Http";

export interface ApiCallResults {
    order: number;
    path: string;
    payload: string;
    server1Result: ApiCallResult;
    server2Result: ApiCallResult;
}

export interface ApiCallResult {
    request: ServerRequest;
    response: ServerResponse;
}