import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";
import { useState } from "react";
import styles from "../team.module.css";
import { useOutletVariables } from "../../../NavigationBar";
import { validateText } from "../../../functions/Validate";

export default function TeamAdd({
    open,
    setOpenTeamAdd,
    teams,
    completedAction,
    setCompletedAction,
    openAPIError,
    minNameLength,
    maxNameLength,
}) {
    const { user, APIError, setAPIError } = useOutletVariables();
    const [newTeam, setNewTeam] = useState("");

    const [teamNameError, setTeamNameError] = useState(false);
    const [alreadyExistsError, setAlreadyExistsError] = useState(false);

    const nameError =
        newTeam.length < minNameLength || newTeam.length > maxNameLength;

    const handleClose = () => {
        setOpenTeamAdd(false);
        setTeamNameError(false);
        setAlreadyExistsError(false);
        setNewTeam("");
    };

    const createTeam = (newTeam) => {
        if (
            newTeam.length < minNameLength ||
            newTeam.length > maxNameLength ||
            validateText(newTeam) == null
        ) {
            setTeamNameError(true);
        } else {
            let firstUser = { name: user.name, vacationerId: user.id };
            let teamTitle: string = validateText(newTeam);
            // Set the user as a member of the new team
            const teamToAdd = {
                title: teamTitle,
                members: firstUser,
            };
            axios
                .post(`${process.env.REACT_APP_ADDRESS}/teams`, teamToAdd, {
                    withCredentials: true,
                })
                .then((response) => {
                    setCompletedAction(!completedAction);
                    setNewTeam("");
                })
                .catch((error) => {
                    openAPIError();
                    console.error("There was a post error!", error);
                })
                .then(() => {
                    handleClose();
                });
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle color="primary">Create new team</DialogTitle>
            <DialogContent className={styles.addTeamDialogContent}>
                <DialogContentText>
                    Please provide name for the team.
                </DialogContentText>
                <div className={styles.teamAddTextField}>
                    <TextField
                        className={styles.teamAddTextField}
                        required
                        inputProps={{ minLength: minNameLength }}
                        label="Team name"
                        disabled={APIError}
                        variant="outlined"
                        value={newTeam}
                        helperText={
                            nameError &&
                            `Name must be ${minNameLength}-${maxNameLength} characters`
                        }
                        onChange={(e) => setNewTeam(e.target.value)}
                    />
                </div>
                <div className={styles.createButton}>
                    <Button
                        onClick={() => {
                            createTeam(newTeam);
                        }}
                        disabled={APIError}
                        variant={"contained"}
                    >
                        Create team
                    </Button>
                </div>
            </DialogContent>
            <DialogActions></DialogActions>

            <AlertDialog
                handleAction={() => void 0}
                cancel={""}
                confirm={""}
                openAlert={teamNameError}
                handleCloseAlert={() => setTeamNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={`The team name must be ${minNameLength}-${maxNameLength} characters and it cant contain leading or trailing whitespaces.`}
            />

            <AlertDialog
                handleAction={() => void 0}
                cancel={""}
                confirm={""}
                openAlert={alreadyExistsError}
                handleCloseAlert={() => setAlreadyExistsError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={"This team name is already taken!"}
            />
        </Dialog>
    );
}
