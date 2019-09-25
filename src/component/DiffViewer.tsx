import React from "react";
import {TestResult} from "../model/TestResults";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import {CompareFail} from "../model/CompareFail";
import _ from 'underscore'

interface Props {
    open: boolean;
    handleClose: () => void
    result: TestResult;
}

interface FailBySide {
    left: { [index: number]: CompareFail };
    right: { [index: number]: CompareFail };
}

const DiffViewer: React.FC<Props> = (props: Props) => {
    const {open, handleClose, result} = props;
    const [failBySide, setFailBySide] = React.useState({left: {}, right: {}} as FailBySide);
    React.useEffect(() => {
        const nextFailBySide: FailBySide = {left: {}, right: {}};
        nextFailBySide.left = props.result.failList.reduce((failByLeft, fail) => {
            failByLeft[fail.leftIndex] = fail;
            for (let i = 0; i < fail.leftEndIndex; i++) {
                failByLeft[i] = fail
            }
            return failByLeft
        }, {} as { [index: number]: CompareFail });

        nextFailBySide.right = props.result.failList.reduce((failByRight, fail) => {
            failByRight[fail.rightIndex] = fail;
            for (let i = 0; i < fail.rightEndIndex; i++) {
                failByRight[i] = fail
            }

            return failByRight
        }, {} as { [index: number]: CompareFail });

        setFailBySide(nextFailBySide);
    }, [props.result.order]);

    const renderJson = (result: TestResult, side: 'left' | 'right') => {
        return JSON.stringify(result[side].value, null, 2)
            .split('\n')
            .map((str, idx) => {
                const style: React.CSSProperties = {
                    whiteSpace: 'pre-wrap',
                    backgroundColor: failBySide[side][idx] ? 'rgba(255, 99, 51, 0.4)' : 'none',
                    width: 'calc(100% - 40px)',
                    display: 'inline-block',
                    margin: 0
                };
                return <div key={idx} style={{width: '98%'}}>
                    <div style={{width: 40, display: 'inline-block'}}>{idx}</div>
                    <pre style={style}>{str}<br/></pre>
                </div>;
            });
    };

    const getStyle = (side: 'left' | 'right', idx: number): React.CSSProperties => {
        const style: React.CSSProperties = {
            whiteSpace: 'pre-wrap',
            display: 'inline-block',
            width: '47%',
            margin: 0
        };

        const failInfo: any = failBySide[side][idx];
        if (failInfo) {
            style.backgroundColor = 'rgba(255, 99, 51, 0.4)';
        }

        return style;
    };

    const leftJson = JSON.stringify(result.left.value, null, 2).split('\n');
    const rightJson = JSON.stringify(result.right.value, null, 2).split('\n');
    const maxLength = Math.max(leftJson.length, rightJson.length);
    return <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogContent>
            {_.range(0, maxLength).map(idx => {
                return <div key={idx}>
                    <pre style={getStyle('left', idx)}>{leftJson[idx]}</pre>
                    <div style={{margin: 0, width: 40, display: 'inline-block'}}>{idx}</div>
                    <pre style={getStyle('right', idx)}>{rightJson[idx]}</pre>
                </div>
            })}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Close</Button>
        </DialogActions>
    </Dialog>
};


export default DiffViewer;
