import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@material-ui/core";
import {deleTe, findTestResultsByTestCaseId, TestResult, TestResults} from "../model/TestResults";
import {findById} from "../model/TestCase";

interface Props {
    handleClose: () => void;
    testCaseId?: number;
    handleOpenTestResult: (testCaseId: number, testResultId: number, filter: (testResult: TestResult) => boolean) => void;
}

const TestHistoryList: React.FC<Props> = (props: Props) => {
    const testCase = props.testCaseId ? findById(props.testCaseId) : undefined;

    if (props.testCaseId && testCase) {
        const testResults = props.testCaseId ? findTestResultsByTestCaseId(props.testCaseId) : [] as TestResults[];
        const removeTestResults = (id: number) => {
            deleTe(props.testCaseId!!, id);
        };
        return <Dialog open={true} onClose={props.handleClose} maxWidth='xl'>
            <DialogTitle>{`${testCase.method} ${testCase.path}`}</DialogTitle>
            <DialogContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Result</TableCell>
                            <TableCell>Total Test Count</TableCell>
                            <TableCell>Success / Fail Count</TableCell>
                            <TableCell>Function</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {testResults.map(result => <TestHistoryRow
                            key={result.id}
                            testResults={result}
                            handleOpenTestResult={props.handleOpenTestResult}
                            removeTestResults={removeTestResults}
                        />)}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>

            </DialogActions>
        </Dialog>
    }
    return <></>
};

interface RowProps {
    testResults: TestResults
    handleOpenTestResult: (testCaseId: number, testResultId: number, filter: (testResult: TestResult) => boolean) => void;
    removeTestResults: (id: number) => void
}

const TestHistoryRow: React.FC<RowProps> = (props: RowProps) => {
    const {testResults, handleOpenTestResult} = props;
    const open = (filter: (testResult: TestResult) => boolean) => handleOpenTestResult(testResults.testCaseId, testResults.id, filter);

    return <TableRow>
        <TableCell>{testResults.id}</TableCell>
        <TableCell>{testResults.startAt}</TableCell>
        <TableCell>{testResults.result}</TableCell>
        <TableCell>
            <span onClick={() => open(() => true)} style={{cursor: 'pointer'}}>
                {testResults.successCount + testResults.failCount}
            </span>
        </TableCell>
        <TableCell>
            <span onClick={() => open((testResult: TestResult) => testResult.success)} style={{color: 'blue', cursor: 'pointer'}}>
                {testResults.successCount}
            </span>
            <span> / </span>
            <span onClick={() => open((testResult: TestResult) => !testResult.success)} style={{color: 'red', cursor: 'pointer'}}>
                {testResults.failCount}
            </span>
        </TableCell>
        <TableCell>
            <Button onClick={() => props.removeTestResults(testResults.id)}>X</Button>
        </TableCell>
    </TableRow>

};

export default TestHistoryList;