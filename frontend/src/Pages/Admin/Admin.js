import {useEffect, useState} from "react";
import axios from "axios";
import {
    Box,
    Button, containerClasses,
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

// Tähän pitäisi lisätä työntekijämäärien asetukset (määrä, minimimäärä)
export default function Admin() {

    const [vacationers, setVacationers] = useState([]);
    const [newUser, setNewUser] = useState([]);
    const [userCreationError, setUserCreationError] = useState(false);
    const WORKER_LIMIT_DEFAULT = 12;
    const [workerLimit, setWorkerLimit] = useState(WORKER_LIMIT_DEFAULT);
    const [completedAction, setCompletedAction] = useState(false)
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
    const [userToDelete, setUserToDelete] = useState({})
    const nameError = newUser.length < 3;

    // Slack dates
    const today = new Date();
    today.setUTCHours(0, 0, 0)
    const nextMonday = new Date();
    nextMonday.setUTCDate(
        today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(12, 0, 0, 0);
    const nextSunday = new Date();
    nextSunday.setTime(nextMonday.getTime() + 6 * 24 * 60 * 60 * 1000);
    nextSunday.setUTCHours(12, 0, 0, 0);

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
            .then(() => setCompletedAction(!completedAction))
            .catch((error) => {
                console.error("There was a delete error!", error);
            });
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
                .then(() => setCompletedAction(!completedAction))
                .catch((error) => {
                    console.error("There was a post error!", error);
                    setUserCreationError(true)
                });
            setNewUser("");
        } else {
            console.log("Not valid, check!");
        }
    };

    const sendToSlack = () => {
        let numberOfVacationers = 0;
        let vacationersPerDay = []

        axios.get(`http://localhost:3001/vacationeramount?start=${nextMonday.toISOString()}&end=${nextSunday.toISOString()}`)
            .then((response) => {
                numberOfVacationers = response.data.length;
                axios.get(`http://localhost:3001/timespan?start=${nextMonday.toISOString()}&end=${nextSunday.toISOString()}`)
                    .then((response) => {
                        console.log("response", response.data)
                        vacationersPerDay = response.data;
                    })
                    .then(() =>
                        axios.post(process.env.REACT_APP_SLACK_URI, JSON.stringify({
                            "text": `Ensi viikolla yhteensä ${numberOfVacationers} lomalaista:
                ma: ${new Date(vacationersPerDay[0][0]).toLocaleDateString("fi-FI")} : ${vacationersPerDay[0][1]},
                ti: ${new Date(vacationersPerDay[1][0]).toLocaleDateString("fi-FI")} : ${vacationersPerDay[1][1]},
                ke: ${new Date(vacationersPerDay[2][0]).toLocaleDateString("fi-FI")} : ${vacationersPerDay[2][1]},
                to: ${new Date(vacationersPerDay[3][0]).toLocaleDateString("fi-FI")} : ${vacationersPerDay[3][1]},
                pe: ${new Date(vacationersPerDay[4][0]).toLocaleDateString("fi-FI")} : ${vacationersPerDay[4][1]},
                la: ${new Date(vacationersPerDay[5][0]).toLocaleDateString("fi-FI")} : ${vacationersPerDay[5][1]},
                su: ${new Date(vacationersPerDay[6][0]).toLocaleDateString("fi-FI")} : ${vacationersPerDay[6][1]}`
                        }))
                            .then((response) => {
                                console.log("rs", response)
                            })
                            .catch((error) => {
                                console.error("There was a Slack post error!", error);
                            }))
                    .catch((error) => {
                        console.error("There was a timespan get error!", error);
                    })
            })
            .catch((error) => {
                console.error("There was a vacationeramount get error!", error);
            })
    }


    return (
        <>
            {/*<Box className={styles.sliderBox}>*/}
            {/*    <Typography>*/}
            {/*        Worker limit <b>{workerLimit}</b>*/}
            {/*    </Typography>*/}
            {/*    <Slider*/}
            {/*        className={styles.slider}*/}
            {/*        value={workerLimit}*/}
            {/*        min={1}*/}
            {/*        max={30}*/}
            {/*        onChange={(e) => setWorkerLimit(e.target.value)}*/}
            {/*    />*/}
            {/*</Box>*/}
            <h1>Admin</h1>
            <InputLabel>Test Slack</InputLabel>
            <Button onClick={sendToSlack} variant={"contained"}>
                Send to Slack!
            </Button>
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