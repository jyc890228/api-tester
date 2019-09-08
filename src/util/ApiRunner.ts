import {Param, TestCase} from "../model/TestCase";
import {RequestMethod, ServerRequest} from "../model/Http";
import {ApiCallResults} from "../model/ApiCallResult";
import {TestResults} from "../model/TestResults";

interface Listener {
    start: (intervalId: number) => void;
    each: (results: ApiCallResults) => void;
    end: () => void;
}

export const run = (data: TestCase, listener: Listener): TestResults => {
    let runningTestCount = 0;
    const intervalId = setInterval(() => {
        if (runningTestCount++ < data.testCount) {
            runTest(runningTestCount, data, listener);
        } else {
            clearInterval(intervalId);
            listener.end();
        }
    }, data.testSpeedInMilli);

    listener.start(intervalId as any);
    return {
        testCaseId: data.id,
        id: 0,
        startAt: new Date(),
        results: []
    };
};

function runTest(order: number, data: TestCase, listener: Listener) {
    const promiseList = beforeRequest(data).map(req => {
        return req.promise
            .then(res => res.json().then(data => {
                return {request: req, response: {ok: res.ok, data}}
            }))
            .catch(error => {
                return {request: req, response: {ok: false, data: error.message}}
            })
    });


    Promise.all(promiseList).then(results => listener.each({
        order: order,
        path: results[0].request.path,
        payload: results[0].request.payload,
        server1Result: results.find(result => result.request.url.startsWith(data.server1))!!,
        server2Result: results.find(result => result.request.url.startsWith(data.server2))!!,
    }));
}


function beforeRequest(data: TestCase): ServerRequest[] {
    const path = replacePathVariableIfExist(data.path, data.params);
    const requests = [createServerRequest(data.server1, path, data.method), createServerRequest(data.server2, path, data.method)];

    if (data.method === 'GET') {
        const queryString = makeQueryString(data.pathVariables, data.params);
        requests.forEach(req => {
            req.path += queryString;
            req.promise = fetch(`${req.url}${req.path}`);
        });
    } else {
        const payload = makeJsonPayload(data.params);
        requests.forEach(req => {
            req.payload = payload;
            req.promise = fetch(`${req.url}${req.path}`, {method: req.method, body: req.payload})
        });
    }

    return requests;
}

function createServerRequest(url: string, path: string, method: RequestMethod): ServerRequest {
    return {
        url: url,
        path: path,
        queryString: '',
        payload: '',
        method: method,
        promise: null!!
    }
}

export function makeQueryString(pathVariables: string[], params: Param[]): string {
    if (!params.length) {
        return '';
    }

    const queryString = params.reduce((queryString, param) => {
        if (pathVariables.includes(param.name.trim())) {
            return queryString;
        }
        return `${queryString}${param.name.trim()}=${generateValue(param.value)}&`;
    }, '?');

    return queryString.substring(0, queryString.length - 1)
}

function makeJsonPayload(params: Param[]): string {
    if (!params.length) {
        return '';
    }

    return JSON.stringify(params.reduce((jsonData: { [key: string]: any }, param, idx) => {
        jsonData[param.name] = generateValue(param.value);
        return jsonData
    }, {}))
}

function replacePathVariableIfExist(path: string, params: Param[]) {
    return path.split('/').map(p => {
        if (p.startsWith('{') && p.endsWith('}')) {
            const paramName = p.substring(1, p.length - 1);
            const param = params.find(param => param.name === paramName)!!;
            return generateValue(param.value);
        }
        return p;
    }).join('/');
}

function generateValue(value: string): string {
    if (value.includes(',')) {
        const values: string[] = value.split(',');
        value = values[random(0, values.length)];
    }

    if (value.includes('~')) {
        const [start, end] = value.split('~');
        value = random(start, end).toString();
    }

    return value.trim();
}


function random(min: any, max: any): number {
    return Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1) + parseInt(min))
}