import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputLabel,
    TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

function ModifyDialog({
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

ModifyDialog.propTypes = {
    openAlert: PropTypes.bool,
    handleAction: PropTypes.func,
    handleCloseAlert: PropTypes.func,
    dialogTitle: PropTypes.string,
    dialogContent: PropTypes.string,
    inputContent: PropTypes.string,
    cancel: PropTypes.string,
    confirm: PropTypes.string,
};

export default ModifyDialog;
