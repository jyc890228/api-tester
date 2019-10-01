import React from "react";
import {Button, Dialog, DialogActions, DialogContent, TextField} from "@material-ui/core";
import {CompareFailV2} from "../model/CompareFail";
import DiffViewerV2 from "./DiffViewerV2";
import {compareObject} from "../matcher/ComparatorV2";
import {sortJsonByProperty} from "../util/util";

interface Props {
    open: boolean;
    handleClose: () => void;
}

const defaultIntervalInMilli = 500;

const JsonComparator: React.FC<Props> = (props: Props) => {
    const [autoCompare, setAutoCompare] = React.useState({intervalInMilli: defaultIntervalInMilli, timeoutId: undefined} as {intervalInMilli: number, timeoutId: any});
    const [jsonString, setJsonString] = React.useState({left: {}, right: {}} as {left: string, right: string});
    const [compareResult, setCompareResult] = React.useState({left: {}, right: {}, failList: []} as {left: any, right: any, failList: CompareFailV2[]});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextState = {...jsonString, [e.target.name]: e.target.value};
        setJsonString(nextState);
        const timeout = setTimeout(() => compareJson(nextState), autoCompare.intervalInMilli);
        if (autoCompare.timeoutId) {
            clearTimeout(autoCompare.timeoutId);
        }
        setAutoCompare({intervalInMilli: autoCompare.intervalInMilli, timeoutId: timeout})
    };

    const compareJson = (jsonString: {left: string, right: string}) => {
        if (jsonString.left.length > 0 && jsonString.right.length > 0) {
            const left = convertJson(jsonString.left);
            const right = convertJson(jsonString.right);
            const result = compareObject(
                {sourceName: 'left', value: left},
                {sourceName: 'right', value: right},
                {strict: false});

            setCompareResult({failList: result, left, right});
        } else {
            setCompareResult({failList: [], left: '', right: ''});
        }
    };

    const convertJson = (jsonString: string) => {
        try {
            return sortJsonByProperty(JSON.parse(jsonString));
        } catch (e) {
            return jsonString;
        }
    };

    const onClose = () => {
        if (autoCompare.timeoutId) {
            clearTimeout(autoCompare.timeoutId);
        }
        setCompareResult({failList: [], left: '', right: ''});
        props.handleClose();
    };

    const restartAutoCompare = (intervalInMilli: number) => {
        setAutoCompare({intervalInMilli, timeoutId: 0})
    };

    return <Dialog open={props.open} onClose={onClose} fullScreen>
        <DialogContent>
            <div style={{display: 'flex', justifyContent: 'space-between', height: '25%'}}>
                <TextField name='left' label='left' multiline rows='10' style={{width: '47%'}} onBlur={() => compareJson(jsonString)} onChange={handleChange}/>
                <TextField name='right' label='right' multiline rows='10' style={{width: '47%'}} onBlur={() => compareJson(jsonString)} onChange={handleChange}/>
            </div>
            <hr/>
            <div style={{height: '70%', overflowY: 'scroll'}}>
                <DiffViewerV2 compareFails={compareResult.failList} value={{right: compareResult.right, left: compareResult.left}}/>
            </div>
        </DialogContent>
        <DialogActions>
            <TextField type='number'
                       label='auto compare time in millisecond'
                       value={autoCompare.intervalInMilli}
                       onChange={(e) => restartAutoCompare(parseInt(e.target.value))}/>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
    </Dialog>
};


export default JsonComparator;
