import React from "react";
import {Dialog, DialogContent, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {findTestResultByTestCaseIdAndId, TestResult} from "../model/TestResults";
import TestResultRow from "./TestResultRow";
import {TestResultId} from "./DiffDialog";
import {findById} from "../model/TestCase";

interface Props {
    handleClose: () => void;
    id?: {testCaseId: number, testResultsId: number};
    filter: (testResult: TestResult) => boolean;
    handleDiffViewer: (id?: TestResultId) => void

}

const TestResultList: React.FC<Props> = (props: Props) => {
    const testResults: TestResult[] = props.id ? findTestResultByTestCaseIdAndId(props.id.testCaseId, props.id.testResultsId).data : [];
    const toTestResultId = (order: number): TestResultId | undefined => {
        if (props.id) {
            return {testCaseId: props.id.testCaseId, testResultId: props.id.testResultsId, order}
        }
        return undefined;
    };

    if (props.id) {
        const testCase = findById(props.id.testCaseId)!!;
        return <Dialog open={true} onClose={props.handleClose} maxWidth='xl'>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order</TableCell>
                            <TableCell>Result</TableCell>
                            <TableCell>Path</TableCell>
                            <TableCell>Fail</TableCell>
                            <TableCell>Function</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {testResults.filter(props.filter).map(result =>
                            <TestResultRow
                                key={result.order}
                                result={result}
                                handleDiffViewer={() => props.handleDiffViewer(toTestResultId(result.order))}
                                handleRetryClick={path => {}}
                            />)}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    }

    return <></>
};

export default TestResultList;