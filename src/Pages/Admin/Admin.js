import {useEffect, useState} from "react";
import axios from "axios";
import {Box, Button, InputLabel, Slider, TextField,} from "@mui/material";
import styles from "./admin.module.css";
import TeamForm from "./Components/TeamForm";
import Typography from "@mui/material/Typography";
import UserForm from "./Components/UserForm";
import {CompactPicker} from "react-color";
import {useNavigate} from "react-router-dom";
import AlertDialog from "../Dialogs/AlertDialog";

// Tähän pitäisi lisätä työntekijämäärien asetukset (määrä, minimimäärä)
export default function Admin() {
    const navigate = useNavigate();
    const [vacationers, setVacationers] = useState([]);
    const [teams, setTeams] = useState([]);

    const WORKER_LIMIT_DEFAULT = 12;
    const [workerLimit, setWorkerLimit] = useState(WORKER_LIMIT_DEFAULT);
    const [completedAction, setCompletedAction] = useState(false)
    const [displayColorPicker, setDisplayColorPicker] = useState(true)
    const [holidayColor, setHolidayColor] = useState("#73D8FF")
    const [weekendColor, setWeekendColor] = useState("#CCCCCC")
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("#666666")
    const [selectedMember, setSelectedMember] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedUser, setSelectedUser] = useState("")
    const [openAPIError, setOpenAPIError] = useState(false);

    const [holidaySymbol, setHolidaySymbol] = useState("X");

    const emptySelections = () => {
        setSelectedMember("");
        setSelectedTeam("");
        setSelectedUser("");
    }

    const handleOpenAPIError = () => {
        setOpenAPIError(true);
    };
    const handleCloseAPIError = () => {
        setOpenAPIError(false);
    };

    const handleColorPickerClick = () => {
        setDisplayColorPicker(prevValue => !prevValue)
    }
    const handleColorPickerClose = () => {
        setDisplayColorPicker(false)
    }

    const setAllColors = () => {
        navigate('/calendar',
            {state: {"holidayColor": holidayColor, "weekendColor": weekendColor, "weekendHolidayColor": weekendHolidayColor,
                "holidaySymbol": holidaySymbol}},
            );
        console.log("SetColors and symbol", holidayColor, weekendColor, weekendHolidayColor, holidaySymbol)
    }

    const handleHolidayColorChange = (color) => {
        setHolidayColor(color.hex);
    }
    const handleWeekendColorChange = (color) => {
        setWeekendColor(color.hex)
    }
    const handleWeekendHolidayColorChange = (color) => {
        setWeekendHolidayColor(color.hex)
    }

    const sendSlackMessage = () => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/slackMessageSender`)
            .then((response) => {
                console.log(response.data)
            })
            .catch((error) => {
                console.error("There was a sendSlackMessage error!", error);
                handleOpenAPIError();
            })
    }

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_ADDRESS}/vacationers`).then((response) => {
            setVacationers(response.data);
            console.log("vacationers", response.data);
        })
            .catch((error) => {
                console.error("There was a vacationers get error!", error)
                handleOpenAPIError();
            });
    }, [completedAction]);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/teams`)
            .then((response) => {
                setTeams(response.data);
                console.log("teams", response.data);
            })
            .catch((error) => {
                console.error("There was a teams get error!", error)
                handleOpenAPIError();
            });
    }, [completedAction]);

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
            <h3>User</h3>
            <UserForm emptySelections={emptySelections} selectedUser={selectedUser} setSelectedUser={setSelectedUser} setCompletedAction={setCompletedAction} completedAction={completedAction} vacationers={vacationers}/>
            <h3>Team</h3>
            <TeamForm emptySelections={emptySelections} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} selectedMember={selectedMember} setSelectedMember={setSelectedMember} setCompletedAction={setCompletedAction} completedAction={completedAction} vacationers={vacationers} teams={teams}/>
            <div>
                <InputLabel className={styles.extraMargin}>Test Slack</InputLabel>
                <Button onClick={sendSlackMessage} variant={"contained"}>
                    Send to Slack!
                </Button>
            </div>
            {/*<Button onClick={handleColorPickerClick}>Holidaycolor</Button>*/}
            {displayColorPicker ? <div
                // className={styles.popover}
            >
                <div className={styles.cover} onClick={handleColorPickerClose}/>
                <div className={styles.colorPickers}>
                    <div><h3>Holiday color</h3>
                        <CompactPicker color={holidayColor} onChangeComplete={handleHolidayColorChange}/></div>
                    <div><h3>Weekend color</h3>
                        <CompactPicker color={weekendColor} onChangeComplete={handleWeekendColorChange}/></div>
                    <div><h3>Weekend holiday color</h3>
                        <CompactPicker color={weekendHolidayColor} onChangeComplete={handleWeekendHolidayColorChange}/>
                    </div>
                </div>
                <TextField
                    // className={styles.}
                    label="Holiday symbol"
                    variant="outlined"
                    value={holidaySymbol}
                    onChange={(e) => {
                        setHolidaySymbol(e.target.value)
                    }}/>
            </div> : null}
            <Button variant={"contained"} onClick={setAllColors}>Save calendar colors (for one session)</Button>
            <AlertDialog openAlert={openAPIError} handleCloseAlert={handleCloseAPIError}
                         handleAction={handleCloseAPIError}
                         dialogTitle={"API Error"}
                         dialogContent={"No connection to API, try again later"}
                         confirm={"OK"}/>
        </>
    )
}