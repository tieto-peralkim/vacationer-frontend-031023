import { forwardRef, useEffect, useMemo, useState } from "react";
import { useTable } from "react-table";
import axios from "axios";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    stepLabelClasses,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import styles from "./calendar.module.css";
import { useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";

export default function Calendar({ save, setSave }) {
    const location = useLocation();
    const today = new Date();
    const thisMonthFirst = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
        15
    );
    thisMonthFirst.setUTCHours(0, 0, 0, 0);
    console.log("thisMonthFirst", thisMonthFirst);
    const [allHolidaysSelectedTime, setAllHolidaysSelectedTime] = useState([]);

    const [holidayColor, setHolidayColor] = useState("#73D8FF");
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] =
        useState("#64F3EA");
    const [weekendColor, setWeekendColor] = useState("#928F8F");
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("#D8D8D8");
    const holidaySymbols = ["X", "Y"];

    const [replacementText, setReplacementText] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const WORKER_TITLE = "Employees at work";
    const PRESENCE_PERCENTAGE = 0.5;
    const TODAY_COLOR = "#e30f2d";

    const [selectedDate, setSelectedDate] = useState(thisMonthFirst);
    const [selectedYear, setSelectedYear] = useState(
        thisMonthFirst.getFullYear()
    );
    const [publicHolidaysOfMonth, setPublicHolidaysOfMonth] = useState([]);
    const [publicHolidays, setPublicHolidays] = useState(
        thisMonthFirst.getFullYear()
    );

    const hiddenColumns = [];
    const [teams, setTeams] = useState([]);
    const [teamToShow, setTeamToShow] = useState("");
    const [selectedVacationers, setSelectedVacationers] = useState([]);
    const [allMonthsVacationers, setAllMonthsVacationers] = useState([]);
    const [totalVacationers, setTotalVacationers] = useState([]);

    useEffect(() => {
        if (location.state) {
            setHolidayColor(location.state.holidayColor);
            setWeekendHolidayColor(location.state.weekendHolidayColor);
            setWeekendColor(location.state.weekendColor);
        }
    }, []);

    // Fetching Finnish public holidays from Public holiday API (https://date.nager.at/)
    useEffect(() => {
        axios
            .get(
                `https://date.nager.at/api/v3/publicholidays/${selectedYear}/FI`
            )
            .then((response) => {
                let publicDays = [];
                for (let i = 0; i < response.data.length; i++) {
                    let publicDay = {};
                    publicDay["month"] = parseInt(
                        response.data[i].date.slice(5, 7)
                    );
                    publicDay["day"] = parseInt(
                        response.data[i].date.slice(8, 10)
                    );
                    publicDays.push(publicDay);
                }
                setPublicHolidays(publicDays);
                console.log("publicDays", publicDays);
            })
            .catch((error) => {
                console.error("There was a get error!", error);
            });
    }, [selectedYear]);

    useEffect(() => {
        if (teamToShow) {
            console.log("filterByTeam:", teamToShow);

            let filteredVacations = [];
            for (let i = 0; i < teamToShow.members.length; i++) {
                // Filter the team's holidays from all the holidays of the month
                const filteredVacation = selectedVacationers.filter(
                    (vacationer) =>
                        vacationer.name === teamToShow.members[i].name
                );
                if (filteredVacation.length !== 0) {
                    filteredVacations.push(filteredVacation);
                }
            }
            // An array of arrays to an array
            filteredVacations = filteredVacations.flat();
            console.log("filteredVacations", filteredVacations);
            setMonthsHolidays(filteredVacations);
        } else {
            console.log("filterByTeam: no");
            setMonthsHolidays(selectedVacationers);
        }
    }, [teamToShow, selectedVacationers]);

    // Fetching teams from DB
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/teams`)
            .then((response) => {
                setTeams(response.data);
                console.log("TEAMS", response.data);
            })
            .catch((error) => {
                console.log("There was a teams get error!", error);
            });
    }, []);

    useEffect(() => {
        // If year changes, fetch public holidays
        if (selectedDate.getFullYear() !== selectedYear) {
            setSelectedYear(selectedDate.getFullYear());
        }
        let publicMonthsHolidays = [];
        // This could be more effective
        for (let i = 0; i < publicHolidays.length; i++) {
            if (publicHolidays[i].month === selectedDate.getMonth() + 1) {
                publicMonthsHolidays.push(publicHolidays[i].day);
            }
        }
        console.log("publicMonthsHolidays", publicMonthsHolidays);
        setPublicHolidaysOfMonth(publicMonthsHolidays);
    }, [selectedDate, publicHolidays]);

    const getHolidaysOfMonth = (nextMonth) => {
        axios
            .get(
                `${
                    process.env.REACT_APP_ADDRESS
                }/holidaysbetween?start=${selectedDate.toISOString()}&end=${nextMonth.toISOString()}`
            )
            .then((response) => {
                setSelectedVacationers(response.data);
                setAllMonthsVacationers(response.data);
                console.log("response:", response.data);
                setShowSpinner(false);
            })
            .catch((error) => {
                setReplacementText("Sorry, no connection to database");
                console.error("There was a get error!", error);
                setShowSpinner(false);
            });
    };

    const setMonthsHolidays = (vacationers) => {
        let pureVacations = [];
        for (let i = 0; i < vacationers.length; i++) {
            let holidayObject = {};
            if (vacationers[i].name.length > 13) {
                holidayObject.name = vacationers[i].name.slice(0, 13) + "...";
            } else {
                holidayObject.name = vacationers[i].name;
            }
            holidayObject.start = vacationers[i].vacations.start;
            holidayObject.end = vacationers[i].vacations.end;
            holidayObject.comment = vacationers[i].vacations.comment;
            holidayObject.id = vacationers[i].vacations._id;

            let repeatingHolidayer;
            repeatingHolidayer = pureVacations.find(
                (holiday) => holiday.name === holidayObject.name
            );
            console.log("repeatingHolidayer", vacationers[i].vacations);
            console.log("vacationers[i].vacations", vacationers[i].vacations);

            if (repeatingHolidayer) {
                setNumbers(
                    repeatingHolidayer,
                    new Date(vacationers[i].vacations.start),
                    new Date(vacationers[i].vacations.end),
                    vacationers[i].vacations.confirmed
                );
                let index = pureVacations.findIndex(
                    (holiday) => holiday.name === holidayObject.name
                );
                pureVacations[index] = repeatingHolidayer;
            } else {
                setNumbers(
                    holidayObject,
                    new Date(vacationers[i].vacations.start),
                    new Date(vacationers[i].vacations.end),
                    vacationers[i].vacations.confirmed
                );
                pureVacations.push(holidayObject);
            }
        }
        // Last row of the table: amount of working vacationers
        pureVacations.push({
            name: WORKER_TITLE,
            one: getWorkerAmount(pureVacations, "one"),
            two: getWorkerAmount(pureVacations, "two"),
            three: getWorkerAmount(pureVacations, "three"),
            four: getWorkerAmount(pureVacations, "four"),
            five: getWorkerAmount(pureVacations, "five"),
            six: getWorkerAmount(pureVacations, "six"),
            seven: getWorkerAmount(pureVacations, "seven"),
            eight: getWorkerAmount(pureVacations, "eight"),
            nine: getWorkerAmount(pureVacations, "nine"),
            ten: getWorkerAmount(pureVacations, "ten"),
            eleven: getWorkerAmount(pureVacations, "eleven"),
            twelve: getWorkerAmount(pureVacations, "twelve"),
            thirteen: getWorkerAmount(pureVacations, "thirteen"),
            fourteen: getWorkerAmount(pureVacations, "fourteen"),
            fifteen: getWorkerAmount(pureVacations, "fifteen"),
            sixteen: getWorkerAmount(pureVacations, "sixteen"),
            seventeen: getWorkerAmount(pureVacations, "seventeen"),
            eighteen: getWorkerAmount(pureVacations, "eighteen"),
            nineteen: getWorkerAmount(pureVacations, "nineteen"),
            twenty: getWorkerAmount(pureVacations, "twenty"),
            twentyone: getWorkerAmount(pureVacations, "twentyone"),
            twentytwo: getWorkerAmount(pureVacations, "twentytwo"),
            twentythree: getWorkerAmount(pureVacations, "twentythree"),
            twentyfour: getWorkerAmount(pureVacations, "twentyfour"),
            twentyfive: getWorkerAmount(pureVacations, "twentyfive"),
            twentysix: getWorkerAmount(pureVacations, "twentysix"),
            twentyseven: getWorkerAmount(pureVacations, "twentyseven"),
            twentyeight: getWorkerAmount(pureVacations, "twentyeight"),
            twentynine: getWorkerAmount(pureVacations, "twentynine"),
            thirty: getWorkerAmount(pureVacations, "thirty"),
            thirtyone: getWorkerAmount(pureVacations, "thirtyone"),
        });
        console.log("pureVacations", pureVacations);
        setAllHolidaysSelectedTime(pureVacations);
    };

    const getWorkerAmount = (data, key) => {
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            if (holidaySymbols.includes(data[i][key])) {
                total++;
            }
        }
        // If a team has been selected
        if (teamToShow) {
            console.log("Total", total, teamToShow.members.length);
            return teamToShow.members.length - total;
        } else {
            console.log(
                "totalVacationers",
                key,
                ":",
                totalVacationers.length,
                total
            );
            return totalVacationers.length - total;
        }
    };

    // Sets the start and end date of holidays for shown calendar month
    const setNumbers = (holidayObject, start, end, confirmedHoliday) => {
        console.log("setNumbers", start.getDate(), end, confirmedHoliday);

        let symbolToUse;
        let startingNumber = 0;
        let endingNumber = 0;

        if (!confirmedHoliday) {
            symbolToUse = "Y";
        } else {
            symbolToUse = "X";
        }

        // Voidaanko lyhentää?
        if (start.getMonth() === end.getMonth()) {
            startingNumber = start.getDate();
            endingNumber = end.getDate();
        } else if (
            start.getMonth() !== selectedDate.getMonth() &&
            end.getMonth() !== selectedDate.getMonth()
        ) {
            startingNumber = 1;
            endingNumber = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0
            ).getDate();
        } else if (start.getMonth() !== selectedDate.getMonth()) {
            startingNumber = 1;
            endingNumber = end.getDate();
        } else if (start.getMonth() === selectedDate.getMonth()) {
            startingNumber = start.getDate();
            endingNumber = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0
            ).getDate();
        }

        console.log(
            "startingNumber, endingNumber",
            startingNumber,
            endingNumber
        );
        for (let i = startingNumber; i <= endingNumber; i++) {
            switch (i) {
                case 1:
                    holidayObject.one = symbolToUse;
                    break;
                case 2:
                    holidayObject.two = symbolToUse;
                    break;
                case 3:
                    holidayObject.three = symbolToUse;
                    break;
                case 4:
                    holidayObject.four = symbolToUse;
                    break;
                case 5:
                    holidayObject.five = symbolToUse;
                    break;
                case 6:
                    holidayObject.six = symbolToUse;
                    break;
                case 7:
                    holidayObject.seven = symbolToUse;
                    break;
                case 8:
                    holidayObject.eight = symbolToUse;
                    break;
                case 9:
                    holidayObject.nine = symbolToUse;
                    break;
                case 10:
                    holidayObject.ten = symbolToUse;
                    break;
                case 11:
                    holidayObject.eleven = symbolToUse;
                    break;
                case 12:
                    holidayObject.twelve = symbolToUse;
                    break;
                case 13:
                    holidayObject.thirteen = symbolToUse;
                    break;
                case 14:
                    holidayObject.fourteen = symbolToUse;
                    break;
                case 15:
                    holidayObject.fifteen = symbolToUse;
                    break;
                case 16:
                    holidayObject.sixteen = symbolToUse;
                    break;
                case 17:
                    holidayObject.seventeen = symbolToUse;
                    break;
                case 18:
                    holidayObject.eighteen = symbolToUse;
                    break;
                case 19:
                    holidayObject.nineteen = symbolToUse;
                    break;
                case 20:
                    holidayObject.twenty = symbolToUse;
                    break;
                case 21:
                    holidayObject.twentyone = symbolToUse;
                    break;
                case 22:
                    holidayObject.twentytwo = symbolToUse;
                    break;
                case 23:
                    holidayObject.twentythree = symbolToUse;
                    break;
                case 24:
                    holidayObject.twentyfour = symbolToUse;
                    break;
                case 25:
                    holidayObject.twentyfive = symbolToUse;
                    break;
                case 26:
                    holidayObject.twentysix = symbolToUse;
                    break;
                case 27:
                    holidayObject.twentyseven = symbolToUse;
                    break;
                case 28:
                    holidayObject.twentyeight = symbolToUse;
                    break;
                case 29:
                    holidayObject.twentynine = symbolToUse;
                    break;
                case 30:
                    holidayObject.thirty = symbolToUse;
                    break;
                case 31:
                    holidayObject.thirtyone = symbolToUse;
                    break;
            }
        }
    };

    // Hide last days depending on the month lengths (0-11)
    useEffect(() => {
        setShowSpinner(true);
        setReplacementText("");
        // Leap year February
        if (
            ((selectedDate.getFullYear() % 4 === 0 &&
                selectedDate.getFullYear() % 100 !== 0) ||
                selectedDate.getFullYear() % 400 === 0) &&
            selectedDate.getMonth() === 1
        ) {
            setHiddenColumns(["thirty", "thirtyone"]);
        } else {
            switch (selectedDate.getMonth()) {
                case 1:
                    setHiddenColumns(["twentynine", "thirty", "thirtyone"]);
                    break;
                case 0:
                case 2:
                case 4:
                case 6:
                case 7:
                case 9:
                case 11:
                    setHiddenColumns([]);
                    break;
                case 3:
                case 5:
                case 8:
                case 10:
                    setHiddenColumns(["thirtyone"]);
                    break;
            }
        }

        let nextMonth = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            1
        );
        nextMonth.setUTCHours(23, 59, 59, 999);

        // Fetching total number of vacationers in DB
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/vacationers/total`)
            .then((response) => {
                setTotalVacationers(response.data);
                console.log("total response", response.data);
                getHolidaysOfMonth(nextMonth);
            })
            .catch((error) => {
                console.error("There was a totalvacationers get error!", error);
            });
    }, [selectedDate, save]);

    // const EditableCell = ({
    //     value: initialValue,
    //     row: { index },
    //     column: { id },
    // }) => {
    //     const [value, setValue] = useState(initialValue)
    //
    //     const onClick = () => {
    //         setValue(true)
    //         console.log("onClick")
    //     }
    //     useEffect(() =>{
    //         setValue(initialValue)
    //     }, [initialValue])
    //
    //     return <button value={value} onClick={onClick}/>
    // }
    //
    // const defaultColumn = {
    //     Cell: EditableCell,
    // }

    const columns = useMemo(
        () => [
            {
                Header: "Name",
                accessor: "name",
            },
            {
                Header: "01",
                accessor: "one",
            },
            {
                Header: "02",
                accessor: "two",
            },
            {
                Header: "03",
                accessor: "three",
            },
            {
                Header: "04",
                accessor: "four",
            },
            {
                Header: "05",
                accessor: "five",
            },
            {
                Header: "06",
                accessor: "six",
            },
            {
                Header: "07",
                accessor: "seven",
            },
            {
                Header: "08",
                accessor: "eight",
            },
            {
                Header: "09",
                accessor: "nine",
            },
            {
                Header: "10",
                accessor: "ten",
            },
            {
                Header: "11",
                accessor: "eleven",
            },
            {
                Header: "12",
                accessor: "twelve",
            },
            {
                Header: "13",
                accessor: "thirteen",
            },
            {
                Header: "14",
                accessor: "fourteen",
            },
            {
                Header: "15",
                accessor: "fifteen",
            },
            {
                Header: "16",
                accessor: "sixteen",
            },
            {
                Header: "17",
                accessor: "seventeen",
            },
            {
                Header: "18",
                accessor: "eighteen",
            },
            {
                Header: "19",
                accessor: "nineteen",
            },
            {
                Header: "20",
                accessor: "twenty",
            },
            {
                Header: "21",
                accessor: "twentyone",
            },
            {
                Header: "22",
                accessor: "twentytwo",
            },
            {
                Header: "23",
                accessor: "twentythree",
            },
            {
                Header: "24",
                accessor: "twentyfour",
            },
            {
                Header: "25",
                accessor: "twentyfive",
            },
            {
                Header: "26",
                accessor: "twentysix",
            },
            {
                Header: "27",
                accessor: "twentyseven",
            },
            {
                Header: "28",
                accessor: "twentyeight",
            },
            {
                Header: "29",
                accessor: "twentynine",
            },
            {
                Header: "30",
                accessor: "thirty",
            },
            {
                Header: "31",
                accessor: "thirtyone",
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setHiddenColumns,
    } = useTable({
        columns,
        data: allHolidaysSelectedTime,
        // defaultColumn,
        initialState: {
            hiddenColumns: hiddenColumns,
        },
    });

    const changeMonth = (amount) => {
        let newMonth;
        if (amount > 0) {
            newMonth = selectedDate.getMonth() + 1;
        } else {
            newMonth = selectedDate.getMonth() - 1;
        }

        let newDate = new Date(selectedDate.getFullYear(), newMonth, 1, 15);
        newDate.setUTCHours(0, 0, 0, 0);
        console.log("newDate1", newDate);

        setSelectedDate(newDate);
    };

    // Tätä voisi selkeyttää ja tehostaa
    const isCommonHoliday = (holiday, index) => {
        let colorToAdd = null;
        console.log("holiday, index", holiday, index);

        if (holiday === WORKER_TITLE) {
            colorToAdd = "bisque";
        }
        if (index !== 0) {
            if (holiday === "X") {
                colorToAdd = holidayColor;
            } else if (holiday === "Y") {
                colorToAdd = unConfirmedHolidayColor;
            }
            let dateToCheck = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                index
            );

            // Saturday or Sunday
            if (dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6) {
                if (holidaySymbols.includes(holiday)) {
                    colorToAdd = weekendHolidayColor;
                } else {
                    colorToAdd = weekendColor;
                }
            }

            // Public holidays
            if (publicHolidaysOfMonth.filter((e) => e === index).length > 0) {
                if (holidaySymbols.includes(holiday)) {
                    colorToAdd = weekendHolidayColor;
                } else {
                    colorToAdd = weekendColor;
                }
            }

            // Employees row

            if (typeof holiday === "number") {
                colorToAdd = "bisque";
                if (
                    !teamToShow &&
                    holiday < PRESENCE_PERCENTAGE * totalVacationers.length
                ) {
                    colorToAdd = "orange";
                }
                if (
                    teamToShow &&
                    holiday < PRESENCE_PERCENTAGE * teamToShow.members.length
                ) {
                    colorToAdd = "orange";
                }
            }
        }
        return colorToAdd;
    };

    const setBold = (value) => {
        if (typeof value === "number" || value === WORKER_TITLE) {
            return "bold";
        }
        return null;
    };

    const setTodayHeader = (header) => {
        console.log("setTodayHeader", header, selectedDate.getDate());
        if (
            today.getFullYear() === selectedDate.getFullYear() &&
            today.getMonth() === selectedDate.getMonth() &&
            header == today.getDate()
        ) {
            return TODAY_COLOR;
        } else {
            return "aliceblue";
        }
    };

    const setTodayColumn = (value) => {
        console.log("setTodayColumn", value);
        if (
            today.getFullYear() === selectedDate.getFullYear() &&
            today.getMonth() === selectedDate.getMonth() &&
            parseInt(value.Header) === today.getDate()
        ) {
            return `solid 2px ${TODAY_COLOR}`;
        } else {
            return "solid 1px black";
        }
    };

    const MonthInputButton = forwardRef(({ value, onClick }) => (
        <Button onClick={onClick}>
            {selectedDate.toLocaleString("en-GB", {
                month: "long",
                year: "numeric",
            })}
        </Button>
    ));

    return (
        <>
            <div className={styles.wholeCalendar}>
                <div className={styles.header}>
                    <div className={styles.teamChips}>
                        <Chip
                            className={styles.oneTeamChip}
                            variant={!teamToShow ? "" : "outlined"}
                            label="All teams"
                            color="secondary"
                            onClick={() => {
                                setMonthsHolidays(allMonthsVacationers);
                                setTeamToShow("");
                            }}
                        />
                        Filter by team:
                        {teams.map((team) => (
                            <Chip
                                className={styles.oneTeamChip}
                                variant={
                                    teamToShow.title === team.title
                                        ? ""
                                        : "outlined"
                                }
                                color="primary"
                                label={team.title}
                                onClick={() => {
                                    setTeamToShow(team);
                                    console.log("team", team);
                                }}
                            />
                        ))}
                        {teamToShow &&
                            teamToShow.members
                                // some sorting?
                                // .sort((v1, v2) => v1.name - v2.name)
                                .map((member) => <Chip label={member.name} />)}
                    </div>
                    <div className={styles.infoBox}>
                        X = confirmed holiday <br /> Y = un-confirmed holiday
                    </div>
                </div>
                <div className={styles.wholeCalendar}>
                    <Box className={styles.buttons}>
                        <Button
                            onClick={() => changeMonth(-1)}
                            startIcon={<ArrowBackIosIcon />}
                        >
                            Prev
                        </Button>
                        <div className={styles.monthSelection}>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                showFullMonthYearPicker
                                showFourColumnMonthYearPicker
                                customInput={<MonthInputButton />}
                            />
                        </div>
                        <Button
                            onClick={() => changeMonth(1)}
                            endIcon={<ArrowForwardIosIcon />}
                        >
                            Next
                        </Button>
                    </Box>
                    {allHolidaysSelectedTime.length > 0 && (
                        <table
                            {...getTableProps()}
                            style={{ border: "solid 1px blue" }}
                        >
                            <thead>
                                {headerGroups.map((headerGroup) => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column) => (
                                            <th
                                                {...column.getHeaderProps()}
                                                style={{
                                                    background: setTodayHeader(
                                                        column.Header
                                                    ),
                                                    color: "black",
                                                    width: "10px",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {column.render("Header")}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {rows.map((row) => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map((cell, index) => {
                                                console.log(
                                                    "info",
                                                    cell.value,
                                                    index
                                                );
                                                return (
                                                    <td
                                                        {...cell.getCellProps({
                                                            onClick: () => {
                                                                console.log(
                                                                    "loki1",
                                                                    cell.value
                                                                );
                                                                console.log(
                                                                    "loki2",
                                                                    cell.row
                                                                        .original
                                                                        .name,
                                                                    cell.column
                                                                        .Header
                                                                );
                                                            },
                                                        })}
                                                        style={{
                                                            fontWeight: setBold(
                                                                cell.value
                                                            ),
                                                            paddingTop: "0.5em",
                                                            paddingBottom:
                                                                "0.5em",
                                                            paddingLeft:
                                                                "0.5em",
                                                            paddingRight:
                                                                "0.5em",
                                                            height: "30px",
                                                            maxWidth: "100px",
                                                            border: setTodayColumn(
                                                                cell.column
                                                            ),
                                                            backgroundColor:
                                                                isCommonHoliday(
                                                                    cell.value,
                                                                    index
                                                                ),
                                                        }}
                                                    >
                                                        {cell.render("Cell")}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {showSpinner ? (
                        <CircularProgress />
                    ) : (
                        <p>{replacementText}</p>
                    )}
                </div>
            </div>
            <div>
                {location.state && `Väri: ${location.state.holidayColor}`}
            </div>
        </>
    );
}
