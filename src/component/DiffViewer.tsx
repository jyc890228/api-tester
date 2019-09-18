import React from "react";
import {TestResult} from "../model/TestResults";
import {Dialog, DialogContent, DialogContentText} from "@material-ui/core";

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

const DiffViewer: React.FC<Props> = (props: Props) => {
    const {open, handleClose, result} = props;
    const renderJson = (data: any) => JSON.stringify(data, null, 2)
        .split('\n')
        .map((str, idx) => <span key={idx} style={{whiteSpace: 'pre-wrap'}}>{str}<br/></span>);

    return <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogContent>
            <DialogContentText>
                {result.failList.map((fail, idx) => <span key={idx}>{fail.path.split('//').join('.')} : {fail.reason}<br/></span>)}
            </DialogContentText>
            <pre style={style}>
                    <div>{result.left.baseUrl}{result.path}</div>
                {renderJson(result.left.value)}
                </pre>
            <pre style={style}>
                    <div>{result.right.baseUrl}{result.path}</div>
                {renderJson(result.right.value)}
                </pre>
        </DialogContent>
    </Dialog>
};

export default DiffViewer;
