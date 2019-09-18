import React from "react";
import {TestResult} from "../model/TestResults";
import {Dialog, DialogContent, DialogContentText} from "@material-ui/core";
import {CompareFail} from "../model/CompareFail";

interface Props {
    open: boolean;
    handleClose: () => void
    result: TestResult;
}

const style: React.CSSProperties = {
    width: '45%',
    height: '80vh',
    display: 'inline-block',
    overflow: 'scroll',
    margin: 15
};

interface FailBySide {
    left: {[index: number]: CompareFail};
    right: {[index: number]: CompareFail};
}

const DiffViewer: React.FC<Props> = (props: Props) => {
    const {open, handleClose, result} = props;
    const [failBySide, setFailBySide] = React.useState({left: {}, right: {}} as FailBySide);
    React.useEffect(() => {
        const nextFailBySide: FailBySide = {left: {}, right: {}};
        nextFailBySide.left = props.result.failList.reduce((failByLeft, fail) => {
            failByLeft[fail.leftIndex] = fail;
            return failByLeft
        }, {} as {[index: number]: CompareFail});

        nextFailBySide.right = props.result.failList.reduce((failByRight, fail) => {
            failByRight[fail.rightIndex] = fail;
            return failByRight
        }, {} as {[index: number]: CompareFail});

        setFailBySide(nextFailBySide);
    }, [props.result.order]);

    const renderJson = (result: TestResult, side: 'left' | 'right') => {
        const style: React.CSSProperties = {whiteSpace: 'pre-wrap'};
        return JSON.stringify(result[side].value, null, 2)
            .split('\n')
            .map((str, idx) => {
                if (failBySide[side][idx]) {
                    style.color = 'rgba(255, 99, 51, 0.4)'
                } else {
                    style.color = 'none';
                }
                return <span key={idx} style={style}>{str}<br/></span>;
            });
    };

    return <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogContent>
            <DialogContentText>
                {result.failList.map((fail, idx) => <span key={idx}>{fail.path} : {fail.reason}<br/></span>)}
            </DialogContentText>
            <pre style={style}>
                    <div>{result.left.baseUrl}{result.path}</div>
                {renderJson(result, 'left')}
                </pre>
            <pre style={style}>
                    <div>{result.right.baseUrl}{result.path}</div>
                {renderJson(result, 'right')}
                </pre>
        </DialogContent>
    </Dialog>
};

export default DiffViewer;
