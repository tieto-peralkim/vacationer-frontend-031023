import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import styles from "./combo.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletVariables } from "../../NavigationBar";
import HelpIcon from '@mui/icons-material/Help';
import { Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText } from "@mui/material";
import { blue } from "@mui/material/colors";
import help from "../../images/help.png";

export default function Combo() {
    const [save, setSave] = useState(false);
    const [open, setOpen] = useState(false);

    const { user, APIError, setAPIError, newUserState, updateUser } =
        useOutletVariables();
    const [vacationersAmount, setVacationersAmount] = useState([]);

    const shortenLongNames = (longName) => {
        let maxLength = 14;
        if (longName.length > maxLength) {
            return longName.slice(0, maxLength) + "...";
        } else {
            return longName;
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // When data has changed, update simple list of vacationers & update user
    useEffect(() => {
        updateUser(!newUserState);
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
                <HelpIcon
                    className={styles.helpIcon}
                    color="primary"
                    onClick={() => {
                        handleClickOpen();
                    }}
                />
                <Calendar
                    shortenLongNames={shortenLongNames}
                    vacationersAmount={vacationersAmount}
                    save={save}
                />

                <Dialog 
                    open={open}
                    fullWidth={true}
                    maxWidth="xl"
                    onClose={handleClose}
                >
                    <DialogTitle
                    color="primary"
                    align="center"
                    >
                        Help
                    </DialogTitle>
                        <img src={help}/>
                </Dialog>
            </div>
        </>
    );
}
