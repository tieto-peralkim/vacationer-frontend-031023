import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";

export default function AlertDialog({openAlert, handleAction, handleCloseAlert, dialogTitle, dialogContent, cancel, confirm}) {
    return (
        <Dialog open={openAlert} onClose={handleCloseAlert}>
            <DialogTitle>
                {dialogTitle}
            </DialogTitle>
            <DialogContent>
                {dialogContent}
            </DialogContent>
            <DialogActions>
                {cancel && <Button onClick={handleCloseAlert}>{cancel}</Button>}
                {confirm && <Button onClick={handleAction}>{confirm}</Button>}
            </DialogActions>
        </Dialog>
    )
}