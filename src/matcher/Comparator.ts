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
    leftSource.value = sortJsonByProperty(leftSource.value);
    rightSource.value = sortJsonByProperty(rightSource.value);
    const objType = getObjectType(leftSource.value);
    if (objType === getObjectType(rightSource.value)) {
        if (objType === ObjectType.LIST || objType === ObjectType.OBJECT) {
            return compareObject(leftSource, rightSource, config);
        }

        if (leftSource.value === rightSource.value) {
            return [];
        }
        return [{path: '', leftIndex: 0, rightIndex: 0, reason: `value does not equals! ${leftSource.value} !== ${rightSource.value}`}];
    }
    const fail = {path: '', leftIndex: 0, rightIndex: 0, reason: ''};

    if ([objType, getObjectType(rightSource.value)].includes(ObjectType.NULL_OR_UNDEFINED)) {
        fail.reason = 'response data does not exist!';
    } else {
        fail.reason = `response data type not equals! ${leftSource.value.constructor.name} !== ${rightSource.value.constructor.name}`;
    }

    return [fail];
}

function compareObject(leftSource: Source, rightSource: Source, config: Config): CompareFail[] {
    let leftIndex = 1, rightIndex = 1;
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
                        leftIndex++;
                        rightIndex++;
                        if (leftValue !== rightValue) {
                            let reason = `${key} value does not equals! ${leftValue} !== ${rightValue}`;
                            if (leftValue.constructor.name !== rightValue.constructor.name) {
                                reason = `${key} value type mismatch. ${leftValue.constructor.name} !== ${rightValue.constructor.name}`
                            }
                            failList.push({path: key, leftIndex, rightIndex, reason});
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
                leftIndex++;
                rightIndex++;
                failList.push({path: key, leftIndex, rightIndex, reason: `property ${propertyName} value type mismatch. ${getObjectType(leftValue)} !== ${getObjectType(rightValue)}`});
            }
        } else {
            left.hasOwnProperty(propertyName) ? leftIndex++ : rightIndex++;

            let reason = '';
            if (getObjectType(left) === ObjectType.LIST || getObjectType(right) === ObjectType.LIST) {
                reason = `${key} does not exist!`;
            } else if (config.strict || getObjectType(left[propertyName] || right[propertyName]) !== ObjectType.NULL_OR_UNDEFINED) {
                reason = `${key} does not exist!`;
            }

            if (reason) {
                failList.push({path: key, leftIndex, rightIndex, reason});
            }
        }
    }
    return failList;
}

export function sortJsonByProperty(json: any) {
    const objectType = getObjectType(json);
    if (objectType === ObjectType.NULL_OR_UNDEFINED || objectType === ObjectType.PRIMITIVE) {
        return;
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