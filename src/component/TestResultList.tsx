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
import {TestResults} from "../model/TestResults";
import TestResultRow from "./TestResultRow";

interface Props {
    open: boolean;
    handleClose: () => void;
    testResults: TestResults
}

const TestResultList: React.FC<Props> = (props: Props) => {
    const {testResults} = props;
    return <Dialog open={props.open} onClose={props.handleClose}>
        <DialogTitle>Title</DialogTitle>
        <DialogContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Order</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Path</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {testResults.results.map(result => <TestResultRow key={result.order} result={result}/>)}
                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>

        </DialogActions>
    </Dialog>
};

export default TestResultList;