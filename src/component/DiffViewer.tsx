import React from "react";
import {TestResult} from "../model/TestResults";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText} from "@material-ui/core";
import {CompareFail} from "../model/CompareFail";

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
            return failByLeft
        }, {} as { [index: number]: CompareFail });

        nextFailBySide.right = props.result.failList.reduce((failByRight, fail) => {
            failByRight[fail.rightIndex] = fail;
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

    const JsonViewer = (side: 'left' | 'right') => {
        const style: React.CSSProperties = {
            width: '47%',
            display: 'inline-block'
        };
        return <div style={style}>
            <h4 style={{margin: 5}}>{result[side].baseUrl}{result.path}</h4>
            <div style={{height: '75vh', overflowX: 'hidden', overflowY: 'auto'}}>
                {renderJson(result, 'right')}
            </div>
        </div>
    }

    return <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogContent>
            <DialogContentText style={{height: '10vh', overflowY: 'scroll'}}>
                {result.failList.map((fail, idx) => <span key={idx}>{fail.reason}<br/></span>)}
            </DialogContentText>
            {JsonViewer('left')}
            <div style={{width: '6%', height: '75vh', display: 'inline-block'}}> </div>
            {JsonViewer('right')}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Close</Button>
        </DialogActions>
    </Dialog>
};


export default DiffViewer;
