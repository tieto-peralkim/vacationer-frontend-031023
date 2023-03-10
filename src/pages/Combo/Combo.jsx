import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import ApiAlert from "../../components/ApiAlert";
import styles from "./combo.module.css";
import { Alert, Divider } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

// Combines Calendar and Picker
export default function Combo() {
    const [save, setSave] = useState(false);
    const [APIError, setAPIError] = useState(false);

    const [user, setUser, update, setUpdate] = useOutletContext();
    const [vacationers, setVacationers] = useState([]);
    const [vacationersAmount, setVacationersAmount] = useState([]);

    const handleOpenAPIError = () => {
        setAPIError(true);
    };
    const handleCloseAPIError = () => {
        setAPIError(false);
    };

    // Update simple list of vacationers
    useEffect(() => {
        console.log("user.name Combo", user.name);
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`, {
                withCredentials: true,
            })
            .then((response) => {
                setVacationersAmount(response.data);
                console.log("Saved, setVacationersAmount:", response.data);
            })
            .catch((error) => {
                console.error(
                    "There was a get vacationers total error:",
                    error
                );
                handleOpenAPIError();
            });
    }, [save]);

    // When data has changed, update the user
    useEffect(() => {
        setUpdate(!update);
    }, [save]);

    // Update full list of vacationers
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers`, {
                withCredentials: true,
            })
            .then((response) => {
                setVacationers(response.data);
                console.log("Saved, setVacationers:", response.data);
            })
            .catch((error) => {
                console.error("There was a vacationers get error:", error);
                handleOpenAPIError();
            });
    }, [save]);

    return (
        <>
            {APIError && <ApiAlert />}
            <div className={styles.content}>
                <Calendar
                    vacationersAmount={vacationersAmount}
                    save={save}
                    APIError={APIError}
                    user={user}
                />
                <Divider
                    orientation={"horizontal"}
                    flexItem={true}
                    absolute={false}
                />
                <Picker
                    handleOpenAPIError={handleOpenAPIError}
                    APIError={APIError}
                    vacationers={vacationers}
                    setVacationers={setVacationers}
                    save={save}
                    setSave={setSave}
                    user={user}
                    setUpdate={setUpdate}
                />
            </div>
        </>
    );
}
