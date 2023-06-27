import { Alert } from "@mui/material";
import styles from "./customalert.module.css";
import React from "react";
import PropTypes from "prop-types";

function CustomAlert({ text }) {
    return (
        <Alert severity="error" className={styles.alertText}>
            {text}
        </Alert>
    );
}

CustomAlert.propTypes = {
    text: PropTypes.string,
};

export default CustomAlert;
