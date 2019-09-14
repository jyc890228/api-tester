import {compare, Source} from "./Comparator";

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
                images: [
                    {url: 'http://test.com', size: '1024mb'},
                    {url: 'http://test2.com', size: '1021mb'},
                ]
            }
        };
        right = {
            sourceName: 'source 2',
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
});