import React, {FormEvent} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Input, TextField} from "@material-ui/core";
import {deleteById, findById, Param, save, testCaseTemplate, update} from "../model/TestCase";
import {RequestMethod} from "../model/Http";

export const useFormOpen = () => {
    const [open, setOpen] = React.useState(false);
    const [testCaseIdForEdit, setTestCaseIdForEdit] = React.useState(0);

    const handleOpen = (testCaseIdForEdit?: number | undefined) => {
        setTestCaseIdForEdit(testCaseIdForEdit || 0);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return {
        open,
        testCaseIdForEdit,
        handleOpen,
        handleClose
    };
};

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | any>;

interface Props {
    open: boolean,
    handelClose: () => void,
    testCaseIdForEdit?: number
}

const TestCaseForm: React.FC<Props> = (props: Props) => {

    const [formData, setFormData] = React.useState(testCaseTemplate);

    React.useEffect(() => {
        const initValue = findById(props.testCaseIdForEdit!!);
        if (initValue) {
            setFormData(initValue);
        }
    }, [props.testCaseIdForEdit]);

    const updateValue = (e: ChangeEvent) => setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });

    const updateParam = (e: ChangeEvent, idx: number) => {
        const param: Param = {...formData.params[idx], [e.target.name]: e.target.value};
        setFormData({
            ...formData,
            params: [...formData.params.slice(0, idx), param, ...formData.params.slice(idx + 1)]
        })
    };

    const addParam = () => setFormData({...formData, params: [...formData.params, {name: '', value: ''}]});

    const deleteParam = (idx: number) => setFormData({
        ...formData,
        params: [...formData.params.slice(0, idx), ...formData.params.slice(idx + 1)]
    });

    const deleteTestCase = () => {
        deleteById(props.testCaseIdForEdit!!);
        props.handelClose();
    };

    const saveTestCase = (e: FormEvent) => {
        e.preventDefault();
        props.testCaseIdForEdit ? update(formData) : save(formData);
        props.handelClose();
    };

    const operation = props.testCaseIdForEdit ? 'Edit' : 'Create';
    return (
        <Dialog open={props.open} onClose={props.handelClose}>
            <form onSubmit={saveTestCase}>
                <DialogTitle>{operation} Test Case</DialogTitle>
                <DialogContent>
                    <div>
                        <TextField type='number' label='test count' name='testCount' value={formData.testCount} onChange={updateValue} required/>
                        <TextField type='number' label='test speed (millisecond)' name='testSpeedInMilli' value={formData.testSpeedInMilli} onChange={updateValue} required/>
                    </div>
                    <div style={{marginTop: 10}}>
                        <TextField type='text' label='test server A' name='server1' value={formData.server1} onChange={updateValue} required/>
                        <TextField type='text' label='test server B' name='server2' value={formData.server2} onChange={updateValue} required/>
                    </div>
                    <div style={{marginTop: 10}}>
                        <TextField name='method' value={formData.method} select onChange={updateValue} SelectProps={{native: true}} margin='normal' style={{width: 75}}>
                            {Object.keys(RequestMethod).map(method => <option key={method} value={method}>{method}</option>)}
                        </TextField>
                        <TextField type='text' label='path' name='path' value={formData.path} onChange={updateValue} required style={{width: 'calc(100% - 75px)'}}/>
                    </div>
                    <Button type='button' onClick={addParam}>Add Param</Button>
                    {formData.params.map((param: Param, idx) => <ParamRow key={idx} index={idx} param={param} update={updateParam} delete={deleteParam}/>)}
                </DialogContent>
                <DialogActions>
                    {props.testCaseIdForEdit ? <Button onClick={deleteTestCase} color='secondary'>Delete</Button> : null}
                    <Button onClick={props.handelClose}>Cancel</Button>
                    <Button type='submit' color='primary'>Save</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
};

interface ParamProps {
    param: Param;
    index: number;
    update: (e: ChangeEvent, idx: number) => void;
    delete: (idx: number) => void;
}

const ParamRow: React.FC<ParamProps> = (props: ParamProps) => <div>
    <Input name='name' value={props.param.name} onChange={e => props.update(e, props.index)} required/>
    <span> : </span>
    <Input name='value' value={props.param.value} onChange={e => props.update(e, props.index)} required/>
    <Button onClick={() => props.delete(props.index)}>X</Button>
</div>;

export default TestCaseForm;