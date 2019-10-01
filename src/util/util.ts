const PROPERTY_PATH_SEPARATOR = ' > ';

enum ObjectType {
    NULL_OR_UNDEFINED = 'Null or Undefined', LIST = 'List', OBJECT = 'Object', PRIMITIVE = 'Primitive'
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
            default: updateTarget[propertyName] = value;
        }
    }
    return result;
}