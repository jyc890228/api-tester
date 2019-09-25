import _ from 'underscore';
import {CompareFail} from "../model/CompareFail";

export const PROPERTY_PATH_SEPARATOR = ' > ';

enum ObjectType {
    NULL_OR_UNDEFINED = 'Null or Undefined', LIST = 'List', OBJECT = 'Object', PRIMITIVE = 'Primitive'
}

export interface Source {
    sourceName: string;
    value: any
}

interface Config {
    strict: boolean
}

function getObjectType(obj: any): ObjectType {
    if (obj === null || obj === undefined) {
        return ObjectType.NULL_OR_UNDEFINED;
    }

    if (Array.isArray(obj)) {
        return ObjectType.LIST;
    }

    if (obj.constructor === ({}).constructor) {
        return ObjectType.OBJECT;
    }

    return ObjectType.PRIMITIVE;
}

export function compare(leftSource: Source, rightSource: Source, config: Config): CompareFail[] {
    const objType = getObjectType(leftSource.value);
    if (objType === getObjectType(rightSource.value)) {
        if (objType === ObjectType.LIST || objType === ObjectType.OBJECT) {
            return compareObject(leftSource, rightSource, config);
        }

        if (leftSource.value === rightSource.value) {
            return [];
        }
        return [{
            path: '',
            leftIndex: 0,
            leftEndIndex: 0,
            rightIndex: 0,
            rightEndIndex: 0,
            reason: `value does not equals! ${leftSource.value} !== ${rightSource.value}`
        }];
    }
    const fail: CompareFail = {path: '', leftIndex: 0, leftEndIndex: 0, rightIndex: 0, rightEndIndex: 0, reason: ''};

    if ([objType, getObjectType(rightSource.value)].includes(ObjectType.NULL_OR_UNDEFINED)) {
        fail.reason = 'response data does not exist!';
    } else {
        fail.leftEndIndex = JSON.stringify(leftSource.value, null, 2).split('\n').length - 1;
        fail.rightEndIndex = JSON.stringify(rightSource.value, null, 2).split('\n').length - 1;
        fail.reason = `response data type not equals! ${leftSource.value.constructor.name} !== ${rightSource.value.constructor.name}`;
    }

    return [fail];
}

function compareObject(leftSource: Source, rightSource: Source, config: Config): CompareFail[] {
    const leftJson = JSON.stringify(leftSource.value, null, 2).split('\n'),
        rightJson = JSON.stringify(rightSource.value, null, 2).split('\n');

    let keys = Array.from(new Set([...Object.keys(leftSource.value), ...Object.keys(rightSource.value)]));
    const failList: CompareFail[] = [];
    while (keys.length) {
        const key = keys.shift()!;
        const paths = key.split(PROPERTY_PATH_SEPARATOR);
        const propertyName = paths.pop()!;

        const left = paths.reduce((obj, path) => obj[path], leftSource.value);
        const right = paths.reduce((obj, path) => obj[path], rightSource.value);

        if (left.hasOwnProperty(propertyName) && right.hasOwnProperty(propertyName)) {
            const leftValue = left[propertyName], rightValue = right[propertyName];
            if (getObjectType(leftValue) === getObjectType(rightValue)) {
                switch (getObjectType(leftValue)) {
                    case ObjectType.NULL_OR_UNDEFINED:
                    case ObjectType.PRIMITIVE:
                        if (leftValue !== rightValue) {
                            let reason = `${key} value does not equals! ${leftValue} !== ${rightValue}`;
                            if (leftValue.constructor.name !== rightValue.constructor.name) {
                                reason = `${key} value type mismatch. ${leftValue.constructor.name} !== ${rightValue.constructor.name}`
                            }
                            const leftIndex = findIndex(propertyName, paths, leftJson);
                            const rightIndex = findIndex(propertyName, paths, rightJson);
                            failList.push({
                                path: key,
                                leftIndex: leftIndex.start,
                                leftEndIndex: leftIndex.end,
                                rightIndex: rightIndex.start,
                                rightEndIndex: rightIndex.end,
                                reason
                            });
                        }
                        break;
                    case ObjectType.LIST: {
                        const maxLength = Math.max(leftValue.length, rightValue.length);
                        keys = [..._.range(maxLength).map(index => `${key}${PROPERTY_PATH_SEPARATOR}${index}`), ...keys];
                        break;
                    }
                    case ObjectType.OBJECT: {
                        const keyMapper = (propertyName: string) => `${key}${PROPERTY_PATH_SEPARATOR}${propertyName}`;
                        const keySet = new Set([...Object.keys(leftValue).map(keyMapper), ...Object.keys(rightValue).map(keyMapper)]);
                        keys = [...Array.from(keySet), ...keys];
                        break;
                    }
                }
            } else {
                const leftIndex = findIndex(propertyName, paths, leftJson);
                const rightIndex = findIndex(propertyName, paths, rightJson);
                failList.push({
                    path: key,
                    leftIndex: leftIndex.start,
                    leftEndIndex: leftIndex.end,
                    rightIndex: rightIndex.start,
                    rightEndIndex: rightIndex.end,
                    reason: `property ${propertyName} value type mismatch. ${getObjectType(leftValue)} !== ${getObjectType(rightValue)}`
                });
            }
        } else {
            let reason = '';
            if (getObjectType(left) === ObjectType.LIST || getObjectType(right) === ObjectType.LIST) {
                reason = `${key} does not exist!`;
            } else if (config.strict || getObjectType(left[propertyName] || right[propertyName]) !== ObjectType.NULL_OR_UNDEFINED) {
                reason = `${key} does not exist!`;
            }

            if (reason) {
                const leftIndex = findIndex(propertyName, paths, leftJson);
                const rightIndex = findIndex(propertyName, paths, rightJson);
                failList.push({
                    path: key,
                    leftIndex: leftIndex.start,
                    leftEndIndex: leftIndex.end,
                    rightIndex: rightIndex.start,
                    rightEndIndex: rightIndex.end,
                    reason
                });
            }
        }
    }
    return failList;
}

function findIndex(propertyName: string, paths: string[], jsonStringList: string[]) {
    const result = [...paths, propertyName].reduce((config: any, path) => {
        if (isNumber(path)) {
            if (config.jsonList[1].trim() === ']') {
                return config;
            }
            const idx = parseInt(path);
            const padCount = config.jsonList[1].split('').reduce((whiteSpaceCount: number, char: string) => char === ' ' ? whiteSpaceCount + 1 : whiteSpaceCount, 0);
            const pad = config.jsonList[1].substring(0, padCount);
            let i = -1;
            const nextIdx = config.jsonList.slice(1, config.jsonList.length - 1).findIndex((row: string) => {
                if (row.startsWith(`${pad}{`) || row.startsWith(`${pad}[`)) {
                    i++;
                }

                return idx === i;
            }) + 1;
            const nextEndIdx = config.jsonList.slice(nextIdx).findIndex((row: string) => row.startsWith(`${pad}}`) || row.startsWith(`${pad}]`));
            const nextJsonList: string[] = config.jsonList.slice(nextIdx);
            return {jsonList: nextJsonList, idx: config.idx + nextIdx, end: config.idx + nextIdx + nextEndIdx};
        }
        const nextIdx = config.jsonList.findIndex((row: string) => row.trim().startsWith(`"${path}"`));
        const nextJsonList: string[] = config.jsonList.slice(nextIdx);
        return {jsonList: nextJsonList, idx: config.idx + nextIdx}
    }, {jsonList: jsonStringList, idx: 0});

    return {
        start: result.idx,
        end: result.end || result.idx
    }
}

function isNumber(str: string) {
    const zeroChar = '0'.codePointAt(0)!!;
    const nineChar = '9'.codePointAt(0)!!;
    for (let i = 0; i < str.length; i++) {
        const c = str[i].codePointAt(0);
        if (!c) {
            return false;
        }
        if (c < zeroChar || nineChar < c) {
            return false;
        }
    }
    return true;
}

export function sortJsonByProperty(json: any) {
    const objectType = getObjectType(json);
    if (objectType === ObjectType.NULL_OR_UNDEFINED || objectType === ObjectType.PRIMITIVE) {
        return json;
    }

    const result: any = objectType === ObjectType.LIST ? [] : {};
    let keys = Object.keys(json).sort();
    while (keys.length) {
        const key = keys.shift()!;
        const paths = key.split(PROPERTY_PATH_SEPARATOR);
        const propertyName = paths.pop()!;
        const value = paths.reduce((obj, path) => obj[path], json)[propertyName];
        const updateTarget = paths.reduce((result, path) => result[path], result);
        switch (getObjectType(value)) {
            case ObjectType.LIST: {
                keys = [
                    ...Object.keys(value).map(idx => `${key}${PROPERTY_PATH_SEPARATOR}${idx}`),
                    ...keys
                ];
                updateTarget[propertyName] = [];
                break;
            }
            case ObjectType.OBJECT: {
                keys = [
                    ...Object.keys(value).sort().map(nextPropertyName => `${key}${PROPERTY_PATH_SEPARATOR}${nextPropertyName}`),
                    ...keys
                ];
                updateTarget[propertyName] = {};
                break;
            }
            default: {
                updateTarget[propertyName] = value;
            }
        }
    }
    return result;
}