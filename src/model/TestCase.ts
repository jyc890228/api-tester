import persistentContext from '../util/PersistentContext'
import {RequestMethod} from "./Http";

export interface TestCase {
    id: number;
    testCount: number;
    testSpeedInMilli: number;
    server1: string;
    server2: string;
    path: string;
    method: RequestMethod;
    pathVariables: string[]
    params: Param[];
}

export const testCaseTemplate: TestCase = {
    id: 1,
    testCount: 100,
    testSpeedInMilli: 1000,
    server1: 'http://localhost:8006',
    server2: 'http://localhost:8080',
    method: RequestMethod.GET,
    path: '',
    pathVariables: [],
    params: []
};

export interface Param {
    name: string;
    // , 로 나열시 무작위 선택.
    // number ~ number 인 경우, 그 사이에서 데이터 랜덤 선택
    value: string;
}


const key = '/resources/testCase.json';

export const findAll = (): TestCase[] => persistentContext.load(key) || [];

export const findById = (id: number): TestCase | undefined => findAll().find(testCase => testCase.id === id);

export const save = (testCase: TestCase) => {
    const testCases = findAll();
    if (testCases.length) {
        testCase.id = testCases[testCases.length - 1].id + 1;
    }

    testCases.push(beforePersist(testCase));
    persistentContext.save(key, testCases);
};

export const update = (testCase: TestCase) => {
    const testCases = findAll();
    const index = testCases.findIndex(record => record.id === testCase.id);
    testCases[index] = beforePersist(testCase);
    persistentContext.save(key, testCases);
};

export const deleteById = (id: number) => {
    const testCases = findAll();
    const index = testCases.findIndex(record => record.id === id);
    persistentContext.save(key, [...testCases.slice(0, index), ...testCases.slice(index + 1)])
};

const beforePersist = (testCase: TestCase) => {
    testCase.pathVariables = testCase.path
        .split('/')
        .filter(p => p.startsWith('{') && p.endsWith('}'))
        .map(p => p.substring(1, p.length - 1));
    return testCase;
};