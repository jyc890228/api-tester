import React from "react";
import {TestResult} from "../model/TestResults";
import {Button, TableCell, TableRow} from "@material-ui/core";
import DiffViewer from "./DiffViewer";

interface Props {
    result: TestResult;
}

const TestResultRow: React.FC<Props> = (props: Props) => {
    const [open, setOpen] = React.useState(false);
    const {result} = props;
    return <TableRow>
        <TableCell>{result.order}</TableCell>
        <TableCell>{result.success ? 'success' : 'fail'}</TableCell>
        <TableCell>{result.path}</TableCell>
        <TableCell>
            <Button onClick={() => setOpen(true)}>Show Diff</Button>
            <Button>Retry</Button>
        </TableCell>
        <DiffViewer open={open} handleClose={() => setOpen(false)} result={result}/>
    </TableRow>
};

export default TestResultRow;