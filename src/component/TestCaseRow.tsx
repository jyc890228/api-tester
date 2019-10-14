import * as React from "react";
import {Button, TableCell, TableRow} from "@material-ui/core";
import {TestCase} from "../model/TestCase";
import {ApiCallHistory, Listener, Response, run} from "../util/ApiRunner";

import {findTestResultsByTestCaseId, save, TestResult, TestResults, update} from "../model/TestResults";
import {compareObject} from "../matcher/ComparatorV2";

interface Props {
    data: TestCase;
    editTestCase: (id?: number) => void;
    handleOpenHistory: (id: number) => void;
    handleOpenTestResult: (testCaseId: number, testResultId: number, filter: (testResult: TestResult) => boolean) => void;
}

interface State {
    latestTest: TestResults;
    running: boolean;
}

const defaultValue: TestResults = {
    id: 0,
    testCaseId: 0,
    successCount: 0,
    failCount: 0,
    result: 'success',
    data: []
}

export default class TestCaseRow extends React.Component<Props, State> implements Listener {

    constructor(props: Props) {
        super(props);
        this.state = {latestTest: findTestResultsByTestCaseId(props.data.id).pop() || defaultValue, running: false};
        this.handleStartClick = this.handleStartClick.bind(this);
    }


    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        return findTestResultsByTestCaseId(nextProps.data.id).pop() || defaultValue;
    }

    render() {
        const {data, editTestCase, handleOpenHistory} = this.props;
        const {latestTest, running} = this.state;

        return <TableRow>
            <TableCell>{data.method}</TableCell>
            <TableCell>{data.path}</TableCell>
            <TableCell>
                <span onClick={() => this.openTestResults(() => true)} style={{cursor: 'pointer'}}>
                    {data.testCount}
                </span>
                <span> : </span>
                <span onClick={() => this.openTestResults(testResult => testResult.success)} style={{color: 'blue', cursor: 'pointer'}}>
                    {latestTest.successCount}
                </span>
                <span> / </span>
                <span onClick={() => this.openTestResults(testResult => !testResult.success)} style={{color: 'red', cursor: 'pointer'}}>
                    {latestTest.failCount}
                </span>
            </TableCell>
            <TableCell>
                {running ? <Button onClick={this.handleStopClick}>Stop</Button> :
                    <Button onClick={this.handleStartClick}>Start</Button>}
                <Button onClick={() => editTestCase(data.id)}>Edit</Button>
                <Button onClick={() => handleOpenHistory(data.id)}>History</Button>
            </TableCell>
        </TableRow>;
    }

    handleStartClick = () => run(this.props.data, this);

    handleStopClick() {

    }

    openTestResults(filter: (testResult: TestResult) => boolean) {
        const {latestTest} = this.state;
        this.props.handleOpenTestResult(latestTest.testCaseId, latestTest.id, filter);
    }

    start(history: ApiCallHistory) {
        this.setState({
            latestTest: save({
                id: 0,
                testCaseId: this.props.data.id,
                successCount: 0,
                failCount: 0,
                result: 'progress',
                data: []
            }),
            running: true
        });
    }

    each(response: Response) {
        const {data} = this.props;
        let result = compareObject(response.left, response.right, {strict: false});

        const testResult: TestResult = {
            order: response.order,
            path: response.path,
            payload: response.payload,
            left: {baseUrl: data.left, value: response.left},
            right: {baseUrl: data.right, value: response.right},
            success: result.length === 0,
            failList: result
        };

        const {latestTest} = this.state;
        testResult.success ? latestTest.successCount += 1 : latestTest.failCount += 1;
        latestTest.data.push(testResult);
        update(latestTest);
        this.setState({latestTest, running: true})
    }

    end(history: ApiCallHistory) {
        const {latestTest} = this.state;
        latestTest.result = latestTest.failCount === 0 ? 'success' : 'fail';
        update(latestTest);
        this.setState({latestTest, running: false})
    }
}
