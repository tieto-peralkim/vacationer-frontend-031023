import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, InputLabel, Slider, TextField } from "@mui/material";
import styles from "./admin.module.css";
import TeamForm from "./Components/TeamForm";
import Typography from "@mui/material/Typography";
import UserForm from "./Components/UserForm";
import AlertDialog from "../Dialogs/AlertDialog";

// TODO: add employee amount and minimum amount
export default function Admin() {
    const [vacationers, setVacationers] = useState([]);
    const [teams, setTeams] = useState([]);
    const WORKER_LIMIT_DEFAULT = 12;
    const [workerLimit, setWorkerLimit] = useState(WORKER_LIMIT_DEFAULT);
    const [completedAction, setCompletedAction] = useState(false);
    const [selectedMember, setSelectedMember] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [openAPIError, setOpenAPIError] = useState(false);

    const emptySelections = () => {
        setSelectedMember("");
        setSelectedTeam("");
        setSelectedUser("");
    };

    const handleOpenAPIError = () => {
        setOpenAPIError(true);
    };
    const handleCloseAPIError = () => {
        setOpenAPIError(false);
    };

    const sendSlackMessage = () => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/slackMessageSender`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was a sendSlackMessage error!", error);
                handleOpenAPIError();
            });
    };

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers`)
            .then((response) => {
                setVacationers(response.data);
                console.log("vacationers", response.data);
            })
            .catch((error) => {
                console.error("There was a vacationers get error!", error);
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
                console.error("There was a teams get error!", error);
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
            <UserForm
                emptySelections={emptySelections}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                setCompletedAction={setCompletedAction}
                completedAction={completedAction}
                vacationers={vacationers}
            />
            <h3>Team</h3>
            <TeamForm
                emptySelections={emptySelections}
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
                selectedMember={selectedMember}
                setSelectedMember={setSelectedMember}
                setCompletedAction={setCompletedAction}
                completedAction={completedAction}
                vacationers={vacationers}
                teams={teams}
            />
            <div>
                <InputLabel className={styles.extraMargin}>
                    Test Slack
                </InputLabel>
                <Button onClick={sendSlackMessage} variant={"contained"}>
                    Send to Slack!
                </Button>
            </div>
            <AlertDialog
                openAlert={openAPIError}
                handleCloseAlert={handleCloseAPIError}
                handleAction={handleCloseAPIError}
                dialogTitle={"API Error"}
                dialogContent={"No connection to API, try again later"}
                confirm={"OK"}
            />
        </>
    );
}
