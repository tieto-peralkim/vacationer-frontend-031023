import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import PropTypes from "prop-types";

function AlertDialog({
    openAlert,
    handleAction,
    handleCloseAlert,
    dialogTitle,
    dialogContent,
    cancel,
    confirm,
}) {
    return (
        <Dialog open={openAlert} onClose={handleCloseAlert}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>{dialogContent}</DialogContent>
            <DialogActions>
                {cancel && <Button onClick={handleCloseAlert}>{cancel}</Button>}
                {confirm && <Button onClick={handleAction}>{confirm}</Button>}
            </DialogActions>
        </Dialog>
    );
}

AlertDialog.propTypes = {
    openAlert: PropTypes.bool,
    handleAction: PropTypes.func,
    handleCloseAlert: PropTypes.func,
    dialogTitle: PropTypes.string,
    dialogContent: PropTypes.string,
    cancel: PropTypes.string,
    confirm: PropTypes.string,
};

export default AlertDialog;
