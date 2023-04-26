import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputLabel,
    TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function ModifyDialog({
    openAlert,
    handleAction,
    handleCloseAlert,
    dialogTitle,
    dialogContent,
    inputContent,
    cancel,
    confirm,
}) {
    const [newName, setNewName] = useState({ value: "" });

    useEffect(() => {
        setNewName({ value: inputContent });
    }, [inputContent]);

    const handleChange = (e) => {
        setNewName({ value: e.target.value });
    };

    return (
        <Dialog open={openAlert} onClose={handleCloseAlert}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <InputLabel>{dialogContent}</InputLabel>
                <TextField value={newName.value} onChange={handleChange} />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        handleCloseAlert();
                        setNewName({ value: "" });
                    }}
                >
                    {cancel}
                </Button>
                <Button onClick={() => handleAction(newName.value)}>
                    {confirm}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
