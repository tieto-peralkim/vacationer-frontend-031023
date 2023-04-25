import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import styles from "./combo.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

export default function Combo() {
    const [save, setSave] = useState(false);
    const [user, setUser, updateUser, setUpdateUser, APIError, setAPIError] =
        useOutletContext();
    const [vacationersAmount, setVacationersAmount] = useState([]);

    const shortenLongNames = (longName) => {
        let maxLength = 14;
        if (longName.length > maxLength) {
            return longName.slice(0, maxLength) + "...";
        } else {
            return longName;
        }
    };

    // When data has changed, update user and simple list of vacationers
    useEffect(() => {
        setUpdateUser(!updateUser);
        console.log("arvot", APIError, user);
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`, {
                withCredentials: true,
            })
            .then((response) => {
                setVacationersAmount(response.data);
                console.log("Saved, setVacationersAmount:", response.data);
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
                    shortenLongNames={shortenLongNames}
                    vacationersAmount={vacationersAmount}
                    save={save}
                    setSave={setSave}
                />
                <Calendar
                    shortenLongNames={shortenLongNames}
                    vacationersAmount={vacationersAmount}
                    save={save}
                />
            </div>
        </>
    );
}
