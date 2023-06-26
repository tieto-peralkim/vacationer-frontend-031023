import { Alert } from "@mui/material";
import styles from "./customalert.module.css";
import React from "react";

export default function CustomAlert({ text }) {
    return (
        <Alert severity="error" className={styles.alertText}>
            {text}
        </Alert>
    );
}
