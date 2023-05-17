import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import styles from "./combo.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletVariables } from "../../NavigationBar";

export default function Combo() {
    const [save, setSave] = useState(false);
    const { user, APIError, setAPIError, newUserState, updateUser } =
        useOutletVariables();
    const [allVacationers, setAllVacationers] = useState([]);

    // When data has changed, update simple list of vacationers & update user
    useEffect(() => {
        updateUser(!newUserState);
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`, {
                withCredentials: true,
            })
            .then((response) => {
                setAllVacationers(response.data);
            })
            .catch((error) => {
                setAPIError(true);
                console.error(
                    "There was a get vacationers total error:",
                    error
                );
            });
    }, [save]);

    return (
        <>
            <div className={styles.content}>
                <Picker
                    allVacationers={allVacationers}
                    save={save}
                    setSave={setSave}
                />
                <Calendar allVacationers={allVacationers} save={save} />
            </div>
        </>
    );
}
