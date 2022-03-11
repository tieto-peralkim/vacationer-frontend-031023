import {useEffect, useState} from "react";
import axios from "axios";
import {Button, InputLabel, TextField} from "@mui/material";
import styles from "../Picker/picker.module.css";

export default function Admin() {

    const [vacationers, setVacationers] = useState([]);
    const [newUser, setNewUser] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setVacationers(response.data);
        });
    }, []);

    const nameError = newUser.length < 3;

    const deleteUser = (userID) => {
        console.log("userID", userID)
        axios
            .delete(`http://localhost:3001/vacationers/${userID}`)
            .then((response) => console.log(response))
            .catch((error) => {
                console.error("There was a put error!", error);
            });
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
                });
            setNewUser("");
        } else {
            console.log("Not valid, check!");
        }
    };

    return (
        <>
            <h1>Admin</h1>
            <InputLabel>Create a user</InputLabel>
            <TextField
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
                        {" "} {holidayer.id}
                    </li>
                    <Button value={holidayer.id} variant="contained" color="secondary" onClick={e => deleteUser(e.target.value)}>DELETE</Button>
                    </>
                    ))}
            </ul>
        </>
    )
}