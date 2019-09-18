import {compare, sortJsonByProperty, Source} from "./Comparator";

describe('matcher', () => {
    let left: Source;
    let right: Source;
    beforeEach(() => {
        left = {
            sourceName: 'source 1',
            value: {
                pid: 10,
                name: '아이폰 5 팝니다.',
                sellerInfo: {
                    uid: 20,
                    name: '장영철',
                    phone: {
                        company: 'skt',
                        number: '010-8859-8235'
                    }
                },
                like: [10, 20, 30],
                images: [
                    {url: 'http://test.com', size: '1024mb'},
                    {url: 'http://test2.com', size: '1021mb'},
                ]
            }
        };
        right = {
            sourceName: 'source 2',
            value: {
                like: [10, 20, 40, 50],
                pid: 10,
                name: '아이폰 5 팝니다.',
                sellerInfo: {
                    uid: 20,
                    name: '장영철',
                    phone: {
                        company: 'skt',
                        number: '010-8859-8235'
                    }
                },
                images: [
                    {url: 'http://test.com', size: '1023mb'},
                    {url: 'http://test2.com', size: '1023mb'},
                    {url: 'http://test2.com', size: '1021mb'},
                    {url: 'http://test2.com', size: '1023mb'},
                    {url: 'http://test2.com', size: '1023mb'}
                ]
            }
        }
    });

    it('should ', function () {
        let anies = compare(left, right, {strict: false});
        console.log(`match fail result size : ${anies.length}`);
        anies.forEach(a => console.log(a));
    });

    it('should t', function () {
        const left = {a: 10, b: 20, c: [10, 50], d: {}};
        const right = {c: [10, 50], a: 10, d: {}, b: 20};
        console.log(left, right);
        console.log(sortJsonByProperty(left), sortJsonByProperty(right));
    });
});