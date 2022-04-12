import {useEffect, useState} from "react";
import axios from "axios";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    InputLabel,
    Slider,
    TextField
} from "@mui/material";
import styles from "./admin.module.css";
import Typography from "@mui/material/Typography";
import CustomDialog from "../Picker/Components/CustomDialog";

export default function Admin() {

    const [vacationers, setVacationers] = useState([]);
    const [newUser, setNewUser] = useState([]);
    const [userCreationError, setUserCreationError] = useState(false);
    const WORKER_LIMIT_DEFAULT = 12;
    const [workerLimit, setWorkerLimit] = useState(WORKER_LIMIT_DEFAULT);
    const [completedAction, setCompletedAction] = useState({})
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
    const [userToDelete, setUserToDelete] = useState({})
    const nameError = newUser.length < 3;

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setVacationers(response.data);
        });
    }, [completedAction]);

    const deleteUser = () => {
        console.log("userID")
        axios
            .delete(`http://localhost:3001/vacationers/${userToDelete.id}`)
            .then((response) => console.log(response))
            .catch((error) => {
                console.error("There was a delete error!", error);
            });
        setCompletedAction({})
        setOpenDeleteAlert(false)
    }

    const createUser = (e) => {
        e.preventDefault();
        if (!nameError) {
            const newVacation = {
                name: newUser,
            };
            console.log("NV", newVacation);

            axios
                .post("http://localhost:3001/vacationers", newVacation)
                .then((response) => console.log(response))
                .catch((error) => {
                    console.error("There was a post error!", error);
                    setUserCreationError(true)
                });
            setNewUser("");
            setCompletedAction({})
        } else {
            console.log("Not valid, check!");
        }
    };


    return (
        <>
            <Box className={styles.sliderBox}>
                <Typography>
                    Worker limit <b>{workerLimit}</b>
                </Typography>
                <Slider
                    className={styles.slider}
                    value={workerLimit}
                    min={1}
                    max={30}
                    onChange={(e) => setWorkerLimit(e.target.value)}
                />
            </Box>
            <h1>Admin</h1>
            <InputLabel>Create a user</InputLabel>
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
                Create a new user
            </Button>
            <ul>
                {vacationers.map((holidayer) => (<>
                    <li key={holidayer.id}>
                        {holidayer.name ? (
                            <b>{holidayer.name}</b>
                        ) : (
                            <b>No name</b>
                        )}
                        {" "} {holidayer.id}<br/>
                        <Button value={holidayer.name} variant="contained" color="secondary" onClick={e => {
                            setUserToDelete({id:holidayer.id, name:holidayer.name})
                            setOpenDeleteAlert(true)
                        }}>DELETE {holidayer.name}</Button>
                    </li>

                    </>
                    ))}
            </ul>
            <CustomDialog openAlert={openDeleteAlert} handleCloseAlert={() => setOpenDeleteAlert(false)}
                          handleAction={deleteUser}
                          dialogTitle={"Delete user"}
                          dialogContent={userToDelete && `Are you sure you want to delete the user ${userToDelete.name} ?`}
                          cancel={"No"} confirm={"Yes delete"}/>
            <CustomDialog openAlert={userCreationError} handleCloseAlert={() => setUserCreationError(false)}
                          handleAction={deleteUser}
                          dialogTitle={"ERROR!"}
                          dialogContent={"This username is already taken!"}
                          />
        </>
    )
}