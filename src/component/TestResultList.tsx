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
import {TestResult, TestResults} from "../model/TestResults";
import TestResultRow from "./TestResultRow";

interface Props {
    open: boolean;
    handleClose: () => void;
    testResults: TestResults;
    filter?: (testResult: TestResult) => boolean
}

const TestResultList: React.FC<Props> = (props: Props) => {
    const [testResults, setTestResults] = React.useState([] as TestResult[]);
    React.useEffect(() => {
        setTestResults(props.filter ? props.testResults.data.filter(props.filter) : props.testResults.data);
    }, [props.testResults, props.filter]);
    return <Dialog open={props.open} onClose={props.handleClose} maxWidth='xl'>
        <DialogTitle>Title</DialogTitle>
        <DialogContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Order</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Path</TableCell>
                        <TableCell>Function</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {testResults.map(result => <TestResultRow key={result.order} result={result}/>)}
                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>

        </DialogActions>
    </Dialog>
};

export default TestResultList;