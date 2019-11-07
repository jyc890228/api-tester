import {Param, TestCase} from "../model/TestCase";
import {RequestMethod} from "../model/Http";
import axios, {AxiosError, AxiosResponse} from 'axios';
import {sortJsonByProperty} from "./util";

export interface Listener {
    start: (history: ApiCallHistory) => void;
    each: (results: Response) => void;
    end: (history: ApiCallHistory) => void;
}

export interface ApiCallHistory {
    status: 'stop' | 'progress' | 'done';
    method: RequestMethod;
    responses: Response[];
}

export interface Response {
    order: number;
    path: string;
    payload: string;
    left: any;
    right: any;
}

export const run = (data: TestCase, listener: Listener) => {
    const history: ApiCallHistory = {status: 'progress', method: data.method, responses: []};
    setTimeout(async () => {
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (let runningTestCount = 0; runningTestCount < data.testCount; runningTestCount++) {
            await callApi(runningTestCount, data).then(res => {
                history.responses.push(res);
                listener.each(res);
            });
            await wait(data.testSpeedInMilli);
        }
        listener.end(history);
    }, 0);

    listener.start(history);
};


function callApi(order: number, data: TestCase): Promise<Response> {
    const path = replacePathVariableIfExist(data.path, data.params);
    const queryString = data.method === RequestMethod.GET ? makeQueryString(data.pathVariables, data.params) : '';
    const payload = data.method === RequestMethod.GET ? {} : makePayload(data.params);

    return Promise.all([request(data.left), request(data.right)]).then(res => ({
        order: order,
        path: `${path}${queryString}`,
        payload: payload,
        left: res.find(result => result[data.left])!![data.left],
        right: res.find(result => result[data.right])!![data.right]
    }));

    function request(baseUrl: string) {
        return axios.request({
            url: `${baseUrl}${path}${queryString}`,
            data: payload,
            method: data.method
        })
            .then((res: AxiosResponse) => ({[baseUrl]: sortJsonByProperty(res.data)}))
            .catch((error: AxiosError) => ({[baseUrl]: error.message}));
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

function makePayload(params: Param[]): any {
    if (!params.length) {
        return '';
    }

    return params.reduce((jsonData: { [key: string]: any }, param) => {
        jsonData[param.name] = generateValue(param.value);
        return jsonData
    }, {})
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