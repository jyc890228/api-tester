import {CompareFailV2, FailReason} from "../model/CompareFail";

export const PROPERTY_PATH_SEPARATOR = ' > ';
export const SPACE = 2;

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

enum RowType {
    ARRAY_START = 'ARRAY_START', ARRAY_END = 'ARRAY_END', OBJECT_START = 'OBJECT_START', OBJECT_END = 'OBJECT_END',
    NULL_OR_UNDEFINED = 'Null or Undefined', PRIMITIVE = 'PRIMITIVE'
}

class Row {
    public index: number;
    public padding: number;
    public rowString: string;
    public key?: string;
    public value?: string;
    public type: RowType;

    constructor(index: number, rowString: string) {
        this.index = index;
        this.rowString = rowString;
        this.padding = rowString.split('').findIndex(c => c !== ' ');
        const keyValue = rowString.split(':');
        if (keyValue.length === 2) {
            const key = keyValue[0].trim();
            this.key = key.substring(1, key.length - 1);
            this.value = keyValue[1].trim();
            if (this.value[this.value.length - 1] === ',') {
                this.value = this.value.substring(0, this.value.length - 1);
            }
        } else {
            if (rowString[rowString.length - 1] === ',') {
                rowString = rowString.substring(0, rowString.length - 1);
            }
            this.value = rowString.trim();
        }
        this.type = Row.getRowType(this.value);
    }

    static getRowType(str: string): RowType {
        switch (str.toLowerCase()) {
            case '[': return RowType.ARRAY_START;
            case ']': return RowType.ARRAY_END;
            case '{': return RowType.OBJECT_START;
            case '}': return RowType.OBJECT_END;
            case 'null':
            case 'undefined': return RowType.NULL_OR_UNDEFINED;
            default: return RowType.PRIMITIVE;
        }
    }

    equals(other: Row): boolean {
        if (this.rowString === other.rowString) {
            return true;
        }

        if (this.key === other.key && this.value === other.value && this.type === other.type) {
            return true;
        }

        if (this.key === other.key && (this.type === RowType.NULL_OR_UNDEFINED || other.type === RowType.NULL_OR_UNDEFINED)) {
            return true;
        }

        return false;
    }

    isIterableStart(): boolean {
        return this.type === RowType.ARRAY_START || this.type === RowType.OBJECT_START;
    }

    isIterableEnd(): boolean {
        return this.type === RowType.ARRAY_END || this.type === RowType.OBJECT_END;
    }

    findIterableEndIndex(rows: Row[]): number {
        const padding = this.isIterableStart() || this.isIterableEnd() ? this.padding : this.padding - SPACE;
        for (let i = this.index; i < rows.length; i++) {
            const row = rows[i];
            if (padding === row.padding && row.isIterableEnd()) {
                return i;
            }
        }
        throw Error('unexpected error');
    }
}


export function compareObject(leftSource: Source, rightSource: Source, config: Config): CompareFailV2[] {
    const leftRows = toRows(leftSource.value),
        rightRows = toRows(rightSource.value);
    const maxLength = Math.max(leftRows.length, rightRows.length);
    const fails: CompareFailV2[] = [];
    console.log('compare');
    for (let leftIndex = 0, rightIndex = 0, i = 0; i < maxLength; i++) {
        const left = leftRows[leftIndex], right = rightRows[rightIndex];
        if (left && right) {
            if (left.equals(right)) {
                leftIndex++;
                rightIndex++;
                continue;
            }

            if (left.key === right.key) {
                if (left.type === right.type) {
                    if (left.value !== right.value) {
                        fails.push({left: {start: leftIndex, end: leftIndex, reason: FailReason.VALUE_MISMATCH}, right: {start: rightIndex, end: rightIndex, reason: FailReason.VALUE_MISMATCH}});
                        leftIndex++;
                        rightIndex++;
                    } else {
                        throw Error('unexpected error');
                    }
                } else if (left.isIterableStart() || right.isIterableStart()) {
                    const compareFail: CompareFailV2 = {left: {start: leftIndex, end: leftIndex, reason: FailReason.TYPE_MISMATCH}, right: {start: rightIndex, end: rightIndex, reason: FailReason.TYPE_MISMATCH}};
                    if (left.isIterableStart()) {
                        compareFail.left.end = left.findIterableEndIndex(leftRows);
                        leftIndex = compareFail.left.end + 1;
                    }

                    if (right.isIterableStart()) {
                        compareFail.right.end = right.findIterableEndIndex(rightRows);
                        rightIndex = compareFail.right.end + 1;
                    }

                    if (left.isIterableEnd()) {
                        compareFail.left.reason = FailReason.PROPERTY_NOT_EXIST
                    }

                    if (right.isIterableEnd()) {
                        compareFail.right.reason = FailReason.PROPERTY_NOT_EXIST
                    }
                    fails.push(compareFail);
                } else if (left.isIterableEnd() || right.isIterableEnd()) {
                    const compareFail: CompareFailV2 = {left: {start: leftIndex, end: leftIndex, reason: FailReason.TYPE_MISMATCH}, right: {start: rightIndex, end: rightIndex, reason: FailReason.TYPE_MISMATCH}};
                    if (left.isIterableEnd()) {
                        compareFail.right.end = rightIndex = right.findIterableEndIndex(rightRows);
                    } else if (right.isIterableEnd()) {
                        compareFail.left.end = leftIndex = left.findIterableEndIndex(leftRows);
                    }
                    fails.push(compareFail);
                } else {
                    const compareFail: CompareFailV2 = {left: {start: leftIndex, end: leftIndex}, right: {start: rightIndex, end: rightIndex}};
                    fails.push(compareFail);
                    leftIndex++;
                    rightIndex++;
                }
            } else {
                if (left.type === RowType.NULL_OR_UNDEFINED) {
                    leftIndex++;
                    continue;
                }

                if (right.type === RowType.NULL_OR_UNDEFINED) {
                    rightIndex++;
                    continue;
                }

                const rightFound = getFailInfo(left, rightRows, rightIndex, right.findIterableEndIndex(rightRows), idx => {
                    fails.push({left: {start: leftIndex, end: leftIndex, reason: FailReason.PROPERTY_NOT_EXIST}, right: {start: rightIndex, end: idx}});
                    rightIndex = idx + 1;
                });

                const leftFound = getFailInfo(right, leftRows, leftIndex, left.findIterableEndIndex(leftRows), idx => {
                    fails.push({left: {start: leftIndex, end: idx}, right: {start: rightIndex, end: rightIndex, reason: FailReason.PROPERTY_NOT_EXIST}});
                    leftIndex = idx + 1;
                });

                if (!rightFound && !leftFound) {
                    const leftEndIndex = left.findIterableEndIndex(leftRows) - 1;
                    const rightEndIndex = right.findIterableEndIndex(rightRows) - 1;

                    fails.push({
                        left: {start: leftIndex, end: leftEndIndex, reason: FailReason.PROPERTY_NOT_EXIST},
                        right: {start: rightIndex, end: rightEndIndex, reason: FailReason.PROPERTY_NOT_EXIST}
                    });

                    leftIndex = leftEndIndex;
                    rightIndex = rightEndIndex;
                }
            }
        }

    }
    return fails;
}

function getFailInfo(target: Row, rows: Row[], startIdx: number, endIdx: number, callback: (idx: number) => void) {
    for (let j = startIdx; j < endIdx; j++) {
        if (target.key === rows[j].key) {
            callback(j - 1);
            return true;
        }
    }
    return false;
}

function toRows(json: any) {
    return JSON.stringify(json, null, SPACE).split('\n').map((row, index) => new Row(index, row));
}