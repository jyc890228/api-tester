import React from "react";
import {TestResult} from "../model/TestResults";
import {TableCell, TableRow} from "@material-ui/core";

interface Props {
    result: TestResult;
}

const TestResultRow: React.FC<Props> = (props: Props) => {
    const {result} = props;
    return <TableRow>
        <TableCell>{result.order}</TableCell>
        <TableCell>{result.success ? 'success' : 'fail'}</TableCell>
        <TableCell>{result.path}</TableCell>
    </TableRow>

};

export default TestResultRow;