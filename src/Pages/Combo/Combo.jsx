import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import styles from "./combo.module.css";
import { Divider } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import AlertDialog from "../Dialogs/AlertDialog";

// Combines Calendar and Picker
export default function Combo() {
    const [save, setSave] = useState(false);
    const [openAPIError, setOpenAPIError] = useState(false);

    const [vacationers, setVacationers] = useState([]);

    const handleOpenAPIError = () => {
        setOpenAPIError(true);
    };
    const handleCloseAPIError = () => {
        setOpenAPIError(false);
    };

    // Update list of employees and their vacations
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`)
            .then((response) => {
                setVacationers(response.data);
                console.log("Saved, response.data:", response.data);
            })
            .catch((error) => {
                console.error("There was a get error!", error);
                handleOpenAPIError();
            });
    }, [save]);

    return (
        <div className={styles.content}>
            <Calendar
                vacationers={vacationers}
                setVacationers={setVacationers}
            />
            <Divider
                orientation={"horizontal"}
                flexItem={true}
                absolute={false}
            />
            <Picker
                handleOpenAPIError={handleOpenAPIError}
                vacationers={vacationers}
                setVacationers={setVacationers}
                save={save}
                setSave={setSave}
            />

            <AlertDialog
                openAlert={openAPIError}
                handleCloseAlert={handleCloseAPIError}
                handleAction={handleCloseAPIError}
                dialogTitle={"API Error"}
                dialogContent={"No connection to API, try again later"}
                confirm={"OK"}
            />
        </div>
    );
}
