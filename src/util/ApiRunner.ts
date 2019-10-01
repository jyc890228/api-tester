import {Param, TestCase} from "../model/TestCase";
import {RequestMethod, ServerRequest} from "../model/Http";
import {ApiCallResults} from "../model/ApiCallResult";
import {TestResults} from "../model/TestResults";
import axios, {AxiosError, AxiosResponse} from 'axios';
import {sortJsonByProperty} from "./util";

interface Listener {
    start: () => void;
    each: (results: ApiCallResults) => void;
    end: () => void;
}

export const run = (data: TestCase, listener: Listener): TestResults => {
    setTimeout(async () => {
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (let runningTestCount = 0; runningTestCount < data.testCount; runningTestCount++) {
            await callApi(runningTestCount, data).then(listener.each);
            await wait(data.testSpeedInMilli);
        }
        listener.end();
    }, 0);

    listener.start();
    return {
        testCaseId: data.id,
        id: 0,
        startAt: new Date(),
        data: [],
        result: 'progress',
        successCount: 0,
        failCount: 0
    };
};


function callApi(order: number, data: TestCase) {
    const promiseList = beforeRequest(data).map(req => {
        return req.promise
            .then((res: AxiosResponse) => {
                return {request: req, response: {ok: true, data: sortJsonByProperty(res.data)}}
            })
            .catch((error: AxiosError) => {
                return {request: req, response: {ok: false, data: sortJsonByProperty(error.message)}}
            })
    });


    return Promise.all(promiseList).then(results => {
        return {
            order: order,
            path: results[0].request.path,
            payload: results[0].request.payload,
            server1Result: results.find(result => result.request.url.startsWith(data.server1))!!,
            server2Result: results.find(result => result.request.url.startsWith(data.server2))!!,
        }
    });
}


function beforeRequest(data: TestCase): ServerRequest[] {
    const path = replacePathVariableIfExist(data.path, data.params);
    const requests = [createServerRequest(data.server1, path, data.method), createServerRequest(data.server2, path, data.method)];

    if (data.method === 'GET') {
        const queryString = makeQueryString(data.pathVariables, data.params);
        requests.forEach(req => {
            req.path += queryString;
            req.promise = axios.get(`${req.url}${req.path}`);
        });
    } else {
        const payload = makeJsonPayload(data.params);

        requests.forEach(req => {
            req.payload = payload;
            req.promise = axios.request({
                url: `${req.url}${req.path}`,
                method: req.method,
                data: req.payload
            })
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
        value = values[random(0, values.length - 1)];
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