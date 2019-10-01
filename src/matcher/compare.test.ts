import {compareObject, Source} from "./ComparatorV2";

describe('test', () => {
    let left: Source;
    let right: Source;
    beforeEach(() => {
        left = {
            sourceName: 'source 1',
            value: {}
        };
        right = {
            sourceName: 'source 2',
            value: {}
        }
    });

    afterEach(() => {
       console.log('left', JSON.stringify(left.value, null, 2));
       console.log('right', JSON.stringify(right.value, null, 2));
    });

    it('test 1', function () {
        left.value = {};
        right.value = {};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(0);
    });

    it('test 2', function () {
        left.value = {test: 'abc'};
        right.value = {test: 'abc'};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(0);
    });

    it('test 3', function () {
        left.value = {test: 'abd'};
        right.value = {test: 'abc'};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(1);
        expect(result[0].left.start).toBe(1);
        expect(result[0].left.end).toBe(1);
        expect(result[0].right.start).toBe(1);
        expect(result[0].right.end).toBe(1);
    });

    it('test 4', function () {
        left.value = {test: []};
        right.value = {test: {}};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(1);
        expect(result[0].left.start).toBe(1);
        expect(result[0].left.end).toBe(1);
        expect(result[0].right.start).toBe(1);
        expect(result[0].right.end).toBe(1);
    });

    it('test 5', function () {
        left.value = {test: 'abc', name: null};
        right.value = {test: 'abc'};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(0);
    });

    it('test 6', function () {
        left.value = {test: 'true'};
        right.value = {test: true};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(1);
    });

    it('test 7', function () {
        left.value = {test: '100'};
        right.value = {test: 100};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(1);
    });

    it('test 8', function () {
        left.value = {test: [10, 20, 30]};
        right.value = {test: [10, 15]};
        const result = compareObject(left, right, {strict: false});
        result.forEach(r => {
            console.log(r)
        });
        expect(result.length).toBe(2);
    });

    it('test 9', function () {
        left.value = {test: 100, user: {name: '장영철'}};
        right.value = {test: 100, user: {name: '장영철', age: 30}};
        const result = compareObject(left, right, {strict: false});
        expect(result.length).toBe(1);
    });

});