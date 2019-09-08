export enum RequestMethod {
    GET = 'GET', POST = 'POST', PUT = 'PUT', DELETE = 'DELETE'
}

export interface ServerRequest {
    url: string;
    path: string;
    queryString: string;
    method: RequestMethod;
    payload: string;
    promise: Promise<Response>;
}

export interface ServerResponse {
    ok: boolean;
    data: any;
}
