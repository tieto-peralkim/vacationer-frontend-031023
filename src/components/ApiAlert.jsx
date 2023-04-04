import { Alert } from "@mui/material";
import styles from "./apialert.module.css";

export default function ApiAlert() {
    return (
        <Alert severity="error" className={styles.alertAPI}>
            No connection to API, API is down
        </Alert>
    );
}
