import React from "react";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {findAll} from "../model/TestCase";
import TestCaseForm, {useFormOpen} from "./TestCaseForm";
import TestCaseRow from "./TestCaseRow";
import TestHistoryList from "./TestHistoryList";
import TestResultList from "./TestResultList";
import {TestResult} from "../model/TestResults";
import DiffViewer, {TestResultId} from "./DiffViewer";
import JsonComparator from "./JsonComparator";

type TestResultModalState = {id?: {testCaseId: number, testResultsId: number}, filter: (testResults: TestResult) => boolean};

const TestDashboard: React.FC = () => {
    const {handleOpen, handleClose, open, testCaseIdForEdit} = useFormOpen();
    const [openJsonComparator, setOpenJsonComparator] = React.useState(false);
    const [diffViewerOpener, setDiffViewerOpener] = React.useState({id: undefined} as {id?: TestResultId});
    const [testResultOpener, setTestResultOpener] = React.useState({id: undefined, filter: () => true} as TestResultModalState);
    const [historyDialogOpener, setOpenHistory] = React.useState({id: undefined} as {id?: number});

    const handleOpenHistory = (id?: number) => setOpenHistory({id: id});
    const handleOpenTestResults = (testCaseId: number, testResultsId: number, filter: (testResult: TestResult) => boolean) => setTestResultOpener({id: {testCaseId, testResultsId}, filter});
    return <>
        <Button onClick={() => handleOpen()}>Create Test</Button>
        <Button onClick={() => setOpenJsonComparator(true)}>Compare Json</Button>
        <JsonComparator open={openJsonComparator} handleClose={() => setOpenJsonComparator(false)}/>
        <TestCaseForm open={open} handelClose={handleClose} testCaseIdForEdit={testCaseIdForEdit}/>
        <TestHistoryList
            testCaseId={historyDialogOpener.id}
            handleClose={() => setOpenHistory({id: undefined})}
            handleOpenTestResult={handleOpenTestResults}
        />
        <DiffViewer id={diffViewerOpener.id} handleClose={() => setDiffViewerOpener({id: undefined})}/>
        <TestResultList
            id={testResultOpener.id}
            handleClose={() => setTestResultOpener({id: undefined, filter: () => true})}
            filter={testResultOpener.filter}
            handleDiffViewer={(id?: TestResultId) => setDiffViewerOpener({id})}/>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Method</TableCell>
                    <TableCell>Path</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Function</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {findAll().map(testCase =>
                    <TestCaseRow
                        key={testCase.id}
                        data={testCase}
                        editTestCase={handleOpen}
                        handleOpenHistory={handleOpenHistory}
                        handleOpenTestResult={handleOpenTestResults}/>
                )}
            </TableBody>
        </Table>
    </>

};

export default TestDashboard;