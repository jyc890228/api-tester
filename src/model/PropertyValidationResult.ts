type Result = 'success' | 'fail' | 'skip';

export interface PropertyValidationResult {
    parents: string[];
    name: string;
    value1: any;
    value2: any;
    result: Result;
}

export const createValidateResult = (parents: string[], name: string, value1: any, value2: any, result: Result): PropertyValidationResult => ({
    parents,
    name,
    value1,
    value2,
    result
});