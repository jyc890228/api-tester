import {createValidateResult, PropertyValidationResult} from "../model/PropertyValidationResult";
import {TestResult} from "../model/TestResults";
import {ApiCallResults} from "../model/ApiCallResult";

interface Json {
    [key: string]: any
}

export const assertResponse = (apiCallResults: ApiCallResults): TestResult => {
    const {order, path, payload, server1Result, server2Result} = apiCallResults;

    const testResult: TestResult = {
        order,
        path,
        payload,
        success: true,
        propertyValidateResults: []
    };


    if (!server1Result.response.ok || !server2Result.response.ok) {
        testResult.propertyValidateResults.push(createValidateResult([], '', server1Result.response.data, server2Result.response.data, 'fail'));
        testResult.success = false;
        return testResult;
    }

    assertJson([], server1Result.response.data, server2Result.response.data, result => {
        if (result.result === 'fail') {
            testResult.success = false;
        }

        testResult.propertyValidateResults.push(result);
    });

    return testResult;
};

function assertJson(parent: string[], json1: Json, json2: Json, callback: (result: PropertyValidationResult) => void) {
    const keys = new Set([...Object.keys(json2), ...Object.keys(json1)]).values();
    let iter = keys.next();
    while (!iter.done) {
        const key = iter.value;
        assertProperty(parent, key, json1, json2, callback);
        iter = keys.next();
    }
}

function assertProperty(parent: string[], name: string, json1: Json, json2: Json, callback: (result: PropertyValidationResult) => void) {
    if (json1.hasOwnProperty(name) && json2.hasOwnProperty(name)) {
        assertValue(parent, name, json1[name], json2[name], callback);
    } else if (json1.hasOwnProperty(name)) {
        const value = json1[name];
        if (value === null || value === undefined) {
            callback(createValidateResult(parent, name, json1[name], undefined, 'success'));
        } else {
            callback(createValidateResult(parent, name, json1[name], undefined, 'fail'));
        }
    } else if (json2.hasOwnProperty(name)) {
        const value = json2[name];
        if (value === null || value === undefined) {
            callback(createValidateResult(parent, name, undefined, json2[name], 'success'));
        } else {
            callback(createValidateResult(parent, name, undefined, json2[name], 'fail'));
        }
    }

}

function assertValue(parent: string[], name: string, value1: any, value2: any, callback: (result: PropertyValidationResult) => void) {
    if (Array.isArray(value1) && Array.isArray(value2)) {
        const maxLength = Math.max(value1.length, value2.length);
        for (let i = 0; i < maxLength; i++) {
            const next1 = i < value1.length ? value1[i] : null;
            const next2 = i < value2.length ? value2[i] : null;
            const key = `${name}[${i}]`;

            if (typeof next1 === 'object' && typeof next2 === 'object') {
                parent.push(key);
                assertJson(parent, next1, next2, callback);
                parent.pop();
            } else if (value1 === value2) {
                callback(createValidateResult(parent, key, value1, value2, 'success'));
            } else {
                callback(createValidateResult(parent, key, value1, value2, 'fail'));
            }
        }
    } else if (value1 === null && value2 === null) {
        callback(createValidateResult(parent, name, null, null,'success'));
    } else if (typeof value1 === 'object' && typeof value2 === 'object') {
        parent.push(name);
        assertJson(parent, value1, value2, callback);
        parent.pop();
    } else if (value1 === value2) {
        callback(createValidateResult(parent, name, value1, value2,'success'));
    } else {
        callback(createValidateResult(parent, name, value1, value2, 'fail'));
    }
}
