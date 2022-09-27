import {useEffect, useState} from "react";
import axios from "axios";
import {Box, Button, InputLabel, Slider, TextField,} from "@mui/material";
import styles from "./admin.module.css";
import TeamForm from "./Components/TeamForm";
import Typography from "@mui/material/Typography";
import UserForm from "./Components/UserForm";
import {CompactPicker} from "react-color";
import {useNavigate} from "react-router-dom";

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

    const [holidaySymbol, setHolidaySymbol] = useState(true);

    // Slack dates
    const today = new Date();
    today.setUTCHours(0, 0, 0)
    const nextMonday = new Date();
    nextMonday.setUTCDate(
        today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(0, 0, 0, 0);
    const nextFriday = new Date();
    nextFriday.setTime(nextMonday.getTime() + 4 * 24 * 60 * 60 * 1000);
    nextFriday.setUTCHours(0, 0, 0, 0);

    const emptySelections = () => {
        setSelectedMember("");
        setSelectedTeam("");
        setSelectedUser("");
    }

    const handleColorPickerClick = () => {
        setDisplayColorPicker(prevValue => !prevValue)
    }
    const handleColorPickerClose = () => {
        setDisplayColorPicker(false)
    }

    const setAllColors = () => {
        navigate('/calendar',
            {state: {"holidayColor": holidayColor, "weekendColor": weekendColor, "weekendHolidayColor": weekendHolidayColor}},
            );
        console.log("Värit", holidayColor, weekendColor, weekendHolidayColor)
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

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_ADDRESS}/vacationers`).then((response) => {
            setVacationers(response.data);
            console.log("vacationers", response.data);
        })
            .catch((error) => {
                console.log("There was a vacationers get error!", error)
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
                console.log("There was a teams get error!", error)
            });
    }, [completedAction]);

    const slackMessage = (vacationerAmount, weekList) => {
        for (let i=0; i < weekList.length; i++){
            if (weekList[i][1] === 0){
                weekList[i][1] = "";
            }
        }
        console.log("weekList", weekList);

        axios.post(process.env.REACT_APP_SLACK_URI, JSON.stringify({
            "text": `Ensi viikolla yhteensä ${vacationerAmount} lomalaista:
                ma ${new Date(weekList[0][0]).toLocaleDateString("fi-FI")}  ${weekList[0][1]} - ${weekList[0][2]}
                ti ${new Date(weekList[1][0]).toLocaleDateString("fi-FI")}  ${weekList[1][1]} - ${weekList[1][2]}
                ke ${new Date(weekList[2][0]).toLocaleDateString("fi-FI")}  ${weekList[2][1]} - ${weekList[2][2]}
                to ${new Date(weekList[3][0]).toLocaleDateString("fi-FI")}  ${weekList[3][1]} - ${weekList[3][2]}
                pe ${new Date(weekList[4][0]).toLocaleDateString("fi-FI")}  ${weekList[4][1]} - ${weekList[4][2]}`
        }))
            .then(response => {
                console.log("Slack message sent:", response.data)
            })
            .catch((error) => {
                console.error("There was a slackMessage error!", error);
            })
    }

    const sendToSlack = () => {
        let numberOfVacationers = 0;
        let vacationersPerDay = []

        axios.get(`${process.env.REACT_APP_ADDRESS}/vacationeramount?start=${nextMonday.toISOString()}&end=${nextFriday.toISOString()}`)
            .then((response) => {
                numberOfVacationers = response.data.length;
                axios.get(`${process.env.REACT_APP_ADDRESS}/timespan?start=${nextMonday.toISOString()}&end=${nextFriday.toISOString()}`)
                    .then((response) => {
                        console.log("response", response.data)
                        vacationersPerDay = response.data;
                        slackMessage(numberOfVacationers, vacationersPerDay)
                    })
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
            <h3>User</h3>
            <UserForm emptySelections={emptySelections} selectedUser={selectedUser} setSelectedUser={setSelectedUser} setCompletedAction={setCompletedAction} completedAction={completedAction} vacationers={vacationers}/>
            <h3>Team</h3>
            <TeamForm emptySelections={emptySelections} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} selectedMember={selectedMember} setSelectedMember={setSelectedMember} setCompletedAction={setCompletedAction} completedAction={completedAction} vacationers={vacationers} teams={teams}/>
            <div>
                <InputLabel className={styles.extraMargin}>Test Slack</InputLabel>
                <Button onClick={sendToSlack} variant={"contained"}>
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
        </>
    )
}