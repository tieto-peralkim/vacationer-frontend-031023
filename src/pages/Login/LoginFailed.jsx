import styles from "./loginfailed.module.css";

export default function LoginFailed() {
    return (
        <>
            <div className={styles.content}>
                <h2>Login failed</h2>
                To try again, go to{" "}
                <a href={"https://github.com/"} target={"_blank"}>
                    Github
                </a>
                , logout and login with other user
            </div>
        </>
    );
}
