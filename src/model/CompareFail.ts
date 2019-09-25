export interface CompareFail {
    path: string;
    leftIndex: number;
    leftEndIndex?: number;
    rightIndex: number;
    rightEndIndex?: number;
    reason: string;
}