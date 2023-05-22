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
import { useOutletVariables } from "../../../NavigationBar";

export interface Member {
    name: "";
    id: "";
}

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
    const { user, APIError, setAPIError } = useOutletVariables();
    const [newTeam, setNewTeam] = useState("");

    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
    const [deletableMember, setDeletableMember] = useState<Member>();

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
        setDeletableMember({ name: "", id: "" });
        setCompletedAction(!completedAction);
        setOpenTeamModify(false);
        setNewTeam("");
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
            .then(() => {
                setOpenBackdrop(false);
                setCompletedAction(!completedAction);
            })
            .catch((error) => {
                openAPIError();
                console.error("There was a team put error!", error);
            })
            .then(() => {
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
                setDeletableMember({ name: "", id: "" });
                setCompletedAction(!completedAction);
                setOpenDeleteMemberAlert(false);
            })
            .catch((error) => {
                openAPIError();
                console.error("There was a delete member error!", error);
            })
            .then(() => {
                // If the deleted member was current user -> close the dialog so the team can't be further modified
                if (deletableMember.name === user.name) {
                    handleClose();
                }
            });
    };

    const changeTeamName = (newName) => {
        if (newTeam.length < 3 || newTeam.length > 20) {
            setTeamNameError(true);
        } else {
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
        }
    };

    const deleteTeam = () => {
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
                    {selectedTeam && selectedTeam.title}
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
                    placeholder={selectedTeam && selectedTeam.title}
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
                            MenuProps={{
                                sx: {
                                    height: 300,
                                },
                            }}
                            sx={{
                                width: 300,
                            }}
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
                    <div className={styles.membersToAdd}>
                        <InputLabel>Members to add: </InputLabel>
                        {selectedMembers.length > 0 &&
                            selectedMembers.map((member) => (
                                <Chip key={member.id} label={member.name} />
                            ))}
                    </div>
                    <div className={styles.lastRowButtons}>
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
                        </div>
                        <div className={styles.deleteButton}>
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
                </div>
            </DialogContent>
            <DialogActions />

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
                handleAction={() => void 0}
                openAlert={teamNameError}
                handleCloseAlert={() => setTeamNameError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={
                    "The team name must be between 3 - 20 characters"
                }
                cancel={""}
                confirm={""}
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
                // sx={{ color: "red" }}
                // className={styles.ultimateWarning}
                openAlert={openDeleteUserAlert}
                handleCloseAlert={() => setOpenDeleteUserAlert(false)}
                handleAction={deleteMember}
                dialogTitle={
                    selectedTeam &&
                    `Remove yourself from team ${selectedTeam.title}`
                }
                dialogContent={
                    deletableMember &&
                    `Are you sure? You will lose ALL rights to the team?`
                }
                cancel={"No"}
                confirm={"Yes delete"}
            />

            <AlertDialog
                handleAction={() => void 0}
                openAlert={alreadyExistsError}
                handleCloseAlert={() => setAlreadyExistsError(false)}
                dialogTitle={"ERROR!"}
                dialogContent={"This team name is already taken!"}
                cancel={""}
                confirm={""}
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
