import {useEffect, useState} from "react";
import axios from "axios";
import {Box, Button, InputLabel, Slider,} from "@mui/material";
import styles from "./admin.module.css";
import TeamForm from "./Components/TeamForm";
import Typography from "@mui/material/Typography";
import UserForm from "./Components/UserForm";

// Tähän pitäisi lisätä työntekijämäärien asetukset (määrä, minimimäärä)
export default function Admin() {

    const [vacationers, setVacationers] = useState([]);

    const WORKER_LIMIT_DEFAULT = 12;
    const [workerLimit, setWorkerLimit] = useState(WORKER_LIMIT_DEFAULT);
    const [completedAction, setCompletedAction] = useState(false)

    // Slack dates
    const today = new Date();
    today.setUTCHours(0, 0, 0)
    const nextMonday = new Date();
    nextMonday.setUTCDate(
        today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
    );
    nextMonday.setUTCHours(12, 0, 0, 0);
    const nextFriday = new Date();
    nextFriday.setTime(nextMonday.getTime() + 4 * 24 * 60 * 60 * 1000);
    nextFriday.setUTCHours(12, 0, 0, 0);

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setVacationers(response.data);
            console.log("vacationers", response.data);
        })
            .catch((error) => {
                console.log("There was a vacationers get error!", error)
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
    }

    const sendToSlack = () => {
        let numberOfVacationers = 0;
        let vacationersPerDay = []

        axios.get(`http://localhost:3001/vacationeramount?start=${nextMonday.toISOString()}&end=${nextFriday.toISOString()}`)
            .then((response) => {
                numberOfVacationers = response.data.length;
                axios.get(`http://localhost:3001/timespan?start=${nextMonday.toISOString()}&end=${nextFriday.toISOString()}`)
                    .then((response) => {
                        console.log("response", response.data)
                        vacationersPerDay = response.data;
                    })
                    .then(() =>
                        slackMessage(numberOfVacationers, vacationersPerDay)
                            .then((response) => {
                                console.log("response", response)
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
            <h3>User</h3>
            <UserForm setCompletedAction={setCompletedAction} completedAction={completedAction} vacationers={vacationers}/>
            <h3>Team</h3>
            <TeamForm vacationers={vacationers}/>
            <div>
                <InputLabel className={styles.extraMargin}>Test Slack</InputLabel>
                <Button onClick={sendToSlack} variant={"contained"}>
                    Send to Slack!
                </Button>
            </div>
        </>
    )
}