import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import styles from "./combo.module.css";
import {Divider} from "@mui/material";

export default function Combo() {
    return (
        <div className={styles.content}>
            <Picker/>
            <Divider orientation={"vertical"} flexItem={true} absolute={false}/>
            <Calendar/>
        </div>
    )
}