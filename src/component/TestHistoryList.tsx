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
import {findTestResultsByTestCaseId, TestResults} from "../model/TestResults";

interface Props {
    open: boolean;
    handleClose: () => void;
    testCaseId: number;
}

const TestHistoryList: React.FC<Props> = (props: Props) => {
    const testResults = findTestResultsByTestCaseId(props.testCaseId);
    return <Dialog open={props.open} onClose={props.handleClose}>
        <DialogTitle>Title</DialogTitle>
        <DialogContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>Result</TableCell>
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
    return <TableRow>
        <TableCell>{testResults.id}</TableCell>
        <TableCell>{testResults.startAt}</TableCell>
        <TableCell>{testResults.result}</TableCell>
    </TableRow>

};

export default TestHistoryList;