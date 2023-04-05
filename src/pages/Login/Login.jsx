import styles from "./login.module.css";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Divider,
} from "@mui/material";
import { ExpandCircleDown } from "@mui/icons-material";

export default function Login() {
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
                    <Accordion
                        sx={{
                            width: "70%",
                        }}
                    >
                        <AccordionSummary
                            sx={{
                                bgcolor: "lightgreen",
                            }}
                            expandIcon={<ExpandCircleDown color="primary" />}
                        >
                            Troubleshoot failed login
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails>
                            <div>
                                <ol>
                                    <li>
                                        Create Github work credentials and
                                        request organizational access from
                                        admins.
                                    </li>

                                    <li>
                                        Confirm you are using Github work
                                        credentials, go to{" "}
                                        <a
                                            href={"https://github.com/"}
                                            target={"_blank"}
                                        >
                                            Github
                                        </a>{" "}
                                        and check your credentials first. Then
                                        retry.
                                    </li>
                                    <li>
                                        If login link doesn't connect, API might
                                        be down. Please inform the admins.
                                    </li>
                                </ol>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </div>
        </>
    );
}
