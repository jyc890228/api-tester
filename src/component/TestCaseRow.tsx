import React from "react";
import {Button, TableCell, TableRow} from "@material-ui/core";
import {TestCase} from "../model/TestCase";
import {run} from "../util/ApiRunner";
import {ApiCallResults} from "../model/ApiCallResult";
import {compare} from "../matcher/Comparator";
import {
    appendTestResult,
    findTestResultsByTestCaseId,
    save,
    TestResult,
    TestResults,
    update
} from "../model/TestResults";
import TestResultList from "./TestResultList";
import TestHistoryList from "./TestHistoryList";

interface Props {
    data: TestCase;
    editTestCase: (id?: number) => void;
}

const TestCaseRow: React.FC<Props> = (props: Props) => {
    const [open, setOpen] = React.useState(false);
    const [openHistory, setOpenHistory] = React.useState(false);
    const [successCount, setSuccessCount] = React.useState(0);
    const [failCount, setFailCount] = React.useState(0);
    const [running, setRunning] = React.useState(false);
    const [latestTest, setLatestTest] = React.useState({
        testCaseId: props.data.id,
        id: 0,
        data: [],
        result: 'progress'
    } as TestResults);

    React.useEffect(() => {
        const testResults = findTestResultsByTestCaseId(props.data.id);
        if (testResults.length) {
            const latestTestResult = testResults.sort((r1, r2) => r1.id < r2.id ? 1 : 0)[testResults.length - 1];
            setSuccessCount(latestTestResult.data.filter(r => r.success).length);
            setFailCount(latestTestResult.data.filter(r => !r.success).length);
            setLatestTest(latestTestResult);
        }
    }, [props.data.id]);

    const handleStartClick = () => {
        const runningTest = run(props.data, {
            start: () => {
                console.log(`test start`)
            },
            each: (apiCallResults: ApiCallResults) => updateState(assertAndPersist(apiCallResults)),
            end: () => {
                const failTest = runningTest.data.find(d => !d.success);
                runningTest.result = failTest ? 'fail' : 'success';
                update(runningTest);
                setRunning(false);
            }
        });

        save(runningTest);
        setLatestTest(runningTest);

        const assertAndPersist = (apiCallResults: ApiCallResults): TestResult => {
            let result = compare({
                sourceName: apiCallResults.server1Result.request.url,
                value: apiCallResults.server1Result.response.data
            }, {
                sourceName: apiCallResults.server2Result.request.url,
                value: apiCallResults.server2Result.response.data
            }, {strict: false});

            const testResult = {
                order: apiCallResults.order,
                path: apiCallResults.path,
                payload: apiCallResults.payload,
                success: result.length === 0,
                failList: result,
                left: apiCallResults.server1Result.response.data,
                right: apiCallResults.server2Result.response.data
            };
            appendTestResult(runningTest.testCaseId, runningTest.id, testResult);
            return testResult;
        };

        const updateState = (testResult: TestResult) => {
            runningTest.data.push(testResult);
            setLatestTest(runningTest);
            (testResult.success ? setSuccessCount : setFailCount)(count => count + 1);
        };

    };

    const handleStopClick = () => {
    };
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    return <>
        <TestHistoryList open={openHistory} handleClose={() => setOpenHistory(false)} testCaseId={props.data.id}/>
        <TestResultList open={open} handleClose={handleClose} testResults={latestTest}/>
        <TableRow>
            <TableCell>{props.data.path}</TableCell>
            <TableCell>
                <span onClick={handleOpen} style={{cursor: 'pointer'}}>{props.data.testCount}</span>
                <span> : </span>
                <span onClick={handleOpen} style={{color: 'blue', cursor: 'pointer'}}>{successCount}</span>
                <span> / </span>
                <span onClick={handleOpen} style={{color: 'red', cursor: 'pointer'}}>{failCount}</span>
            </TableCell>
            <TableCell>
                {running ? <Button onClick={handleStopClick}>Stop</Button> :
                    <Button onClick={handleStartClick}>Start</Button>}
                <Button onClick={() => props.editTestCase(props.data.id)}>Edit</Button>
                <Button onClick={() => setOpenHistory(true)}>History</Button>
            </TableCell>
        </TableRow>
    </>
};

export default TestCaseRow;