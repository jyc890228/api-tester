import React from "react";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {findAll, TestCase} from "../model/TestCase";
import TestCaseForm, {useFormOpen} from "./TestCaseForm";
import {run} from "../util/ApiRunner";
import {ApiCallResults} from "../model/ApiCallResult";
import {assertResponse} from "../util/ResponseValidator";
import {appendTestResult, save, TestResult, TestResults} from "../model/TestResults";
import TestResultList from "./TestResultList";

const TestDashboard: React.FC = () => {
    const {handleOpen, handleClose, open, testCaseIdForEdit} = useFormOpen();

    return <>
        <Button onClick={() => handleOpen()}>Create Test</Button>
        <Table>
            <TestCaseForm open={open} handelClose={handleClose} testCaseIdForEdit={testCaseIdForEdit}/>
            <TableHead>
                <TableRow>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Function</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {findAll().map(testCase => <TestCaseRow key={testCase.id} data={testCase} editTestCase={handleOpen}/>)}
            </TableBody>
        </Table>
    </>

};

interface Props {
    data: TestCase;
    editTestCase: (id?: number) => void;
}

const TestCaseRow: React.FC<Props> = (props: Props) => {
    const [open, setOpen] = React.useState(false);
    const [successCount, setSuccessCount] = React.useState(0);
    const [failCount, setFailCount] = React.useState(0);
    const [running, setRunning] = React.useState(false);
    const [latestTest, setLatestTest] = React.useState({testCaseId: props.data.id, id: 0, results: []} as TestResults);

    const handleStartClick = () => {
        const runningTest = run(props.data, {
            start: (intervalId) => {console.log(`test start ${intervalId}`)},
            each: (apiCallResults: ApiCallResults) => updateState(assertAndPersist(apiCallResults)),
            end: () => setRunning(false)
        });

        save(runningTest);
        setLatestTest(runningTest);

        const assertAndPersist = (apiCallResults: ApiCallResults): TestResult => {
            const testResult = assertResponse(apiCallResults);
            appendTestResult(runningTest.testCaseId, runningTest.id, testResult);
            return testResult;
        };

        const updateState = (testResult: TestResult) => {
            runningTest.results.push(testResult);
            setLatestTest(runningTest);
            (testResult.success ? setSuccessCount : setFailCount)(count => count + 1);
        };

    };

    const handleStopClick = () => {};
    return <>
        <TestResultList open={open} handleClose={() => setOpen(false)} testResults={latestTest}/>
        <TableRow>
            <TableCell>{props.data.path}</TableCell>
            <TableCell>
                <span onClick={() => setOpen(true)} style={{cursor: 'pointer'}}>{props.data.testCount}</span>
                <span> : </span>
                <span onClick={() => setOpen(true)} style={{color: 'blue', cursor: 'pointer'}}>{successCount}</span>
                <span> / </span>
                <span onClick={() => setOpen(true)} style={{color: 'red', cursor: 'pointer'}}>{failCount}</span>
            </TableCell>
            <TableCell>
                {running ? <Button onClick={handleStopClick}>Stop</Button> :
                    <Button onClick={handleStartClick}>Start</Button>}
                <Button onClick={() => props.editTestCase(props.data.id)}>Edit</Button>
            </TableCell>
        </TableRow>
    </>
};

export default TestDashboard;