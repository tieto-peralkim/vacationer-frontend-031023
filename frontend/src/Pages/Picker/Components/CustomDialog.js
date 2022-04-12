import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";

export default function CustomDialog({openAlert, handleAction, handleCloseAlert, dialogTitle, dialogContent, cancel, confirm}) {
    return (
        <Dialog open={openAlert} onClose={handleCloseAlert}>
            <DialogTitle>
                {dialogTitle}
            </DialogTitle>
            <DialogContent>
                {dialogContent}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAlert}>{cancel}</Button>
                <Button onClick={handleAction}>{confirm}</Button>
            </DialogActions>
        </Dialog>
    )
}