import React from "react";
import {TestResult} from "../model/TestResults";
import {Dialog, DialogContent} from "@material-ui/core";

interface Props {
    open: boolean;
    handleClose: () => void
    result: TestResult;
}

const style: React.CSSProperties = {
    width: '40%',
    display: 'inline-block'
};

const DiffViewer: React.FC<Props> = (props: Props) => {
    const {open, handleClose, result} = props;
    const renderJson = (data: any) => JSON.stringify(data, null, 2)
        .split('\n')
        .map((str, idx) => <div key={idx}>{str}</div>);

    return <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogContent>
            <pre style={style}>{renderJson(result.left)}</pre>
            <pre style={style}>{renderJson(result.right)}</pre>
        </DialogContent>
    </Dialog>
};

export default DiffViewer;