// These are for changing the page layout depending on the screen size.
import { useBreakpoint } from "styled-breakpoints/react-styled";
import { down } from "styled-breakpoints";

import {
    forwardRef,
    MouseEventHandler,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useTable } from "react-table";
import axios from "axios";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Switch,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import styles from "./calendar.module.css";
import DatePicker from "react-datepicker";
import { Team } from "../Team/TeamPage/TeamPage";
import { useOutletVariables } from "../../NavigationBar";

export default function Calendar({ vacationersAmount, save }) {
    interface ButtonProps {
        onClick?: MouseEventHandler<HTMLButtonElement>;
    }

    const isMobile = useBreakpoint(down("md")); // sm breakpoint activates when screen width <= 576px

    const { user, APIError, setAPIError } = useOutletVariables();

    const today = new Date();
    const thisMonthFirst = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
        15
    );
    const disableConditions = APIError || !user;
    thisMonthFirst.setUTCHours(0, 0, 0, 0);
    const [allHolidaysSelectedTime, setAllHolidaysSelectedTime] = useState([]);
    const WORKER_TITLE = "Working";
    const ON_HOLIDAY_TITLE = "On holiday";
    const WORKER_COLOR = "lightblue";
    const ON_HOLIDAY_COLOR = "lightgreen";
    const PRESENCE_PERCENTAGE = 0.5;
    const TODAY_COLOR = "#e30f2d";

    // HolidaySymbol can not be a number!
    const [holidaySymbols, setHolidaySymbols] = useState([]);

    const [holidayColor, setHolidayColor] = useState("");
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] = useState("");
    const [weekendColor, setWeekendColor] = useState("");
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("");

    const [showSpinner, setShowSpinner] = useState(false);
    const [showAllVacationers, setShowAllVacationers] = useState(true);

    const [selectedDate, setSelectedDate] = useState(thisMonthFirst);
    const [selectedYear, setSelectedYear] = useState(
        thisMonthFirst.getFullYear()
    );
    const [publicHolidaysOfMonth, setPublicHolidaysOfMonth] = useState([]);
    const [publicHolidays, setPublicHolidays] = useState([]);

    const hiddenColumns = [];
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamToShow, setTeamToShow] = useState<Team>({
        id: "",
        title: "",
        members: [
            {
                name: "",
                vacationerId: "",
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const [selectedVacationers, setSelectedVacationers] = useState([]);

    // Fetching Finnish public holidays from Public holiday API (https://date.nager.at/)
    useEffect(() => {
        console.log(selectedYear);
        axios
            .get(
                `http://localhost:3001/public-holidays/${selectedYear}`,
                {
                    withCredentials: true,
                }
            )
            .then((response) => {
                setPublicHolidays(response.data);
            })
            .catch((error) => {
                console.error("There was a Public holiday API error!", error);
            });
    }, [selectedYear]);

    // TODO: this has too many depending states
    useEffect(() => {
        // Showing all employees of the selected team, not only the ones with holiday
        if (showAllVacationers && teamToShow.id) {
            console.log("showAllVacationers && teamToShow", teamToShow);
            setMonthsHolidays(filterHolidays(), teamToShow.members);
        }
        // Showing all vacationing employees of the selected team
        else if (teamToShow.id) {
            console.log("teamToShow:", teamToShow);
            setMonthsHolidays(filterHolidays(), null);
        }
        // Showing all employees, not only the ones with holiday
        else if (showAllVacationers) {
            setMonthsHolidays(selectedVacationers, vacationersAmount);
        }
        // Showing all vacationing employees
        else {
            setMonthsHolidays(selectedVacationers, null);
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
        if (user && user.calendarSettings) {
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
            })
            .catch((error) => {
                setAPIError(true);
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
        setPublicHolidaysOfMonth(publicMonthsHolidays);
    }, [selectedDate, publicHolidays]);

    const filterHolidays = () => {
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
                console.log("getHolidaysOfMonth", response.data);
                setShowSpinner(false);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a get holidaysbetween error!", error);
                setShowSpinner(false);
            });
    };

    // Creates the employee rows, vacationingEmployees is the list of employees with holidays,
    // allEmployees is the list of employees with and without holidays
    const setMonthsHolidays = (vacationingEmployees, allEmployees) => {
        // console.log("vacationingEmployees", vacationingEmployees);
        // console.log("allEmployees", allEmployees);
        let pureVacations = [];
        for (let i = 0; i < vacationingEmployees.length; i++) {
            let holidayObject = {
                name: vacationingEmployees[i].name,
                start: vacationingEmployees[i].vacations.start,
                end: vacationingEmployees[i].vacations.end,
                comment: vacationingEmployees[i].vacations.comment,
                id: vacationingEmployees[i].vacations._id,
            };

            let repeatingHolidayer;
            repeatingHolidayer = pureVacations.find(
                (holiday) => holiday.name === holidayObject.name
            );
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
        if (allEmployees !== null) {
            let employeesWithNoHolidays = allEmployees.filter(
                (o1) => !vacationingEmployees.some((o2) => o1.name === o2.name)
            );
            console.log("eNoHolidays", employeesWithNoHolidays);

            for (let i = 0; i < employeesWithNoHolidays.length; i++) {
                let holidayObject = {
                    name: employeesWithNoHolidays[i].name,
                };

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
        if (teamToShow.id) {
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
        if (teamToShow.id) {
            return teamToShow.members.length - peopleOnHoliday;
        } else {
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
        console.log("newDate", newDate);

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
        // TODO:
        // This would add alert color for the dates where there are too few people working. Not working after adding the "Working" row
        // else if (typeof value === "number") {
        //     colorToAdd = "bisque";
        //     if (
        //         !teamToShow.id &&
        //         value < PRESENCE_PERCENTAGE * vacationersAmount.length
        //     ) {
        //         colorToAdd = "orange";
        //     }
        //     if (
        //         teamToShow.id &&
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

    // Setting the background colors of "On holiday" and "Working" rows
    const checkRow = (rowValue) => {
        if (rowValue === ON_HOLIDAY_TITLE) {
            return ON_HOLIDAY_COLOR;
        } else if (rowValue === WORKER_TITLE) {
            return WORKER_COLOR;
        }
    };

    const setTodayHeader = (header) => {
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

    /**
     * Counts how many vacationers exist in a given day.
     * As a parameter accepts the number of the day and returns the amount of
     * workers on holiday on given day.
     */
    const countVacationers = (dayNumber) => {
        let vacationersAmount1 = 0;

        try {
            selectedVacationers.forEach((vacationer) => {
                // if the given day is included in the vacationers holiday add to vacationersAmount
                if (teamToShow.id) {
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
        let onHolidayCount = countVacationers(dayNumber);
        let allNames = [];

        if (teamToShow.id) {
            return teamToShow.members.length - onHolidayCount;
        } else {
            teams.forEach((team) => {
                team.members.forEach((member) => {
                    if (!allNames.includes(member.name)) {
                        allNames.push(member.name);
                    }
                });
            });
            vacationersAmount.forEach((vacationer) => {
                if (!allNames.includes(vacationer.name)) {
                    allNames.push(vacationer.name);
                }
            });
            return allNames.length - onHolidayCount;
        }
    };

    const getVacationerNames = (dayNumber) => {
        let vacationerNames = [];

        selectedVacationers.forEach((vacationer) => {
            // if the given day is included in the vacationers holiday add to vacationersAmount
            if (teamToShow.id) {
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

        if (teamToShow.id) {
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
            vacationersAmount.forEach((vacationer) => {
                if (!onHolidayNames.includes(vacationer.name)) {
                    if (!workerNames.includes(vacationer.name)) {
                        workerNames.push(vacationer.name);
                    }
                }
            });
            return workerNames;
        }
    };

    const ButtonCustomInput = forwardRef<HTMLInputElement, ButtonProps>(
        (props, ref) => {
            const { onClick } = props;
            return (
                <Button onClick={onClick} ref={ref}>
                    {selectedDate.toLocaleString("en-GB", {
                        month: "long",
                        year: "numeric",
                    })}
                </Button>
            );
        }
    );

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
                        {teamToShow.id.length === 0 ? (
                            <Chip
                                label="All teams"
                                color="secondary"
                                onClick={() => {
                                    setMonthsHolidays(
                                        selectedVacationers,
                                        null
                                    );
                                    setTeamToShow({
                                        id: "",
                                        title: "",
                                        members: [
                                            {
                                                name: "",
                                                vacationerId: "",
                                            },
                                        ],
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                    });
                                }}
                            />
                        ) : (
                            <Chip
                                variant={"outlined"}
                                label="All teams"
                                color="secondary"
                                onClick={() => {
                                    setMonthsHolidays(
                                        selectedVacationers,
                                        null
                                    );
                                    setTeamToShow({
                                        id: "",
                                        title: "",
                                        members: [
                                            {
                                                name: "",
                                                vacationerId: "",
                                            },
                                        ],
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                    });
                                }}
                            />
                        )}
                        {teams.map((team) =>
                            teamToShow.id && teamToShow.title === team.title ? (
                                <Chip
                                    key={team.id}
                                    color="primary"
                                    label={team.title}
                                    onClick={() => {
                                        setTeamToShow(team);
                                        console.log("team", team);
                                    }}
                                />
                            ) : (
                                <Chip
                                    key={team.id}
                                    variant={"outlined"}
                                    color="primary"
                                    label={team.title}
                                    onClick={() => {
                                        setTeamToShow(team);
                                        console.log("team", team);
                                    }}
                                />
                            )
                        )}
                        {teamToShow.id &&
                            teamToShow.members
                                // some sorting?
                                // .sort((v1, v2) => v1.name - v2.name)
                                .map((member) => (
                                    <Chip
                                        label={member.name}
                                        key={member.vacationerId}
                                    />
                                ))}
                    </div>
                    {user && user.name && (
                        <div className={styles.infoBox}>
                            {holidaySymbols[0]} = confirmed holiday <br />{" "}
                            {holidaySymbols[1]} = un-confirmed holiday
                        </div>
                    )}
                </div>
                <div className={styles.wholeCalendar}>
                    <FormGroup>
                        {/* {!isMobile ? ( */}
                        <FormControlLabel
                            checked={!showAllVacationers}
                            onChange={() => {
                                setShowAllVacationers(!showAllVacationers);
                            }}
                            control={<Switch color="success" />}
                            disabled={disableConditions}
                            label={
                                teamToShow.id
                                    ? `Show only people on holiday in team ${teamToShow.title}`
                                    : "Show only people on holiday"
                            }
                        />
                        {/* ) : (
                            ""
                        )} */}
                    </FormGroup>
                    <Box className={styles.buttons}>
                        <Button
                            onClick={() => changeMonth(-1)}
                            startIcon={<ArrowBackIosIcon />}
                            disabled={disableConditions}
                        >
                            Prev
                        </Button>
                        <div className={styles.monthSelection}>
                            <DatePicker
                                disabled={disableConditions}
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                showFullMonthYearPicker
                                showFourColumnMonthYearPicker
                                customInput={<ButtonCustomInput />}
                            />
                        </div>
                        <Button
                            onClick={() => changeMonth(1)}
                            endIcon={<ArrowForwardIosIcon />}
                            disabled={disableConditions}
                        >
                            Next
                        </Button>
                    </Box>
                    {/* {!isMobile ? ( */}
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
                                                    backgroundColor: checkRow(
                                                        row.cells[0].value
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
                                                                style={{
                                                                    fontWeight:
                                                                        setBold(
                                                                            cell.value
                                                                        ),
                                                                    paddingLeft:
                                                                        "0.2em",
                                                                    height: "2em",
                                                                    width: "12em",
                                                                    border: setTodayColumn(
                                                                        cell.column
                                                                    ),
                                                                    backgroundColor:
                                                                        isCommonHoliday(
                                                                            cell.value,
                                                                            index
                                                                        ),
                                                                }}
                                                                key={index}
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
                    {/* ) : (
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
                                                    selectedDate.getMonth(),
                                                    i
                                                ).getDay()
                                            )}
                                        </p>
                                    </div>
                                    <div className={styles.dayContent}>
                                        <div className={styles.content}>
                                            <div
                                                className={
                                                    styles.onHolidayContent
                                                }
                                            >
                                                {getVacationerNames(i + 1).map(
                                                    (name, index) => (
                                                        <p key={index}>
                                                            {name}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    styles.workingContent
                                                }
                                            >
                                                {getWorkerNames(i + 1).map(
                                                    (name, index) => (
                                                        <p key={index}>
                                                            {name}
                                                        </p>
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
                    )} */}

                    {showSpinner && <CircularProgress />}
                </div>
            </div>
        </>
    );
}
