import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import styles from "./combo.module.css";
import { Divider } from "@mui/material";

export default function Combo() {
    return (
        <div className={styles.content}>
            <Calendar />
            <Divider
                orientation={"horizontal"}
                flexItem={true}
                absolute={false}
            />
            <Picker />
        </div>
    );
}
