import React from "react";
import styles from "./login.module.css";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Divider,
} from "@mui/material";
import { useLocation } from "react-router-dom";

export default function Login() {
    interface LocationState {
        loginFailed: string;
    }
    const location = useLocation().state as LocationState;
    const loginFailed = location ? location.loginFailed : false;

    const handleClick = () => {
        window.location.replace(`${process.env.REACT_APP_ADDRESS}/login`);
    };
    return (
        <>
            <div>
                <div className={styles.content}>
                    <Button
                        className={styles.loginButton}
                        onClick={handleClick}
                        variant={"contained"}
                    >
                        Login
                    </Button>
                    {loginFailed && (
                        <>
                            <Accordion
                                sx={{
                                    width: "70%",
                                }}
                                expanded={true}
                            >
                                <AccordionSummary
                                    sx={{
                                        bgcolor: "orangered",
                                    }}
                                >
                                    Login failed.
                                </AccordionSummary>
                                <Divider />
                                <AccordionDetails
                                    className={styles.accordionDetails}
                                >
                                    <div>
                                        <ol>
                                            <li>
                                                Create Github work credentials
                                                and request organizational
                                                access from admins.
                                            </li>

                                            <li>
                                                Confirm you are using Github
                                                work credentials, go to{" "}
                                                <a
                                                    href={"https://github.com/"}
                                                    target={"_blank"}
                                                >
                                                    Github
                                                </a>{" "}
                                                and check your credentials
                                                first. Then retry.
                                            </li>
                                            <li>
                                                If login link does not connect,
                                                API might be down. Please inform
                                                the admins.
                                            </li>
                                        </ol>
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
