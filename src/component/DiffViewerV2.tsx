import React from "react";
import {CompareFailV2, FailReason} from "../model/CompareFail";
import _ from 'underscore'

type Group = {
    start: boolean,
    end: boolean,
    reason?: FailReason.PROPERTY_NOT_EXIST
}

interface Props {
    compareFails: CompareFailV2[],
    value: {
        left: any,
        right: any
    }
}

interface FailBySide {
    left: { [index: number]: Group };
    right: { [index: number]: Group };
}

const DiffViewerV2: React.FC<Props> = (props: Props) => {
    const {compareFails, value} = props;
    const [failBySide, setFailBySide] = React.useState({left: {}, right: {}} as FailBySide);
    React.useEffect(() => {
        const nextFailBySide: FailBySide = {left: {}, right: {}};
        nextFailBySide.left = getSide(compareFails, 'left');
        nextFailBySide.right = getSide(compareFails, 'right');

        function getSide(compareFails: CompareFailV2[], side: 'left' | 'right') {
            return compareFails.reduce((failInfo, fail: any) => {
                const failSide = fail[`${side}`];
                if (failSide.start === failSide.end) {
                    failInfo[failSide.start] = {start: true, end: true, reason: failSide.reason};
                } else {
                    for (let i = failSide.start; i <= failSide.end; i++) {
                        failInfo[i] = {start: false, end: false, reason: failSide.reason}
                    }
                    failInfo[failSide.start].start = true;
                    failInfo[failSide.end].end = true;
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

        if (fail.start && fail.end && fail.reason === FailReason.PROPERTY_NOT_EXIST) {
            return style
        }

        style.backgroundColor = 'rgba(155, 99, 51, 0.4)';
        return style;
    };

    const getCenterStyle = (idx: number): React.CSSProperties => {
        const style: React.CSSProperties = {margin: 0, width: 40, textAlign: 'center'};
        if (failBySide.left[idx] && failBySide.right[idx]) {
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
                <div style={getCenterStyle(idx)}>{idx}</div>
                <pre style={getStyle('right', idx)}>{rightJson[idx]}</pre>
            </div>
        })}
    </>
};

export default DiffViewerV2;
