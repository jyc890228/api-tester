import React from "react";
import {CompareFail} from "../model/CompareFail";
import _ from 'underscore'

export type TestResultId = {testCaseId: number, testResultId: number, order: number}

type Group = {start: boolean, end: boolean}

interface Props {
    compareFails: CompareFail[],
    value: {
        left: any,
        right: any
    }
}

interface FailBySide {
    left: { [index: number]: Group };
    right: { [index: number]: Group };
}

const JsonDiffViewer: React.FC<Props> = (props: Props) => {
    const {compareFails, value} = props;
    const [failBySide, setFailBySide] = React.useState({left: {}, right: {}} as FailBySide);
    React.useEffect(() => {
        const nextFailBySide: FailBySide = {left: {}, right: {}};
        nextFailBySide.left = getSide(compareFails, 'left');
        nextFailBySide.right = getSide(compareFails, 'right');

        function getSide(compareFails: CompareFail[], side: 'left' | 'right') {
            return compareFails.reduce((failInfo, fail: any) => {
                if (fail[`${side}Index`]!! === fail[`${side}EndIndex`]) {
                    failInfo[fail[`${side}Index`]] = {start: true, end: true};
                } else {
                    for (let i = fail.leftIndex; i <= fail.leftEndIndex; i++) {
                        failInfo[i] = {start: false, end: false}
                    }
                    failInfo[fail[`${side}Index`]].start = true;
                    failInfo[fail[`${side}EndIndex`]].end = true;
                }
                return failInfo
            }, {} as { [index: number]: Group });
        }

        setFailBySide(nextFailBySide);
    }, [compareFails]);

    const getStyle = (side: 'left' | 'right', idx: number): React.CSSProperties => {
        const style: React.CSSProperties = {
            whiteSpace: 'pre-wrap',
            // display: 'inline-block',
            width: '47%',
            margin: 0
        };

        const fail: Group = failBySide[side][idx];
        if (!fail) {
            return style;
        }
        if (fail.start && fail.end) {
            style.backgroundColor = 'rgba(255, 99, 51, 0.4)';
        } else {
            style.backgroundColor = 'rgba(155, 99, 51, 0.4)';
        }
        return style;
    };

    const leftJson = JSON.stringify(value.left, null, 2).split('\n');
    const rightJson = JSON.stringify(value.right, null, 2).split('\n');
    const maxLength = Math.max(leftJson.length, rightJson.length);
    return <>
        {_.range(0, maxLength).map(idx => {
            return <div key={idx} style={{display: 'flex'}}>
                <pre style={getStyle('left', idx)}>{leftJson[idx]}</pre>
                <div style={{margin: 0, width: 40, textAlign: 'center'}}>{idx}</div>
                <pre style={getStyle('right', idx)}>{rightJson[idx]}</pre>
            </div>
        })}
    </>
};

export default JsonDiffViewer;
