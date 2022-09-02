import {Button, FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import styles from "../admin.module.css";
import AlertDialog from "../../Dialogs/AlertDialog";
import axios from "axios";
import {useState} from "react";
import ModifyDialog from "../../Dialogs/ModifyDialog";

export default function UserForm({
                                     emptySelections,
                                     selectedUser,
                                     setSelectedUser,
                                     setCompletedAction,
                                     completedAction,
                                     vacationers
                                 }) {

    const [newUser, setNewUser] = useState([]);
    const [userCreationError, setUserCreationError] = useState(false);
    const [userNameError, setUserNameError] = useState(false);
    const [openDeleteUserAlert, setOpenDeleteUserAlert] = useState(false)
    const [openModifyUserAlert, setOpenModifyUserAlert] = useState(false)
    const nameError = newUser.length < 3;
    const TITLE = "Create user";

    const deleteUser = () => {
        console.log("userID", selectedUser)
        axios
            .delete(`http://${process.env.REACT_APP_DB_ADDRESS}:3001/vacationers/${selectedUser.id}`)
            .then((response) => {
                setOpenDeleteUserAlert(false)
                console.log(response)
                removeUserFromTeams(selectedUser)
            })
            .catch((error) => {
                console.error("There was a delete user error!", error);
            });

    }

    const removeUserFromTeams = (removableUser) => {
        axios
            .put(`http://${process.env.REACT_APP_DB_ADDRESS}:3001/teams/members/all`, removableUser)
            .then((response) => {
                console.log("nyt response", response)
                setCompletedAction(!completedAction)
                emptySelections();
            })
            .catch((error) => {
                console.error("There was a delete user from all teams error!", error);
            });
    }

    const changeUserName = (newName) => {
        console.log("selectedUser", selectedUser, "changeUserName", newName)
        if (newName.length >= 3) {
            axios
                .patch(`http://${process.env.REACT_APP_DB_ADDRESS}:3001/vacationers/${selectedUser.id}`, {"newName": newName})
                .then((response) => {
                    changeUserNameinTeams(selectedUser.id, newName);
                    console.log(response);
                    setOpenModifyUserAlert(false);
                    emptySelections();
                })
                .catch((error) => {
                    console.error("There was a put new name error!", error);
                    setUserCreationError(true);
                });
        } else {
            setUserNameError(true);
        }
    }

    const changeUserNameinTeams = (memberId, newName) => {
        console.log("changeUserNameinTeams", memberId, newName)
        axios
            .put(`http://${process.env.REACT_APP_DB_ADDRESS}:3001/teams/membername/${memberId}`, {"newName": newName})
            .then((response) => {
                setCompletedAction(!completedAction)
            })
            .catch((error) => {
                console.error("There was a put changeUserNameinTeams error!", error);
            });
    }

    const createUser = (e) => {
        e.preventDefault();
        if (!nameError) {
            const newVacation = {
                name: newUser,
            };
            console.log("newVacation", newVacation);

            axios
                .post(`http://${process.env.REACT_APP_DB_ADDRESS}:3001/vacationers`, newVacation)
                .then((response) => {
                    console.log(response);
                    setCompletedAction(!completedAction);
                    emptySelections();
                })
                .catch((error) => {
                    console.error("There was a post error!", error);
                    setUserCreationError(true)
                });
            setNewUser("");
        } else {
            console.log("Not valid, check!");
        }
    };

    return (
        <>
            <div className={styles.content}>
                <div className={styles.borderedBox}>
                    <InputLabel className={styles.extraMargin}>{TITLE}</InputLabel>
                    <TextField
                        style={{display: "block"}}
                        className={styles.extraMargin}
                        required
                        label="Username"
                        variant="outlined"
                        error={nameError}
                        value={newUser}
                        helperText={nameError && "Name must be at least 3 characters"}
                        onChange={(e) => setNewUser(e.target.value)}/>
                    <Button onClick={createUser} variant="contained">
                        {TITLE}
                    </Button>
                </div>
                <div className={styles.borderedBox}>
                    <InputLabel className={styles.extraMargin}>User list</InputLabel>
                    <FormControl className={styles.nameSelectBox}>
                        <InputLabel>Choose user</InputLabel>
                        <Select
                            displayEmpty={true}
                            value={selectedUser}
                            onChange={e => {
                                setSelectedUser(e.target.value);
                            }
                            }>
                            {vacationers.map((vacationer) => (
                                    <MenuItem key={vacationer.id} value={vacationer}>{vacationer.name}</MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                    <Button disabled={!selectedUser} onClick={() => {
                        setOpenModifyUserAlert(true);
                    }
                    } variant={"contained"}>Modify user</Button>
                    <Button disabled={!selectedUser} onClick={() => {
                        setOpenDeleteUserAlert(true);
                    }
                    } variant={"contained"}>
                        Delete user!
                    </Button>
                </div>
            </div>
            <ModifyDialog openAlert={openModifyUserAlert} handleCloseAlert={() => setOpenModifyUserAlert(false)}
                          dialogTitle={"Modify user"}
                          dialogContent={"Change name of user " + selectedUser.name}
                          inputContent={selectedUser.name}
                          handleAction={(name) => changeUserName(name)}
                          cancel={"No"} confirm={"Yes change name"}
            />
            <AlertDialog openAlert={openDeleteUserAlert} handleCloseAlert={() => setOpenDeleteUserAlert(false)}
                         handleAction={deleteUser}
                         dialogTitle={"Delete user"}
                         dialogContent={selectedUser && `Are you sure you want to delete the user ${selectedUser.name} ?`}
                         cancel={"No"} confirm={"Yes delete"}/>
            <AlertDialog openAlert={userCreationError} handleCloseAlert={() => setUserCreationError(false)}
                         handleAction={deleteUser}
                         dialogTitle={"ERROR!"}
                         dialogContent={"This username is already taken!"}
            />
            <AlertDialog openAlert={userNameError} handleCloseAlert={() => setUserNameError(false)}
                         handleAction={deleteUser}
                         dialogTitle={"ERROR!"}
                         dialogContent={"This username is too short (less than 3 characters)!"}
            />
        </>
    )
}