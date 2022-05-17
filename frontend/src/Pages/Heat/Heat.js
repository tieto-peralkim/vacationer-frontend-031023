import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './styles.css'
import styles from "./heat.module.css";
import Typography from "@mui/material/Typography";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Slider,
    Switch
} from "@mui/material";


// Deprecated ******************************************
export default function Heat() {
    const INITIAL_NUMBER_OF_EMPLOYEES = 8
    const [startDate, setStartDate] = useState(new Date());
    const [firstAmount, setFirstAmount] = useState(0);
    const [secondAmount, setSecondAmount] = useState(0);
    const [thirdAmount, setThirdAmount] = useState(0);
    const [fourthAmount, setFourthAmount] = useState(0);
    const [fifthAmount, setFifthAmount] = useState(0);
    const [sliderValue, setSliderValue] = useState(0);

    const [firstLimit, setFirstLimit] = useState(1);
    const [secondLimit, setSecondLimit] = useState(2);
    const [thirdLimit, setThirdLimit] = useState(4);
    const [fourthLimit, setFourthLimit] = useState(6);
    const [fifthLimit, setFifthLimit] = useState(8);
    const [sixthLimit, setSixthLimit] = useState(10);
    const [employeeSettings, setEmployeeSettings] = useState(false);
    const themeColored =["chartreuse", "green", "orange", "darkred", "deeppink", "red", "white"]
    const themeBW = ["gainsboro", "darkgrey", "lightslategrey", "grey", "dimgrey", "black", "white" ]

    const [theme, setTheme] = useState(themeColored);

    const [topLimit, setTopLimit] = useState();

    const [highlightedRanges, setHighlightedRanges] = useState([])
    const [disabledRanges, setDisabledRanges] = useState([])

    // From https://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
    const daysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    }

    const triggerToggle = () => {
        if (theme.toString() === themeColored.toString()){
            setTheme(themeBW)
        }
        else if (theme.toString() === themeBW.toString()){
            setTheme(themeColored)
        }
    }

    const saveToGroup = (vacationerAmount, start) => {
        let dateGroup = [];

        console.log("Muuttujia", vacationerAmount, start, start instanceof Date, start.getUTCDate())
        let oneBefore = new Date(start);
        oneBefore.setUTCDate(start.getUTCDate() - 1)
        let oneAfter = new Date(start);
        oneAfter.setUTCDate(start.getUTCDate() + 1)
        let twoAfter = new Date(start);
        twoAfter.setUTCDate(start.getUTCDate() + 2)
        let threeAfter = new Date(start);
        threeAfter.setUTCDate(start.getUTCDate() + 3)
        let fourAfter = new Date(start);
        fourAfter.setUTCDate(start.getUTCDate() + 4)
        let fiveAfter = new Date(start);
        fiveAfter.setUTCDate(start.getUTCDate() + 5)
        let sixAfter = new Date(start);
        sixAfter.setUTCDate(start.getUTCDate() + 6)

        if (start.getUTCDate() === 28) {
            switch (daysInMonth(start.getUTCMonth() + 1, start.getUTCFullYear())) {
                case 29:
                    dateGroup.push(start)
                    break;
                case 30:
                    dateGroup.push(start, oneAfter)
                    break;
                case 31:
                    dateGroup.push(start, oneAfter, twoAfter)
                    break;
            }
        } else {
            console.log("starttiii", start)
            dateGroup.push(start, oneAfter, twoAfter, threeAfter, fourAfter, fiveAfter, sixAfter)
        }


        if (vacationerAmount >= sixthLimit){
            let disabledDateGroup = [];
            disabledDateGroup.start = oneBefore
            disabledDateGroup.end = sixAfter
            setDisabledRanges((oldDisabled) => [...oldDisabled, disabledDateGroup])
        }
        else {
            let obj1 = {}
            switch (true) {
                case vacationerAmount < firstLimit:
                    obj1[theme[0]] = dateGroup
                    break;
                case vacationerAmount >= firstLimit && vacationerAmount < secondLimit:
                    obj1[theme[1]] = dateGroup
                    break;
                case vacationerAmount >= secondLimit && vacationerAmount < thirdLimit:
                    obj1[theme[2]] = dateGroup
                    break;
                case vacationerAmount >= thirdLimit && vacationerAmount < fourthLimit:
                    obj1[theme[3]] = dateGroup
                    break;
                case vacationerAmount >= fourthLimit && vacationerAmount < fifthLimit:
                    obj1[theme[4]] = dateGroup
                    break;
                case vacationerAmount >= fifthLimit && vacationerAmount < sixthLimit:
                    obj1[theme[5]] = dateGroup
                    break;
            }
            setHighlightedRanges((oldHighlighted) => [...oldHighlighted, obj1])
        }
    }

    const makeDisappear = (first, last) => {
        let dateGroup = []
        console.log("kaaak", last)
        let today = new Date(last);
        let oneAfter = new Date(last);
        oneAfter.setUTCDate(last.getUTCDate() + 1)
        let twoAfter = new Date(last);
        twoAfter.setUTCDate(last.getUTCDate() + 2)
        let threeAfter = new Date(last);
        threeAfter.setUTCDate(last.getUTCDate() + 3)
        let fourAfter = new Date(last);
        fourAfter.setUTCDate(last.getUTCDate() + 4)
        let fiveAfter = new Date(last);
        fiveAfter.setUTCDate(last.getUTCDate() + 5)


        let oneBefore = new Date(first);
        oneBefore.setUTCDate(first.getUTCDate() - 1)
        let twoBefore = new Date(first);
        twoBefore.setUTCDate(first.getUTCDate() - 2)
        let threeBefore = new Date(first);
        threeBefore.setUTCDate(first.getUTCDate() - 3)
        let fourBefore = new Date(first);
        fourBefore.setUTCDate(first.getUTCDate() - 4)
        let fiveBefore = new Date(first);
        fiveBefore.setUTCDate(first.getUTCDate() - 5)
        let sixBefore = new Date(first);
        sixBefore.setUTCDate(first.getUTCDate() - 6)
        console.log("kaaak", today, oneAfter, twoAfter, threeAfter, fourAfter, fiveAfter, "ja", oneBefore, twoBefore, threeBefore, fourBefore, fiveBefore, sixBefore)
        dateGroup.push(today, oneAfter, twoAfter, threeAfter, fourAfter, fiveAfter, oneBefore, twoBefore, threeBefore, fourBefore, fiveBefore, sixBefore)

        let obj1 = {}
        obj1[theme[6]] = dateGroup
        setHighlightedRanges((oldHighlighted) => [...oldHighlighted, obj1])
    }

    const getFirst = (firstDate, secondDate) => {
        axios.get(`http://localhost:3001/timespan?start=${firstDate.toISOString()}&end=${secondDate.toISOString()}`).then((response) => {
            saveToGroup(response.data.length, firstDate)
            setFirstAmount(response.data.length);
        });
    }

    const getSecond = (secondDate, thirdDate) => {
        axios.get(`http://localhost:3001/timespan?start=${secondDate.toISOString()}&end=${thirdDate.toISOString()}`).then((response) => {
            saveToGroup(response.data.length, secondDate)
            setSecondAmount(response.data.length);
        });
    }

    const getThird = (thirdDate, fourthDate) => {
        axios.get(`http://localhost:3001/timespan?start=${thirdDate.toISOString()}&end=${fourthDate.toISOString()}`).then((response) => {
            saveToGroup(response.data.length, thirdDate)
            setThirdAmount(response.data.length);
        });
    }

    const getFourth = (fourthDate, fifthDate) => {
        axios.get(`http://localhost:3001/timespan?start=${fourthDate.toISOString()}&end=${fifthDate.toISOString()}`).then((response) => {
            saveToGroup(response.data.length, fourthDate)
            setFourthAmount(response.data.length);
        });
    }

    const getFifth = (fifthDate, sixthDate) => {
        axios.get(`http://localhost:3001/timespan?start=${fifthDate.toISOString()}&end=${sixthDate.toISOString()}`).then((response) => {
            saveToGroup(response.data.length, fifthDate)
            setFifthAmount(response.data.length);
        });
    }

    useEffect(() => {
        setSliderValue(INITIAL_NUMBER_OF_EMPLOYEES)
        selectEmployeeAmount(INITIAL_NUMBER_OF_EMPLOYEES)
        setStartDate(new Date())
    }, [])


    const selectEmployeeAmount = (amount) => {
        setTopLimit(amount)
        setFirstLimit(Math.floor(amount * (13 / 100)))
        setSecondLimit(Math.floor(amount * (26 / 100)))
        setThirdLimit(Math.floor(amount / 2))
        setFourthLimit(Math.floor(amount * (62 / 100)))
        setFifthLimit(Math.floor(amount * (74 / 100)))
        setSixthLimit(Math.floor(amount * (86 / 100)))
    }

    useEffect(() => {
        setDisabledRanges([])
        startDate.setUTCHours(12, 0, 0, 0)
        setHighlightedRanges((oldHighlighted) => [])
        console.log("date", startDate.toISOString());

        // 1st day of the month
        let first = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), 2);
        first.setUTCHours(12)
        console.log("yksi", first.toISOString());

        // 7th day of the month
        let second = new Date(startDate);
        second.setUTCHours(23, 59, 59)
        second.setUTCDate(first.getUTCDate() + 6);
        getFirst(first, second);
        console.log("kaksi", second.toISOString());

        // 14th day of the month
        let third = new Date(startDate);
        third.setUTCHours(23, 59, 59)
        third.setUTCDate(second.getUTCDate() + 7);
        getSecond(second, third);
        console.log("kolme", third.toISOString());

        // 21st day of the month
        let fourth = new Date(startDate);
        fourth.setUTCHours(23, 59, 59)
        fourth.setUTCDate(third.getUTCDate() + 7);
        getThird(third, fourth);
        console.log("neljä", fourth.toISOString());

        // 28th day of the month
        let fifth = new Date(startDate);
        fifth.setUTCHours(23, 59, 59)
        fifth.setUTCDate(fourth.getUTCDate() + 7);
        getFourth(fourth, fifth);
        console.log("viisi", fifth.toISOString());

        // Last day of the month (same as fifth for FEB)
        let sixth = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 1);
        sixth.setUTCHours(23, 59, 59)
        getFifth(fifth, sixth);
        console.log("kuusi", sixth.toISOString());
        console.log("limits", firstLimit, secondLimit, thirdLimit, fourthLimit, fifthLimit, sixthLimit)

        makeDisappear(first, sixth)
    }, [startDate, topLimit, theme])




    return (
        <div>
            <h1>Heat</h1>
            <div>Vacationer amount</div>
            <FormGroup>
                <FormControlLabel control={<Switch  onChange={triggerToggle}/>} label="Black and white theme" />
            </FormGroup>
            <div>Amount of employees <b>{topLimit}</b></div>
            <Button variant="contained" color="primary"
                    onClick={() => setEmployeeSettings(true)}>Change the number of employees</Button>
            <Dialog open={employeeSettings} onClose={() => setEmployeeSettings(false)}>
                <DialogTitle>
                    Change number of employees
                </DialogTitle>
                <DialogContent>
                    <Box className={styles.sliderBox}>
                        <Typography>
                            Amount of employees <b>{sliderValue}</b>
                        </Typography>
                        <Slider
                            className={styles.slider}
                            value={sliderValue}
                            min={5}
                            max={40}
                            onChange={(e) => setSliderValue(e.target.value)}
                        />
                        <Button variant="contained" color="primary"
                                onClick={() => {
                                    selectEmployeeAmount(sliderValue);
                                    setEmployeeSettings(false);
                                }}>Save
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <div className={styles.heatmap}>
                <DatePicker
                    selected={startDate}
                    value={startDate}
                    onChange={e => setStartDate(e)}
                    onMonthChange={e => setStartDate(e)}
                    inline
                    calendarStartDay={1}
                    highlightDates={highlightedRanges}
                    excludeDateIntervals={disabledRanges}
                    disabledKeyboardNavigation
                />
                <div className={styles.coloredNumbers}>
                    <div>Employees on vacation:</div>
                    <div className={theme[0]}>0</div>
                    <div
                        className={theme[1]}>{firstLimit} {(secondLimit - firstLimit > 1) && <>{" - "} {secondLimit - 1}</>}</div>
                    <div
                        className={theme[2]}>{secondLimit}{(thirdLimit - secondLimit > 1) && <>{" - "} {thirdLimit - 1}</>}</div>
                    <div
                        className={theme[3]}>{thirdLimit}{(fourthLimit - thirdLimit > 1) && <>{" - "} {fourthLimit - 1}</>}</div>
                    <div
                        className={theme[4]}>{fourthLimit}{(fifthLimit - fourthLimit > 1) && <>{" - "} {fifthLimit - 1}</>}</div>
                    <div
                        className={theme[5]}>{fifthLimit}{(sixthLimit - fifthLimit > 1) && <>{" - "} {sixthLimit - 1}</>}</div>
                    <div>>{sixthLimit} disabled</div>
                </div>
            </div>

            <div>{firstAmount && firstAmount}</div>
            <div>{secondAmount && secondAmount}</div>
            <div>{thirdAmount && thirdAmount}</div>
            <div>{fourthAmount && fourthAmount}</div>
            <div>{fifthAmount && fifthAmount}</div>
        </div>
    );
}
