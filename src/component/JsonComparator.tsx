import React from "react";
import {Button, Dialog, DialogActions, DialogContent, TextField} from "@material-ui/core";
import {compare, sortJsonByProperty} from "../matcher/Comparator";
import DiffViewer from "./DiffViewer";
import {CompareFail} from "../model/CompareFail";

interface Props {
    open: boolean;
    handleClose: () => void;
}


const JsonComparator: React.FC<Props> = (props: Props) => {
    const [jsonString, setJsonString] = React.useState({left: {}, right: {}} as {left: string, right: string});
    const [compareResult, setCompareResult] = React.useState({left: {}, right: {}, failList: []} as {left: any, right: any, failList: CompareFail[]});
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJsonString({...jsonString, [e.target.name]: e.target.value})
    };

    const compareJson = () => {
        if (jsonString.left.length > 0 && jsonString.right.length > 0) {
            const left = sortJsonByProperty(JSON.parse(jsonString.left));
            const right = sortJsonByProperty(JSON.parse(jsonString.right));
            const result = compare(
                {sourceName: 'left', value: left},
                {sourceName: 'right', value: right},
                {strict: false});

            setCompareResult({failList: result, left, right});
        }
    };

    return <Dialog open={props.open} onClose={props.handleClose} fullScreen>
        <DialogContent>
            <div style={{display: 'flex', justifyContent: 'space-between', height: '25%'}}>
                <TextField name='left' label='left' multiline rows='10' style={{width: '47%'}} onBlur={() => compareJson()} onChange={handleChange}/>
                <TextField name='right' label='right' multiline rows='10' style={{width: '47%'}} onBlur={() => compareJson()} onChange={handleChange}/>
            </div>
            <hr/>
            <div style={{height: '70%', overflowY: 'scroll'}}>
                <DiffViewer compareFails={compareResult.failList} value={{right: compareResult.right, left: compareResult.left}}/>
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={props.handleClose}>Close</Button>
        </DialogActions>
    </Dialog>
};


export default JsonComparator;
