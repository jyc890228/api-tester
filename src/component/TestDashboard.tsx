import React from "react";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {findAll} from "../model/TestCase";
import TestCaseForm, {useFormOpen} from "./TestCaseForm";
import TestCaseRow from "./TestCaseRow";

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

export default TestDashboard;