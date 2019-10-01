import React from "react";
import {TestResult} from "../model/TestResults";
import {Button, TableCell, TableRow} from "@material-ui/core";

interface Props {
    result: TestResult;
    handleDiffViewer: () => void
}

const TestResultRow: React.FC<Props> = (props: Props) => {
    const {result, handleDiffViewer} = props;
    return <TableRow>
        <TableCell>{result.order}</TableCell>
        <TableCell>{result.success ? 'success' : 'fail'}</TableCell>
        <TableCell>
            <div>{result.path}</div>
            {result.failList.length ? <hr/> : null}
            {/*{result.failList.slice(0, 2).map((fail, index) => <div key={index}>{fail.reason}</div>)}*/}
        </TableCell>
        <TableCell>
            {result.failList.length}
        </TableCell>
        <TableCell>
            <Button onClick={() => handleDiffViewer()}>Show Diff</Button>
            <Button>Retry</Button>
        </TableCell>
    </TableRow>
};

export default TestResultRow;