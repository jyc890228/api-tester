import _ from 'underscore';

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

export function compare(leftSource: Source, rightSource: Source, config: Config): any[] {
    let leftIndex = 0, rightIndex = 0;
    let left = {root: leftSource.value} as any;
    let right = {root: rightSource.value} as any;
    let keys = ['root'];
    const failList = [];
    while (keys.length) {
        let key = keys.shift();
        if (key) {
            let paths = [];
            let propertyName = key;
            let index = -1;
            if (propertyName.includes(PROPERTY_PATH_SEPARATOR)) {
                let fullPaths = propertyName.split(PROPERTY_PATH_SEPARATOR);
                paths = fullPaths.splice(0, fullPaths.length - 1).reduce((paths: string[], path: string) => {
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
                    leftValue = leftValue[index];
                    rightValue = rightValue[index];
                }
                const failReason = valueTypeMatcher.match(propertyName, leftValue, rightValue);
                if (failReason) {
                    leftIndex++;
                    rightIndex++;
                    failList.push({path: key, leftIndex, rightIndex, reason: failReason});
                } else {
                    switch (getObjectType(leftValue)) {
                        case ObjectType.NULL_OR_UNDEFINED:
                        case ObjectType.PRIMITIVE:
                            leftIndex++;
                            rightIndex++;
                            const failReason = valueMatcher.match(propertyName, leftValue, rightValue);
                            if (failReason) {
                                failList.push({path: key, leftIndex, rightIndex, reason: failReason});
                            }
                            break;
                        case ObjectType.LIST: {
                            const maxLength = leftValue.length < rightValue.length ? rightValue.length : leftValue.length;
                            keys = [...keys, ..._.range(maxLength).map(i => `${key}[${i}]`)];
                            break;
                        }
                        case ObjectType.OBJECT: {
                            const keySet = new Set([
                                ...Object.keys(leftValue).map(propertyName => `${key}${PROPERTY_PATH_SEPARATOR}${propertyName}`),
                                ...Object.keys(rightValue).map(propertyName => `${key}${PROPERTY_PATH_SEPARATOR}${propertyName}`)
                            ]);
                            keys = [...keys, ...Array.from(keySet)];
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

interface Matcher {
    match: (propertyName: string, left: any, right: any) => string;
}

export const valueTypeMatcher: Matcher = {
    match: (propertyName, left, right): string => {
        if (getObjectType(left) === getObjectType(right)) {
            return '';
        }
        return `property ${propertyName} value type mismatch. ${getObjectType(left)} !== ${getObjectType(right)}`;
    }
};

export const valueMatcher: Matcher = {
    match: (propertyName, left, right): string => {
        if (left === right) {
            return '';
        }
        if (left.constructor.name === right.constructor.name) {
            return `property ${propertyName} value type mismatch. ${left.constructor.name} !== ${right.constructor.name}`
        }
        return `property ${propertyName} value does not equals! ${left} !== ${right}`;
    }
};
