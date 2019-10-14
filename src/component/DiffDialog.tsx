import React from "react";
import {findTestResultByTestCaseIdAndId} from "../model/TestResults";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import DiffViewerV2 from "./DiffViewerV2";

export type TestResultId = {testCaseId: number, testResultId: number, order: number}

interface Props {
    id?: TestResultId
    handleClose: () => void
}

const DiffDialog: React.FC<Props> = (props: Props) => {
    if (props.id) {
        const {testCaseId, testResultId, order} = props.id;
        const testResult = findTestResultByTestCaseIdAndId(testCaseId, testResultId);
        const testResults = testResult.data.find(row => row.order === order)!!;
        return <Dialog open={true} onClose={props.handleClose} fullScreen>
            <DialogContent>
                <div style={{display: 'flex', whiteSpace: 'pre-wrap'}}>
                    <div style={{width: '45%'}}>{testResults.left.baseUrl}{testResults.path}</div>
                    <div style={{width: '45%'}}>{testResults.right.baseUrl}{testResults.path}</div>
                </div>
                <DiffViewerV2
                    compareFails={testResults.failList}
                    value={{left: testResults.left.value, right: testResults.right.value}}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    }
    return <></>
};


export default DiffDialog;
