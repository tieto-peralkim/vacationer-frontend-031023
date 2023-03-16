import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import ApiAlert from "../../components/ApiAlert";
import styles from "./combo.module.css";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Combines Calendar and Picker
export default function Combo() {
    const [save, setSave] = useState(false);
    const [APIError, setAPIError] = useState(false);

    const [user, setUser, update, setUpdate] = useOutletContext();
    const [vacationersAmount, setVacationersAmount] = useState([]);

    const handleOpenAPIError = () => {
        setAPIError(true);
    };
    const handleCloseAPIError = () => {
        setAPIError(false);
    };

    // Update simple list of vacationers
    useEffect(() => {
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

    return (
        <>
            {APIError && <ApiAlert />}
            <div className={styles.content}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        Your holidays: add, edit and remove
                    </AccordionSummary>
                    <AccordionDetails>
                        <Picker
                            handleOpenAPIError={handleOpenAPIError}
                            handleCloseAPIError={handleCloseAPIError}
                            APIError={APIError}
                            vacationersAmount={vacationersAmount}
                            save={save}
                            setSave={setSave}
                            user={user}
                        />
                    </AccordionDetails>
                </Accordion>
                <Calendar
                    vacationersAmount={vacationersAmount}
                    save={save}
                    handleOpenAPIError={handleOpenAPIError}
                    handleCloseAPIError={handleCloseAPIError}
                    APIError={APIError}
                    user={user}
                />
            </div>
        </>
    );
}
