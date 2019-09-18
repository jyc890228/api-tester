import React from "react";
import {
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
import {findTestResultsByTestCaseId, TestResult, TestResults} from "../model/TestResults";
import TestResultList from "./TestResultList";
import {findById} from "../model/TestCase";

interface Props {
    open: boolean;
    handleClose: () => void;
    testCaseId: number;
}

const TestHistoryList: React.FC<Props> = (props: Props) => {
    const testCase = findById(props.testCaseId)!!;
    const testResults = findTestResultsByTestCaseId(props.testCaseId);
    return <Dialog open={props.open} onClose={props.handleClose} maxWidth='xl'>
        <DialogTitle>{testCase.method} {testCase.path}</DialogTitle>
        <DialogContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Total Test Count</TableCell>
                        <TableCell>Success / Fail Count</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {testResults.map(result => <TestHistoryRow key={result.id} testResults={result}/>)}
                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>

        </DialogActions>
    </Dialog>
};

interface RowProps {
    testResults: TestResults
}

const TestHistoryRow: React.FC<RowProps> = (props: RowProps) => {
    const {testResults} = props;
    const [open, setOpen] = React.useState(false);
    const [filter, setFilter] = React.useState(() => (testResult: TestResult) => true);

    const handleAllOpen = () => {
        setFilter(() => () => true);
        setOpen(true);
    };

    const handelSuccessOpen = () => {
        setFilter(() => (testResult: TestResult) => testResult.success);
        setOpen(true);
    };

    const handleFailOpen = () => {
        setFilter(() => (testResult: TestResult) => !testResult.success);
        setOpen(true);
    };

    return <TableRow>
        <TestResultList open={open} handleClose={() => setOpen(false)} testResults={testResults} filter={filter}/>
        <TableCell>{testResults.id}</TableCell>
        <TableCell>{testResults.startAt}</TableCell>
        <TableCell>{testResults.result}</TableCell>
        <TableCell>
            <span onClick={handleAllOpen} style={{cursor: 'pointer'}}>{testResults.successCount + testResults.failCount}</span>
        </TableCell>
        <TableCell>
            <span onClick={handelSuccessOpen} style={{color: 'blue', cursor: 'pointer'}}>{testResults.successCount}</span>
            <span> / </span>
            <span onClick={handleFailOpen} style={{color: 'red', cursor: 'pointer'}}>{testResults.failCount}</span></TableCell>
    </TableRow>

};

export default TestHistoryList;