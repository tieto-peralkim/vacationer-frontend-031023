import Picker from "../Picker/Picker";
import Calendar from "../Calendar/Calendar";
import styles from "./combo.module.css";
import { Divider } from "@mui/material";
import { useState } from "react";

export default function Combo() {
    const [save, setSave] = useState(false);

    return (
        <div className={styles.content}>
            <Calendar save={save} setSave={setSave} />
            <Divider
                orientation={"horizontal"}
                flexItem={true}
                absolute={false}
            />
            <Picker save={save} setSave={setSave} />
        </div>
    );
}
