// These are for changing the page layout depending on the screen size.
import { useBreakpoint } from "styled-breakpoints/react-styled";
import { down } from "styled-breakpoints";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { useTable } from "react-table";
import axios from "axios";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    FormControlLabel,
    FormGroup,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import styles from "./calendar.module.css";
import DatePicker from "react-datepicker";

export default function Calendar({
    user,
    vacationersAmount,
    save,
    APIError,
    handleOpenAPIError,
    handleCloseAPIError,
}) {
    const isMobile = useBreakpoint(down("md")); // sm breakpoint activates when screen width <= 576px

    const today = new Date();
    const thisMonthFirst = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
        15
    );
    thisMonthFirst.setUTCHours(0, 0, 0, 0);
    const [allHolidaysSelectedTime, setAllHolidaysSelectedTime] = useState([]);
    const WORKER_TITLE = "Working";
    const ON_HOLIDAY_TITLE = "On holiday";
    const PRESENCE_PERCENTAGE = 0.5;
    const TODAY_COLOR = "#e30f2d";

    // HolidaySymbol can not be a number!
    const [holidaySymbols, setHolidaySymbols] = useState([]);

    const [holidayColor, setHolidayColor] = useState("");
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] = useState("");
    const [weekendColor, setWeekendColor] = useState("");
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("");

    const [showSpinner, setShowSpinner] = useState(false);
    const [showAllVacationers, setShowAllVacationers] = useState(false);

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
                console.error("There was a Public holiday API error!", error);
            });
    }, [selectedYear]);

    useEffect(() => {
        console.log("user Calendar", user);

        // Showing all employees of the selected team, not only the ones with holiday
        if (showAllVacationers && teamToShow) {
            console.log("showAllVacationers && teamToShow", teamToShow);
            setMonthsHolidays(filterHolidays(), teamToShow.members);
        }
        // Showing all vacationing employees of the selected team
        else if (teamToShow) {
            console.log("teamToShow:", teamToShow);
            setMonthsHolidays(filterHolidays());
        }
        // Showing all employees, not only the ones with holiday
        else if (showAllVacationers) {
            setMonthsHolidays(selectedVacationers, vacationersAmount);
        }
        // Showing all vacationing employees
        else {
            setMonthsHolidays(selectedVacationers);
        }
    }, [
        showAllVacationers,
        teamToShow,
        selectedVacationers,
        vacationersAmount,
        holidaySymbols,
    ]);

    // Setting calendar settings of selected user
    useEffect(() => {
        if (user.calendarSettings) {
            setHolidayColor(user.calendarSettings[0].holidayColor);
            setUnConfirmedHolidayColor(
                user.calendarSettings[0].unConfirmedHolidayColor
            );
            setWeekendColor(user.calendarSettings[0].weekendColor);
            setWeekendHolidayColor(
                user.calendarSettings[0].weekendHolidayColor
            );
            let newHolidaySymbols = [];
            newHolidaySymbols.push(user.calendarSettings[0].holidaySymbol);
            newHolidaySymbols.push(
                user.calendarSettings[0].unConfirmedHolidaySymbol
            );
            setHolidaySymbols(newHolidaySymbols);
        }
    }, [user]);

    // Fetching teams from DB
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_ADDRESS}/teams`, {
                withCredentials: true,
            })
            .then((response) => {
                setTeams(response.data);
                console.log("TEAMS", response.data);
                if (APIError) {
                    handleCloseAPIError();
                }
            })
            .catch((error) => {
                handleOpenAPIError();
                console.error("There was a teams get error!", error);
            });
    }, [save]);

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

    const filterHolidays = () => {
        console.log("flllt", selectedVacationers, teamToShow);
        let filteredVacations = [];
        for (let i = 0; i < teamToShow.members.length; i++) {
            // Filter the team's holidays from all the holidays of the month
            const filteredVacation = selectedVacationers.filter(
                (vacationer) => vacationer.name === teamToShow.members[i].name
            );
            if (filteredVacation.length !== 0) {
                filteredVacations.push(filteredVacation);
            }
        }
        // An array of arrays to an array
        filteredVacations = filteredVacations.flat();
        console.log("filteredVacations", filteredVacations);
        return filteredVacations;
    };

    // Retrieve the holidays of the selected month
    const getHolidaysOfMonth = (selectedMonth) => {
        axios
            .get(
                `${
                    process.env.REACT_APP_ADDRESS
                }/holidaysbetween?start=${selectedDate.toISOString()}&end=${selectedMonth.toISOString()}`,
                { withCredentials: true }
            )
            .then((response) => {
                setSelectedVacationers(response.data);
                console.log("response:", response.data);
                setShowSpinner(false);
                if (APIError) {
                    handleCloseAPIError();
                }
            })
            .catch((error) => {
                handleOpenAPIError();
                console.error("There was a get holidaysbetween error!", error);
                setShowSpinner(false);
            });
    };

    // Creates the employee rows, vacationingEmployees is the list of employees with holidays,
    // allEmployees is the list of employees with and without holidays
    const setMonthsHolidays = (vacationingEmployees, allEmployees) => {
        console.log("vaca1tioningEmployees", vacationingEmployees);
        console.log("vaca1llEmployees", allEmployees);
        let pureVacations = [];
        for (let i = 0; i < vacationingEmployees.length; i++) {
            let holidayObject = {};
            if (vacationingEmployees[i].name.length > 13) {
                holidayObject.name =
                    vacationingEmployees[i].name.slice(0, 13) + "...";
            } else {
                holidayObject.name = vacationingEmployees[i].name;
            }

            holidayObject.start = vacationingEmployees[i].vacations.start;
            holidayObject.end = vacationingEmployees[i].vacations.end;
            holidayObject.comment = vacationingEmployees[i].vacations.comment;
            holidayObject.id = vacationingEmployees[i].vacations._id;

            let repeatingHolidayer;
            repeatingHolidayer = pureVacations.find(
                (holiday) => holiday.name === holidayObject.name
            );
            // console.log("repeatingHolidayer", vacationingEmployees[i].vacations);
            console.log(
                "vacationingEmployees[i].vacations",
                vacationingEmployees[i].vacations
            );

            // If there are multiple separate holidays for same vacationingEmployee during the month
            if (repeatingHolidayer) {
                setNumbers(
                    repeatingHolidayer,
                    new Date(vacationingEmployees[i].vacations.start),
                    new Date(vacationingEmployees[i].vacations.end),
                    vacationingEmployees[i].vacations.confirmed
                );
                let index = pureVacations.findIndex(
                    (holiday) => holiday.name === holidayObject.name
                );
                pureVacations[index] = repeatingHolidayer;
            } else if (!vacationingEmployees[i].vacations) {
                pureVacations.push(holidayObject);
            } else {
                setNumbers(
                    holidayObject,
                    new Date(vacationingEmployees[i].vacations.start),
                    new Date(vacationingEmployees[i].vacations.end),
                    vacationingEmployees[i].vacations.confirmed
                );
                pureVacations.push(holidayObject);
            }
        }

        // If "Show all employees" checkbox is selected, filter the employees without holidays and set only the name for those rows
        if (allEmployees !== undefined) {
            let employeesWithNoHolidays = allEmployees.filter(
                (o1) => !vacationingEmployees.some((o2) => o1.name === o2.name)
            );
            console.log("eNoHolidays", employeesWithNoHolidays);

            for (let i = 0; i < employeesWithNoHolidays.length; i++) {
                let holidayObject = {};
                if (employeesWithNoHolidays[i].name.length > 13) {
                    holidayObject.name =
                        employeesWithNoHolidays[i].name.slice(0, 13) + "...";
                } else {
                    holidayObject.name = employeesWithNoHolidays[i].name;
                }

                pureVacations.push(holidayObject);
            }
        }
        addSummaryRows(pureVacations);
    };

    // Two last rows of the table
    const addSummaryRows = (data) => {
        // Second last row of the table: amount of employees on holiday
        data.push({
            name: ON_HOLIDAY_TITLE,
            one: getOnHolidayAmount(data, "one"),
            two: getOnHolidayAmount(data, "two"),
            three: getOnHolidayAmount(data, "three"),
            four: getOnHolidayAmount(data, "four"),
            five: getOnHolidayAmount(data, "five"),
            six: getOnHolidayAmount(data, "six"),
            seven: getOnHolidayAmount(data, "seven"),
            eight: getOnHolidayAmount(data, "eight"),
            nine: getOnHolidayAmount(data, "nine"),
            ten: getOnHolidayAmount(data, "ten"),
            eleven: getOnHolidayAmount(data, "eleven"),
            twelve: getOnHolidayAmount(data, "twelve"),
            thirteen: getOnHolidayAmount(data, "thirteen"),
            fourteen: getOnHolidayAmount(data, "fourteen"),
            fifteen: getOnHolidayAmount(data, "fifteen"),
            sixteen: getOnHolidayAmount(data, "sixteen"),
            seventeen: getOnHolidayAmount(data, "seventeen"),
            eighteen: getOnHolidayAmount(data, "eighteen"),
            nineteen: getOnHolidayAmount(data, "nineteen"),
            twenty: getOnHolidayAmount(data, "twenty"),
            twentyone: getOnHolidayAmount(data, "twentyone"),
            twentytwo: getOnHolidayAmount(data, "twentytwo"),
            twentythree: getOnHolidayAmount(data, "twentythree"),
            twentyfour: getOnHolidayAmount(data, "twentyfour"),
            twentyfive: getOnHolidayAmount(data, "twentyfive"),
            twentysix: getOnHolidayAmount(data, "twentysix"),
            twentyseven: getOnHolidayAmount(data, "twentyseven"),
            twentyeight: getOnHolidayAmount(data, "twentyeight"),
            twentynine: getOnHolidayAmount(data, "twentynine"),
            thirty: getOnHolidayAmount(data, "thirty"),
            thirtyone: getOnHolidayAmount(data, "thirtyone"),
        });
        // Last row of the table: amount of working employee
        data.push({
            name: WORKER_TITLE,
            one: getWorkerAmount(data, "one"),
            two: getWorkerAmount(data, "two"),
            three: getWorkerAmount(data, "three"),
            four: getWorkerAmount(data, "four"),
            five: getWorkerAmount(data, "five"),
            six: getWorkerAmount(data, "six"),
            seven: getWorkerAmount(data, "seven"),
            eight: getWorkerAmount(data, "eight"),
            nine: getWorkerAmount(data, "nine"),
            ten: getWorkerAmount(data, "ten"),
            eleven: getWorkerAmount(data, "eleven"),
            twelve: getWorkerAmount(data, "twelve"),
            thirteen: getWorkerAmount(data, "thirteen"),
            fourteen: getWorkerAmount(data, "fourteen"),
            fifteen: getWorkerAmount(data, "fifteen"),
            sixteen: getWorkerAmount(data, "sixteen"),
            seventeen: getWorkerAmount(data, "seventeen"),
            eighteen: getWorkerAmount(data, "eighteen"),
            nineteen: getWorkerAmount(data, "nineteen"),
            twenty: getWorkerAmount(data, "twenty"),
            twentyone: getWorkerAmount(data, "twentyone"),
            twentytwo: getWorkerAmount(data, "twentytwo"),
            twentythree: getWorkerAmount(data, "twentythree"),
            twentyfour: getWorkerAmount(data, "twentyfour"),
            twentyfive: getWorkerAmount(data, "twentyfive"),
            twentysix: getWorkerAmount(data, "twentysix"),
            twentyseven: getWorkerAmount(data, "twentyseven"),
            twentyeight: getWorkerAmount(data, "twentyeight"),
            twentynine: getWorkerAmount(data, "twentynine"),
            thirty: getWorkerAmount(data, "thirty"),
            thirtyone: getWorkerAmount(data, "thirtyone"),
        });
        console.log("data", data);
        setAllHolidaysSelectedTime(data);
    };

    const getOnHolidayAmount = (data, key) => {
        let peopleOnHoliday = 0;
        for (let i = 0; i < data.length; i++) {
            if (holidaySymbols.includes(data[i][key])) {
                peopleOnHoliday++;
            }
        }
        // If a team has been selected
        if (teamToShow) {
            return peopleOnHoliday;
        } else {
            return peopleOnHoliday;
        }
    };

    const getWorkerAmount = (data, key) => {
        let peopleOnHoliday = 0;
        for (let i = 0; i < data.length; i++) {
            if (holidaySymbols.includes(data[i][key])) {
                peopleOnHoliday++;
            }
        }
        // If a team has been selected
        if (teamToShow) {
            console.log("Total", peopleOnHoliday, teamToShow.members.length);
            return teamToShow.members.length - peopleOnHoliday;
        } else {
            // console.log(
            //     "vacationers",
            //     key,
            //     ":",
            //     vacationersAmount.length,
            //     peopleOnHoliday
            // );
            return vacationersAmount.length - peopleOnHoliday;
        }
    };

    // Sets the start and end date of holidays for shown calendar month
    const setNumbers = (holidayObject, start, end, confirmedHoliday) => {
        console.log("setNumbers", holidayObject, start, end, confirmedHoliday);

        let symbolToUse;
        let startingNumber = 0;
        let endingNumber = 0;

        if (!confirmedHoliday) {
            symbolToUse = holidaySymbols[1];
        } else {
            symbolToUse = holidaySymbols[0];
        }

        // Can this be shortened?
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

    // When save is called (holiday CRUD-operation) update calendar view from db
    // Hide last days depending on the month lengths (0-11)
    useEffect(() => {
        setShowSpinner(true);
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
        getHolidaysOfMonth(nextMonth);
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
        console.log("newDate1", newDate, holidaySymbols);

        setSelectedDate(newDate);
    };

    // This part could be refactored
    const isCommonHoliday = (value, index) => {
        let colorToAdd = null;
        // console.log("value, index", value, index);

        if (index !== 0 && typeof value !== "number") {
            if (value === holidaySymbols[0]) {
                colorToAdd = holidayColor;
            } else if (value === holidaySymbols[1]) {
                colorToAdd = unConfirmedHolidayColor;
            }
            let dateToCheck = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                index
            );

            // Saturday or Sunday
            if (dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6) {
                if (holidaySymbols.includes(value)) {
                    colorToAdd = weekendHolidayColor;
                } else {
                    colorToAdd = weekendColor;
                }
            }

            // Public holidays
            if (publicHolidaysOfMonth.filter((e) => e === index).length > 0) {
                if (holidaySymbols.includes(value)) {
                    colorToAdd = weekendHolidayColor;
                } else {
                    colorToAdd = weekendColor;
                }
            }
        }
        // Not working with two last rows
        // else if (typeof value === "number") {
        //     colorToAdd = "bisque";
        //     if (
        //         !teamToShow &&
        //         value < PRESENCE_PERCENTAGE * vacationersAmount.length
        //     ) {
        //         colorToAdd = "orange";
        //     }
        //     if (
        //         teamToShow &&
        //         value < PRESENCE_PERCENTAGE * teamToShow.members.length
        //     ) {
        //         colorToAdd = "orange";
        //     }
        // }
        return colorToAdd;
    };

    const setBold = (value) => {
        if (
            typeof value === "number" ||
            value === WORKER_TITLE ||
            value === ON_HOLIDAY_TITLE
        ) {
            return "bold";
        }
        return null;
    };

    // Setting the last two rows
    const checkRow = (rowValue) => {
        // console.log("rowValue:", rowValue);
        if (rowValue === ON_HOLIDAY_TITLE) {
            return "lightgreen";
        } else if (rowValue === WORKER_TITLE) {
            return "lightblue";
        }
    };

    const setTodayHeader = (header) => {
        // console.log("setTodayHeader", header, selectedDate.getDate());
        if (
            today.getFullYear() === selectedDate.getFullYear() &&
            today.getMonth() === selectedDate.getMonth() &&
            header === today.getDate()
        ) {
            return TODAY_COLOR;
        } else {
            return "aliceblue";
        }
    };

    const setTodayColumn = (value) => {
        // console.log("setTodayColumn", value);
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

    const MonthInputButton = forwardRef(({ value, onClick }, ref) => (
        <Button onClick={onClick} ref={ref}>
            {selectedDate.toLocaleString("en-GB", {
                month: "long",
                year: "numeric",
            })}
        </Button>
    ));

    /**
     * Counts how many vacationers exist in a given day.
     * As a parameter accepts the number of the day and returns the amount of
     * workers on holiday on given day.
     */
    const countVacationers = (dayNumber) => {
        let vacationersAmount1 = 0;

        try {
            // iterate through all vacationers
            selectedVacationers.forEach((vacationer) => {
                // console.log("start: " + vacationer.vacations.start.substring(8,10))
                // console.log("end: " + vacationer.vacations.end.substring(8,10))

                // if the given day is included in the vacationers holiday add to vacationersAmount
                if (teamToShow) {
                    if (
                        dayNumber >=
                            vacationer.vacations.start.substring(8, 10) &&
                        dayNumber <= vacationer.vacations.end.substring(8, 10)
                    ) {
                        teamToShow.members.forEach((member) => {
                            if (member.name === vacationer.name) {
                                vacationersAmount1++;
                            }
                        });
                    }
                } else {
                    if (
                        dayNumber >=
                            vacationer.vacations.start.substring(8, 10) &&
                        dayNumber <= vacationer.vacations.end.substring(8, 10)
                    ) {
                        vacationersAmount1++;
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
        return vacationersAmount1;
    };

    const countWorkers = (dayNumber) => {
        let onHolidayCount = 0;
        onHolidayCount = countVacationers(dayNumber);
        let allNames = [];

        console.log(teams);
        console.log(selectedVacationers);

        if (teamToShow) {
            return teamToShow.members.length - onHolidayCount;
        } else {
            teams.forEach((team) => {
                team.members.forEach((member) => {
                    if (!allNames.includes(member.name)) {
                        allNames.push(member.name);
                    }
                });
            });
            console.log(allNames.length);
            return allNames.length - onHolidayCount;
        }
    };

    const getVacationerNames = (dayNumber) => {
        let vacationerNames = [];

        selectedVacationers.forEach((vacationer) => {
            // console.log("start: " + vacationer.vacations.start.substring(8,10))
            // console.log(vacationer.name)

            // if the given day is included in the vacationers holiday add to vacationersAmount
            if (teamToShow) {
                if (
                    dayNumber >= vacationer.vacations.start.substring(8, 10) &&
                    dayNumber <= vacationer.vacations.end.substring(8, 10)
                ) {
                    teamToShow.members.forEach((member) => {
                        if (vacationer.name === member.name) {
                            vacationerNames.push(vacationer.name);
                        }
                    });
                }
            } else {
                if (
                    dayNumber >= vacationer.vacations.start.substring(8, 10) &&
                    dayNumber <= vacationer.vacations.end.substring(8, 10)
                ) {
                    vacationerNames.push(vacationer.name);
                }
            }
        });

        return vacationerNames;
    };

    const getWorkerNames = (dayNumber) => {
        let workerNames = [];
        let onHolidayNames = getVacationerNames(dayNumber);

        console.log(onHolidayNames);

        if (teamToShow) {
            teamToShow.members.forEach((member) => {
                if (onHolidayNames.length > 0) {
                    onHolidayNames.forEach((vacationer) => {
                        if (member.name != vacationer) {
                            workerNames.push(member.name);
                        }
                    });
                } else {
                    workerNames.push(member.name);
                }
            });

            return workerNames;
        } else {
            teams.forEach((team) => {
                team.members.forEach((member) => {
                    if (!onHolidayNames.includes(member.name)) {
                        if (!workerNames.includes(member.name)) {
                            workerNames.push(member.name);
                        }
                    }
                });
            });
            return workerNames;
        }
    };

    const getDayFromInt = (day) => {
        switch (day) {
            case 0:
                return "Mon";

            case 1:
                return "Tue";

            case 2:
                return "Wed";

            case 3:
                return "Thu";

            case 4:
                return "Fri";

            case 5:
                return "Sat";

            case 6:
                return "Sun";

            default:
                break;
        }
    };

    return (
        <>
            <div className={styles.wholeCalendar}>
                <div>
                    <div className={styles.teamChips}>
                        {/*<Select*/}
                        {/*    multiple={true}*/}
                        {/*    value={teamToShow.title}*/}
                        {/*    onChange={() => {*/}
                        {/*        setTeamToShow(team);*/}
                        {/*        console.log("team", team);*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    {teams.map((team) => (*/}
                        {/*        <MenuItem*/}
                        {/*            className={styles.menuItem}*/}
                        {/*            key={team.id}*/}
                        {/*            value={team.title}*/}
                        {/*        >*/}
                        {/*            {team.title}*/}
                        {/*        </MenuItem>*/}
                        {/*    ))}*/}
                        {/*</Select>*/}
                        <Chip
                            disabled={APIError || !user.name}
                            className={styles.oneTeamChip}
                            variant={!teamToShow ? "" : "outlined"}
                            label="All teams"
                            color="secondary"
                            onClick={() => {
                                setMonthsHolidays(selectedVacationers);
                                setTeamToShow("");
                            }}
                        />
                        {teams.map((team) => (
                            <Chip
                                className={styles.oneTeamChip}
                                key={team.id}
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
                                .map((member) => (
                                    <Chip
                                        className={styles.oneTeamChip}
                                        label={member.name}
                                        key={member.vacationerId}
                                    />
                                ))}
                    </div>
                    {user.name && (
                        <div className={styles.infoBox}>
                            {holidaySymbols[0]} = confirmed holiday <br />{" "}
                            {holidaySymbols[1]} = un-confirmed holiday
                        </div>
                    )}
                </div>
                <div className={styles.wholeCalendar}>
                    <FormGroup>
                        {!isMobile ? (
                            <FormControlLabel
                                checked={showAllVacationers}
                                onChange={() => {
                                    setShowAllVacationers(!showAllVacationers);
                                }}
                                control={<Checkbox color="success" />}
                                disabled={APIError || !user.name}
                                label={
                                    teamToShow
                                        ? `Show all employees of team ${teamToShow.title} `
                                        : "Show all employees"
                                }
                            />
                        ) : (
                            ""
                        )}
                    </FormGroup>
                    <Box className={styles.buttons}>
                        <Button
                            onClick={() => changeMonth(-1)}
                            startIcon={<ArrowBackIosIcon />}
                            disabled={APIError || !user.name}
                        >
                            Prev
                        </Button>
                        <div className={styles.monthSelection}>
                            <DatePicker
                                disabled={APIError || !user.name}
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
                            disabled={APIError || !user.name}
                        >
                            Next
                        </Button>
                    </Box>
                    {/* <h2>Width: {isMobile ? "Mobile View" : "Desktop View"}</h2>
                    <div>
                        {isMobile ?
                        <div>
                            test
                        </div>
                        :
                        <div>
                            test2
                        </div>
                        }
                    </div> */}

                    {!isMobile ? (
                        <div className="full-calendar">
                            {allHolidaysSelectedTime.length > 0 && (
                                <table
                                    {...getTableProps()}
                                    style={{
                                        border: "solid 0.1em #73D8FF",
                                        width: "100%",
                                    }}
                                >
                                    <thead>
                                        {headerGroups.map((headerGroup) => (
                                            <tr
                                                {...headerGroup.getHeaderGroupProps()}
                                            >
                                                {headerGroup.headers.map(
                                                    (column) => (
                                                        <th
                                                            {...column.getHeaderProps()}
                                                            style={{
                                                                background:
                                                                    setTodayHeader(
                                                                        column.Header
                                                                    ),
                                                                color: "black",
                                                                width: "1em",
                                                            }}
                                                        >
                                                            {column.render(
                                                                "Header"
                                                            )}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {rows.map((row) => {
                                            prepareRow(row);
                                            return (
                                                <tr
                                                    {...row.getRowProps()}
                                                    style={{
                                                        backgroundColor:
                                                            checkRow(
                                                                row.cells[0]
                                                                    .value
                                                            ),
                                                    }}
                                                >
                                                    {row.cells.map(
                                                        (cell, index) => {
                                                            // console.log(
                                                            //     "info",
                                                            //     cell.value,
                                                            //     index
                                                            // );
                                                            return (
                                                                <td
                                                                    {...cell.getCellProps(
                                                                        {
                                                                            onClick:
                                                                                () => {
                                                                                    console.log(
                                                                                        "loki1",
                                                                                        cell.value
                                                                                    );
                                                                                    console.log(
                                                                                        "loki2",
                                                                                        cell
                                                                                            .row
                                                                                            .original
                                                                                            .name,
                                                                                        cell
                                                                                            .column
                                                                                            .Header
                                                                                    );
                                                                                },
                                                                        }
                                                                    )}
                                                                    style={{
                                                                        fontWeight:
                                                                            setBold(
                                                                                cell.value
                                                                            ),
                                                                        paddingLeft:
                                                                            "0.5em",
                                                                        height: "2em",
                                                                        maxWidth:
                                                                            "5em",
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
                                                                    {cell.render(
                                                                        "Cell"
                                                                    )}
                                                                </td>
                                                            );
                                                        }
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        // If the screen width matches mobile
                        <div className={styles.verticalCalendar}>
                            {[
                                ...Array(
                                    new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth() + 1,
                                        0
                                    ).getDate()
                                ),
                            ].map((e, i) => (
                                <div className={styles.dayDiv} key={i}>
                                    <div className={styles.dayNumber}>
                                        <p>{i + 1}</p>
                                        <p>
                                            {getDayFromInt(
                                                new Date(
                                                    selectedDate.getFullYear(),
                                                    selectedDate.getMonth() + 1,
                                                    i
                                                ).getDay()
                                            )}
                                        </p>
                                        {console.log(selectedDate.getDay())}
                                    </div>
                                    <div className={styles.dayContent}>
                                        <div className={styles.content}>
                                            <div
                                                className={
                                                    styles.onHolidayContent
                                                }
                                            >
                                                {getVacationerNames(i + 1).map(
                                                    (name) => (
                                                        <p>{name}</p>
                                                    )
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    styles.workingContent
                                                }
                                            >
                                                {getWorkerNames(i + 1).map(
                                                    (name) => (
                                                        <p>{name}</p>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.headerCont}>
                                            <div className={styles.onHoliday}>
                                                On Holiday:{" "}
                                                {countVacationers(i + 1)}
                                            </div>
                                            <div className={styles.working}>
                                                Working: {countWorkers(i + 1)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showSpinner && <CircularProgress />}
                </div>
            </div>
        </>
    );
}
