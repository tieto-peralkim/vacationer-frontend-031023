import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";
import { useState } from "react";
import styles from "../team.module.css";
import { useOutletContext } from "react-router-dom";
import {
    Alert,
    Checkbox,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    CircularProgress,
    Backdrop,
} from "@mui/material";

export default function TeamModify({
    open,
    setOpenTeamModify,
    selectedTeam,
    vacationers,
    teams,
    completedAction,
    setCompletedAction,
    openAPIError,
}) {
    const [user, setUser, updateUser, setUpdateuser, APIError, setAPIError] =
        useOutletContext();
    const [newTeam, setNewTeam] = useState([]);

    const [selectedMembers, setSelectedMembers] = useState([]);
    const [deletableMember, setDeletableMember] = useState("");

    const [openSnackBar, setopenSnackBar] = useState(false);
    const [openBackdrop, setOpenBackdrop] = useState(false);

    const [teamNameError, setTeamNameError] = useState(false);
    const [alreadyExistsError, setAlreadyExistsError] = useState(false);

    const [openDeleteMemberAlert, setOpenDeleteMemberAlert] = useState(false);
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false);
    const [openDeleteTeamAlert, setOpenDeleteTeamAlert] = useState(false);

    const nameError = newTeam.length < 3;

    const handleClose = () => {
        setAlreadyExistsError(false);
        setTeamNameError(false);
        setDeletableMember("");
        setCompletedAction(!completedAction);
        setOpenTeamModify(false);
        setNewTeam([]);
        setOpenDeleteMemberAlert(false);
        setOpenDeleteUserAlert(false);
        setSelectedMembers([]);
    };

    // Needed to separate the selected members
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedMembers(
            typeof value === "string" ? value.split(",") : value
        );
        console.log("selectedMembers", selectedMembers);
    };

    function addToTeam(newMembers, team) {
        setOpenBackdrop(true);
        axios
            .post(
                `${process.env.REACT_APP_ADDRESS}/teams/${team.id}`,
                newMembers,
                {
                    withCredentials: true,
                }
            )
            .then((response) => {
                console.log("Added members? ", response.data.message);
                setOpenBackdrop(false);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                openAPIError();
                console.error("There was a team put error!", error);
            })
            .finally(() => {
                setSelectedMembers([]);
            });
    }

    const deleteMember = () => {
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/members/${selectedTeam.id}`,
                deletableMember,
                { withCredentials: true }
            )
            .then(() => {
                setDeletableMember("");
                setCompletedAction(!completedAction);
                setOpenDeleteMemberAlert(false);
            })
            .catch((error) => {
                openAPIError();
                console.error("There was a delete member error!", error);
            })
            .finally(() => {
                // If the deleted member was current user -> close the dialog so the team can't be further modified
                if (deletableMember.name === user.name) {
                    handleClose();
                }
            });
    };

    const changeTeamName = (newName) => {
        if (!nameError) {
            let alreadyExists = false;
            teams.forEach((team) => {
                if (team.title === newTeam) {
                    alreadyExists = true;
                }
            });

            if (!alreadyExists) {
                axios
                    .patch(
                        `${process.env.REACT_APP_ADDRESS}/teams/${selectedTeam.id}`,
                        {
                            newName: newName,
                        },
                        { withCredentials: true }
                    )
                    .then(() => {
                        setCompletedAction(!completedAction);
                        setopenSnackBar(true); // Notify the user when the name change succeeded
                    })
                    .catch((error) => {
                        openAPIError();
                        console.error("There was a put new name error!", error);
                    });
            } else {
                setAlreadyExistsError(true);
            }
        } else {
            setTeamNameError(true);
        }
    };

    const deleteTeam = () => {
        console.log("deleting team", selectedTeam);
        axios
            .put(
                `${process.env.REACT_APP_ADDRESS}/teams/${selectedTeam.id}/delete`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                setCompletedAction(!completedAction);
                setOpenDeleteTeamAlert(false);
                handleClose();
            })
            .catch((error) => {
                openAPIError();
                console.error("There was a delete error!", error);
            });
    };

    const handleSnackbarClose = () => {
        setopenSnackBar(false);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle color="primary">
                Modify team{" "}
                <span className={styles.modifyTeamName}>
                    {selectedTeam.title}
                </span>
            </DialogTitle>
            <DialogContent className={styles.modifyTeamDialogContent}>
                <TextField
                    className={styles.teamAddTextField}
                    required
                    inputProps={{ minLength: 3 }}
                    variant="outlined"
                    value={newTeam}
                    helperText={
                        nameError && "New name must be at least 3 characters"
                    }
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder={selectedTeam.title}
                />
                <Button
                    disabled={!selectedTeam}
                    onClick={() => {
                        changeTeamName(newTeam);
                    }}
                    variant={"contained"}
                >
                    Change team name
                </Button>

                <div className={styles.memberDiv}>
                    <InputLabel>Members: </InputLabel>
                    {selectedTeam &&
                        selectedTeam.members.map((member) =>
                            member.name !== user.name ? (
                                <Chip
                                    key={member.vacationerId}
                                    label={member.name}
                                    onDelete={() => {
                                        setOpenDeleteMemberAlert(true);
                                        setDeletableMember(member);
                                    }}
                                    deleteIcon={<DeleteIcon />}
                                />
                            ) : (
                                <Chip
                                    key={member.vacationerId}
                                    label={member.name}
                                    onDelete={() => {
                                        setOpenDeleteUserAlert(true); // If the user selects himself
                                        setDeletableMember(member);
                                    }}
                                    deleteIcon={<DeleteIcon />}
                                />
                            )
                        )}
                </div>

                <div className={styles.topMargin}>
                    <FormControl sx={{ width: "50%", mt: 1 }}>
                        <InputLabel>Add new team member</InputLabel>
                        <Select
                            className={styles.nameSelectBox}
                            value={selectedMembers}
                            multiple
                            onChange={handleChange}
                            renderValue={() => "..."}
                        >
                            {vacationers
                                .filter(
                                    (vacationer) =>
                                        !selectedTeam?.members?.some(
                                            (member) =>
                                                member.vacationerId ===
                                                vacationer.id
                                        )
                                )
                                .map(
                                    (
                                        vacationer // Filter out names that already exists in selected team
                                    ) => (
                                        <MenuItem
                                            key={vacationer.id}
                                            value={vacationer}
                                        >
                                            <Checkbox
                                                key={vacationer.id}
                                                checked={
                                                    selectedMembers.indexOf(
                                                        vacationer
                                                    ) > -1
                                                }
                                            />
                                            {vacationer.name}
                                        </MenuItem>
                                    )
                                )}
                        </Select>
                    </FormControl>
                    <div>
                        <InputLabel>Members to add: </InputLabel>
                        {selectedMembers.map((member) => (
                            <Chip key={member.id} label={member.name} />
                        ))}
                    </div>
                    <div className={styles.addButton}>
                        <Button
                            disabled={selectedMembers.length === 0} // Set button disabled if no member is selected
                            onClick={() => {
                                addToTeam(selectedMembers, selectedTeam);
                            }}
                            variant={"contained"}
                        >
                            Add to team!
                        </Button>
                        <Button
                            disabled={!selectedTeam}
                            onClick={() => {
                                setOpenDeleteTeamAlert(true);
                            }}
                            variant={"contained"}
                            color={"error"}
                        >
                            Delete team
                        </Button>
                    </div>
                </div>
            </DialogContent>
            <DialogActions></DialogActions>

            <AlertDialog
                openAlert={openDeleteTeamAlert}
                handleCloseAlert={() => setOpenDeleteTeamAlert(false)}
                handleAction={deleteTeam}
                dialogTitle={"Delete team"}
                dialogContent={
                    selectedTeam &&
                    `Are you sure you want to delete the team ${selectedTeam.title}?`
                }
                cancel={"No"}
                confirm={"Yes delete"}
            />

            <AlertDialog
                openAlert={teamNameError}
                handleCloseAlert={() => setTeamNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={
                    "This team name is too short (less than 3 characters)!"
                }
            />

            <AlertDialog
                openAlert={openDeleteMemberAlert}
                handleCloseAlert={() => setOpenDeleteMemberAlert(false)}
                handleAction={deleteMember}
                dialogTitle={"Remove member"}
                dialogContent={
                    deletableMember &&
                    `Are you sure you want to remove member ${deletableMember.name} from team ${selectedTeam.title} ?`
                }
                cancel={"No"}
                confirm={"Yes delete"}
            />

            <AlertDialog
                sx={{ color: "red" }}
                className={styles.ultimateWarning}
                openAlert={openDeleteUserAlert}
                handleCloseAlert={() => setOpenDeleteUserAlert(false)}
                handleAction={deleteMember}
                dialogTitle={`Remove yourself from team ${selectedTeam.title}`}
                dialogContent={
                    deletableMember &&
                    `Are you sure? You will lose ALL rights to the team?`
                }
                cancel={"No"}
                confirm={"Yes delete"}
            />

            <AlertDialog
                openAlert={alreadyExistsError}
                handleCloseAlert={() => setAlreadyExistsError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={"This team name is already taken!"}
            />

            <Snackbar
                open={openSnackBar}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="success"
                    sx={{ width: "500px" }}
                >
                    Team name changed successfully.
                </Alert>
            </Snackbar>

            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={openBackdrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Dialog>
    );
}
