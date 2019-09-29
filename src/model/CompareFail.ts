export interface CompareFail {
    path: string;
    leftIndex: number;
    leftEndIndex: number;
    rightIndex: number;
    rightEndIndex: number;
    reason: string;
}

export interface CompareFailV2 {
    left: {
        start: number;
        end: number;
        reason?: FailReason;
    }
    right: {
        start: number;
        end: number;
        reason?: FailReason;
    }
}

export enum FailReason {
    TYPE_MISMATCH, VALUE_MISMATCH, PROPERTY_NOT_EXIST
}