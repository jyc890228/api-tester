import {PropertyValidationResult} from "./PropertyValidationResult";
import persistentContext from "../util/PersistentContext";

export interface TestResult {
    order: number;
    success: boolean;
    path: string;
    payload: string;
    propertyValidateResults: PropertyValidationResult[];
}

export interface TestResults {
    testCaseId: number;
    id: number;
    startAt?: Date;
    data: TestResult[];
    result: 'success' | 'fail' | 'progress'
}

type persistentStructure = {
    idSequence: number;
    byTestCaseId: {[testCaseId: number]: TestResults[]}
};

const key = '/resources/testResult.json';

export const findAll = (): persistentStructure => persistentContext.load(key) || {idSequence: 0, byTestCaseId: {}} as persistentStructure;

export const findTestResultsByTestCaseId = (testCaseId: number): TestResults[] => {
    return findAll().byTestCaseId[testCaseId] || []
};

export const findTestResultByTestCaseIdAndId = (testCaseId: number, id: number): TestResults => {
    return findTestResultsByTestCaseId(testCaseId).find(testCase => testCase.id === id)!!
};

export const save = (testResults: TestResults) => {
    const data = findAll();
    if (!data.byTestCaseId[testResults.testCaseId])
        data.byTestCaseId[testResults.testCaseId] = [];

    testResults.id = generateId(data);
    data.byTestCaseId[testResults.testCaseId].push(testResults);
    persistentContext.save(key, data);
};

export const appendTestResult = (testCaseId: number, id: number, testResult: TestResult) => {
    const testCases = findTestResultByTestCaseIdAndId(testCaseId, id);
    testCases.data.push(testResult);
    update(testCases);
};

export const update = (testResults: TestResults) => {
    const data = findAll();
    const index = data.byTestCaseId[testResults.testCaseId].findIndex(record => record.id === testResults.id);
    data.byTestCaseId[testResults.testCaseId][index] = testResults;
    persistentContext.save(key, data);
};

const generateId = (data: persistentStructure): number => {
    if (data.idSequence) {
        return data.idSequence += 1;
    }

    let id = 0;
    Object.values(data.byTestCaseId).forEach(histories => histories.forEach(history => {
        id = Math.max(id, history.id);
    }));

    data.idSequence = id + 1;
    return data.idSequence;
};