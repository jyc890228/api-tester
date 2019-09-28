import React from "react";
import {findTestResultByTestCaseIdAndId} from "../model/TestResults";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import JsonDiffViewer from "./JsonDiffViewer";

export type TestResultId = {testCaseId: number, testResultId: number, order: number}

type Group = {start: boolean, end: boolean}

interface Props {
    id?: TestResultId
    handleClose: () => void
}

interface FailBySide {
    left: { [index: number]: Group };
    right: { [index: number]: Group };
}

const DiffViewer: React.FC<Props> = (props: Props) => {
    if (props.id) {
        const {testCaseId, testResultId, order} = props.id;
        const testResult = findTestResultByTestCaseIdAndId(testCaseId, testResultId).data.find(row => row.order === order)!!;
        return <Dialog open={true} onClose={props.handleClose} fullScreen>
            <DialogContent>
                <JsonDiffViewer
                    compareFails={testResult.failList}
                    value={{left: testResult.left.value, right: testResult.right.value}}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    }
    return <></>
};


export default DiffViewer;
