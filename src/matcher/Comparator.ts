import _ from 'underscore';
import {CompareFail} from "../model/CompareFail";

const PROPERTY_PATH_SEPARATOR = '//';

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
    let leftIndex = 0, rightIndex = 0;
    let left = {root: leftSource.value} as any;
    let right = {root: rightSource.value} as any;
    let keys = ['root'];
    const failList: CompareFail[] = [];
    while (keys.length) {
        let key = keys.shift();
        if (key) {
            let propertyName = key;
            let index = -1;
            if (propertyName.includes(PROPERTY_PATH_SEPARATOR)) {
                const fullPaths = propertyName.split(PROPERTY_PATH_SEPARATOR);
                const paths = fullPaths.splice(0, fullPaths.length - 1).reduce((paths: string[], path: string) => {
                    if (path.includes('[') && path.endsWith(']')) {
                        let index = parseInt(path.substring(path.indexOf('[') + 1, path.length - 1));
                        let propertyName = path.substring(0, path.indexOf('['));
                        paths.push(propertyName);
                        paths.push(index.toString());
                    } else {
                        paths.push(path);
                    }
                    return paths;
                }, []) as string[];

                propertyName = fullPaths[fullPaths.length - 1];
                if (propertyName.includes('[') && propertyName.endsWith(']')) {
                    index = parseInt(propertyName.substring(propertyName.indexOf('[') + 1, propertyName.length - 1));
                    propertyName = propertyName.substring(0, propertyName.indexOf('['));
                }

                left = paths.reduce((left, path) => left[path], {root: leftSource.value} as any);
                right = paths.reduce((right, path) => right[path], {root: rightSource.value} as any);
            }
            if (left.hasOwnProperty(propertyName) && right.hasOwnProperty(propertyName)) {
                let leftValue = left[propertyName], rightValue = right[propertyName];
                if (0 <= index) {
                    if (left[propertyName].hasOwnProperty(index) ^ right[propertyName].hasOwnProperty(index)) {
                        left[propertyName].hasOwnProperty(index) ? leftIndex++ : rightIndex++;
                        failList.push({path: key, leftIndex, rightIndex, reason: `property ${propertyName}[${index}] does not exist!`});
                        continue;
                    } else {
                        leftValue = leftValue[index];
                        rightValue = rightValue[index];
                    }
                }

                if (getObjectType(leftValue) !== getObjectType(rightValue)) {
                    leftIndex++;
                    rightIndex++;
                    failList.push({path: key, leftIndex, rightIndex, reason: `property ${propertyName} value type mismatch. ${getObjectType(leftValue)} !== ${getObjectType(rightValue)}`});
                } else {
                    switch (getObjectType(leftValue)) {
                        case ObjectType.NULL_OR_UNDEFINED:
                        case ObjectType.PRIMITIVE:
                            leftIndex++;
                            rightIndex++;
                            if (leftValue !== rightValue) {
                                let reason = `property ${propertyName} value does not equals! ${leftValue} !== ${rightValue}`;
                                if (leftValue.constructor.name !== rightValue.constructor.name) {
                                    reason = `property ${propertyName} value type mismatch. ${leftValue.constructor.name} !== ${rightValue.constructor.name}`
                                }
                                failList.push({path: key, leftIndex, rightIndex, reason});
                            }
                            break;
                        case ObjectType.LIST: {
                            const maxLength = Math.max(leftValue.length, rightValue.length);
                            keys = [..._.range(maxLength).map(i => `${key}[${i}]`), ...keys];
                            break;
                        }
                        case ObjectType.OBJECT: {
                            const keyMapper = (propertyName: string) => `${key}${PROPERTY_PATH_SEPARATOR}${propertyName}`;
                            const keySet = new Set([...Object.keys(leftValue).map(keyMapper), ...Object.keys(rightValue).map(keyMapper)]);
                            keys = [...Array.from(keySet), ...keys];
                            break;
                        }
                    }
                }
            } else {
                left.hasOwnProperty(propertyName) ? leftIndex++ : rightIndex++;
                if (config.strict) {
                    failList.push({path: key, leftIndex, rightIndex, reason: `property ${propertyName} does not exist!`});
                } else {
                    const value = left.hasOwnProperty(propertyName) ? left[propertyName] : right[propertyName];
                    if (getObjectType(value) !== ObjectType.NULL_OR_UNDEFINED) {
                        failList.push({path: key, leftIndex, rightIndex, reason: `property ${propertyName} value does not equals! ${left[propertyName]} !== ${right[propertyName]}`});
                    }
                }
            }
        }
    }

    return failList;
}
