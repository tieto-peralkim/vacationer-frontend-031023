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
import { useTable, useSortBy } from "react-table";
import axios from "axios";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Radio,
    RadioGroup,
    Switch,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import styles from "./calendar.module.css";
import DatePicker from "react-datepicker";
import { Team } from "../Team/TeamPage/TeamPage";
import { useOutletVariables } from "../../NavigationBar";
import Typography from "@mui/material/Typography";
import { ScreenRotationAlt } from "@mui/icons-material";

export default function Calendar({ vacationersAmount, save }) {
    interface ButtonProps {
        onClick?: MouseEventHandler<HTMLButtonElement>;
    }

    // const isMobile = useBreakpoint(down("md")); // md breakpoint activates when screen width <= 768px https://www.npmjs.com/package/styled-breakpoints

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
    const workerTitle = "Working";
    const onHolidayTitle = "On holiday";
    const workerColor = "lightblue";
    const onHolidayColor = "lightgreen";
    const presencePercentage = 0.5;
    const todayColor = "#e30f2d";
    const calendarBorderStyle = "solid 0.1em #73D8FF";
    const columnMaxWidth = "12em";
    const columnPaddingWidth = "0.2em";
    const headerColor = "black";
    const headerBackgroundColor = "lightgrey";
    const columnLineHeight = "1em";

    // HolidaySymbol can not be a number!
    const [holidaySymbols, setHolidaySymbols] = useState([]);
    const [holidayColor, setHolidayColor] = useState("");
    const [unConfirmedHolidayColor, setUnConfirmedHolidayColor] = useState("");
    const [weekendColor, setWeekendColor] = useState("");
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("");

    const [showSpinner, setShowSpinner] = useState(false);
    const [showAllVacationers, setShowAllVacationers] = useState(true);

    const [columnHeight, setColumnHeight] = useState(1);
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
    const [vacationersCount, setVacationersCount] = useState(0);

    // Fetching public holidays from API
    useEffect(() => {
        axios
            .get(
                `${process.env.REACT_APP_ADDRESS}/public-holidays/${selectedYear}`,
                {
                    withCredentials: true,
                }
            )
            .then((response) => {
                setPublicHolidays(response.data);
            })
            .catch((error) => {
                console.error("There was a get Public holiday error!", error);
            });
    }, [selectedYear]);

    // TODO: reduce re-renders!
    useEffect(() => {
        // Showing all employees of the selected team, not only the ones with holiday
        if (showAllVacationers && teamToShow.id) {
            setMonthsHolidays(filterHolidays(), teamToShow.members);
        }
        // Showing all vacationing employees of the selected team
        else if (teamToShow.id) {
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
    }, [showAllVacationers, teamToShow, selectedVacationers, holidaySymbols]);

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

    const changeCalendarHeight = (e: any) => {
        setColumnHeight(e.target.value);
    };

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
                setShowSpinner(false);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a get holidaysbetween error!", error);
                setShowSpinner(false);
            });
    };

    // Creates the employee rows, vacationingEmployees is the list of employees with holidays,
    // allEmployees is the list of all employees in db
    const setMonthsHolidays = (vacationingEmployees, allEmployees) => {
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

        // If showing all vacationers, filter the employees without holidays and set only the name for those rows
        if (allEmployees !== null) {
            let employeesWithNoHolidays = allEmployees.filter(
                (o1) => !vacationingEmployees.some((o2) => o1.name === o2.name)
            );

            for (let i = 0; i < employeesWithNoHolidays.length; i++) {
                let holidayObject = {
                    name: employeesWithNoHolidays[i].name,
                };

                pureVacations.push(holidayObject);
            }
        }
        setAllHolidaysSelectedTime(pureVacations);
    };

    // Sets the start and end date of holidays for shown calendar month
    const setNumbers = (holidayObject, start, end, confirmedHoliday) => {
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

    // POSSIBLE NEXT VERSION, EXAMPLE CODE for editable Cell values
    // const EditableCell = ({ value: XX, row: { index }, column: { id } }) => {
    //     const initialValue = "XX";
    //     const [value, setValue] = useState(initialValue);
    //
    //     const onClick = () => {
    //         setValue("YY");
    //     };
    //     useEffect(() => {
    //         setValue(initialValue);
    //     }, [initialValue]);
    //
    //     return <button onClick={onClick}>{value} </button>;
    // };
    //
    // const defaultColumn = {
    //     Cell: EditableCell,
    // };

    const calculateOnHoliday = (info, selectedColumn) => {
        var peopleOnHoliday = 0;
        for (let i = 0; i < info.rows.length; i++) {
            if (
                info.rows[i].values[selectedColumn] === holidaySymbols[0] ||
                info.rows[i].values[selectedColumn] === holidaySymbols[1]
            ) {
                peopleOnHoliday += 1;
            }
        }
        return (
            <div>
                <b className={styles.onHolidayNumber}>{peopleOnHoliday}</b>
                <b className={styles.workingNumber}>
                    {info.rows.length - peopleOnHoliday}
                </b>
            </div>
        );
    };

    const columns = useMemo(
        () => [
            {
                Header: "Name",
                accessor: "name",
                Footer: (
                    <div>
                        <b className={styles.onHolidayTitle}>
                            {onHolidayTitle}
                        </b>
                        <b className={styles.workingTitle}>{workerTitle}</b>
                    </div>
                ),
            },
            {
                Header: "01",
                accessor: "one",
                Footer: (info) => calculateOnHoliday(info, "one"),
            },
            {
                Header: "02",
                accessor: "two",
                Footer: (info) => calculateOnHoliday(info, "two"),
            },
            {
                Header: "03",
                accessor: "three",
                Footer: (info) => calculateOnHoliday(info, "three"),
            },
            {
                Header: "04",
                accessor: "four",
                Footer: (info) => calculateOnHoliday(info, "four"),
            },
            {
                Header: "05",
                accessor: "five",
                Footer: (info) => calculateOnHoliday(info, "five"),
            },
            {
                Header: "06",
                accessor: "six",
                Footer: (info) => calculateOnHoliday(info, "six"),
            },
            {
                Header: "07",
                accessor: "seven",
                Footer: (info) => calculateOnHoliday(info, "seven"),
            },
            {
                Header: "08",
                accessor: "eight",
                Footer: (info) => calculateOnHoliday(info, "eight"),
            },
            {
                Header: "09",
                accessor: "nine",
                Footer: (info) => calculateOnHoliday(info, "nine"),
            },
            {
                Header: "10",
                accessor: "ten",
                Footer: (info) => calculateOnHoliday(info, "ten"),
            },
            {
                Header: "11",
                accessor: "eleven",
                Footer: (info) => calculateOnHoliday(info, "eleven"),
            },
            {
                Header: "12",
                accessor: "twelve",
                Footer: (info) => calculateOnHoliday(info, "twelve"),
            },
            {
                Header: "13",
                accessor: "thirteen",
                Footer: (info) => calculateOnHoliday(info, "thirteen"),
            },
            {
                Header: "14",
                accessor: "fourteen",
                Footer: (info) => calculateOnHoliday(info, "fourteen"),
            },
            {
                Header: "15",
                accessor: "fifteen",
                Footer: (info) => calculateOnHoliday(info, "fifteen"),
            },
            {
                Header: "16",
                accessor: "sixteen",
                Footer: (info) => calculateOnHoliday(info, "sixteen"),
            },
            {
                Header: "17",
                accessor: "seventeen",
                Footer: (info) => calculateOnHoliday(info, "seventeen"),
            },
            {
                Header: "18",
                accessor: "eighteen",
                Footer: (info) => calculateOnHoliday(info, "eighteen"),
            },
            {
                Header: "19",
                accessor: "nineteen",
                Footer: (info) => calculateOnHoliday(info, "nineteen"),
            },
            {
                Header: "20",
                accessor: "twenty",
                Footer: (info) => calculateOnHoliday(info, "twenty"),
            },
            {
                Header: "21",
                accessor: "twentyone",
                Footer: (info) => calculateOnHoliday(info, "twentyone"),
            },
            {
                Header: "22",
                accessor: "twentytwo",
                Footer: (info) => calculateOnHoliday(info, "twentytwo"),
            },
            {
                Header: "23",
                accessor: "twentythree",
                Footer: (info) => calculateOnHoliday(info, "twentythree"),
            },
            {
                Header: "24",
                accessor: "twentyfour",
                Footer: (info) => calculateOnHoliday(info, "twentyfour"),
            },
            {
                Header: "25",
                accessor: "twentyfive",
                Footer: (info) => calculateOnHoliday(info, "twentyfive"),
            },
            {
                Header: "26",
                accessor: "twentysix",
                Footer: (info) => calculateOnHoliday(info, "twentysix"),
            },
            {
                Header: "27",
                accessor: "twentyseven",
                Footer: (info) => calculateOnHoliday(info, "twentyseven"),
            },
            {
                Header: "28",
                accessor: "twentyeight",
                Footer: (info) => calculateOnHoliday(info, "twentyeight"),
            },
            {
                Header: "29",
                accessor: "twentynine",
                Footer: (info) => calculateOnHoliday(info, "twentynine"),
            },
            {
                Header: "30",
                accessor: "thirty",
                Footer: (info) => calculateOnHoliday(info, "thirty"),
            },
            {
                Header: "31",
                accessor: "thirtyone",
                Footer: (info) => calculateOnHoliday(info, "thirtyone"),
            },
        ],
        [holidaySymbols]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        footerGroups,
        rows,
        prepareRow,
        setHiddenColumns,
    } = useTable(
        {
            columns,
            data: allHolidaysSelectedTime,
            // defaultColumn,
            initialState: {
                hiddenColumns: hiddenColumns,
            },
        },
        useSortBy
    );

    const changeMonth = (amount) => {
        let newMonth;
        if (amount > 0) {
            newMonth = selectedDate.getMonth() + 1;
        } else {
            newMonth = selectedDate.getMonth() - 1;
        }

        let newDate = new Date(selectedDate.getFullYear(), newMonth, 1, 15);
        newDate.setUTCHours(0, 0, 0, 0);
        setSelectedDate(newDate);
    };

    // This part could be refactored
    const isCommonHoliday = (value, index) => {
        let colorToAdd = null;

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
        //         value < presencePercentage * vacationersAmount.length
        //     ) {
        //         colorToAdd = "orange";
        //     }
        //     if (
        //         teamToShow.id &&
        //         value < presencePercentage * teamToShow.members.length
        //     ) {
        //         colorToAdd = "orange";
        //     }
        // }
        return colorToAdd;
    };

    const setBold = (value) => {
        if (
            typeof value === "number" ||
            value === workerTitle ||
            value === onHolidayTitle
        ) {
            return "bold";
        }
        return null;
    };

    // Setting the background colors of "On holiday" and "Working" rows
    const checkRow = (rowValue) => {
        if (rowValue === onHolidayTitle) {
            return onHolidayColor;
        } else if (rowValue === workerTitle) {
            return workerColor;
        }
    };

    const setTodayHeader = (header) => {
        if (
            today.getFullYear() === selectedDate.getFullYear() &&
            today.getMonth() === selectedDate.getMonth() &&
            parseInt(header) === today.getDate()
        ) {
            return todayColor;
        } else {
            return headerBackgroundColor;
        }
    };

    const setTodayColumn = (value) => {
        if (
            today.getFullYear() === selectedDate.getFullYear() &&
            today.getMonth() === selectedDate.getMonth() &&
            parseInt(value.Header) === today.getDate()
        ) {
            return `solid 1px ${todayColor}`;
        } else {
            return "solid 1px black";
        }
    };

    /**
     * Counts how many vacationers exist in a given day.
     * As a parameter accepts the number of the day and returns the amount of
     * workers on holiday on given day.
     */
    const countVacationers = (dayNumber): number => {
        let year = selectedDate.getFullYear();
        let month = selectedDate.getMonth();
        let date = new Date(year, month, dayNumber, 15, 0, 0, 0);
        let vacationersAmount1 = 0;

        selectedVacationers.forEach((vacationer) => {
            if (teamToShow.id) {
                if (
                    date.toISOString() >= vacationer.vacations.start &&
                    date.toISOString() <= vacationer.vacations.end
                ) {
                    teamToShow.members.forEach((member) => {
                        if (member.name === vacationer.name) {
                            vacationersAmount1++;
                        }
                    });
                }
            } else {
                if (
                    date.toISOString() >= vacationer.vacations.start &&
                    date.toISOString() <= vacationer.vacations.end
                ) {
                    vacationersAmount1++;
                }
            }
        });

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
        let year = selectedDate.getFullYear();
        let month = selectedDate.getMonth();
        let date = new Date(year, month, dayNumber, 15, 0, 0, 0);
        let vacationerNames = [];

        selectedVacationers.forEach((vacationer) => {
            // if the given day is included in the vacationers holiday add to vacationersAmount
            if (teamToShow.id) {
                if (
                    date.toISOString() >= vacationer.vacations.start &&
                    date.toISOString() <= vacationer.vacations.end
                ) {
                    teamToShow.members.forEach((member) => {
                        if (vacationer.name === member.name) {
                            vacationerNames.push(vacationer.name);
                        }
                    });
                }
            } else {
                if (
                    date.toISOString() >= vacationer.vacations.start &&
                    date.toISOString() <= vacationer.vacations.end
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
                        // !isMobile &&
                        <div className={styles.infoBox}>
                            {holidaySymbols[0]} = confirmed holiday <br />{" "}
                            {holidaySymbols[1]} = un-confirmed holiday
                        </div>
                    )}
                </div>
                <div className={styles.wholeCalendar}>
                    {/*{!isMobile && (*/}
                    <div className={styles.rowOnCalendar}>
                        <FormGroup>
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
                        </FormGroup>
                        <FormControl className={styles.heightSettings}>
                            <FormLabel className={styles.heightTitle}>
                                Calendar height
                            </FormLabel>
                            <RadioGroup
                                row
                                value={columnHeight}
                                onChange={changeCalendarHeight}
                            >
                                <FormControlLabel
                                    value="1"
                                    control={<Radio />}
                                    label={
                                        <Typography
                                            className={styles.sizeRadioButtons}
                                        >
                                            Low
                                        </Typography>
                                    }
                                />
                                <FormControlLabel
                                    value="1.5"
                                    control={<Radio />}
                                    label={
                                        <Typography
                                            className={styles.sizeRadioButtons}
                                        >
                                            Normal
                                        </Typography>
                                    }
                                />
                                <FormControlLabel
                                    value="2"
                                    control={<Radio />}
                                    label={
                                        <Typography
                                            className={styles.sizeRadioButtons}
                                        >
                                            High
                                        </Typography>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </div>
                    {/*)}*/}
                    <Box className={styles.monthSelectionButtons}>
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
                    {/*{!isMobile ? (*/}
                    <div className="full-calendar">
                        {allHolidaysSelectedTime.length > 0 && (
                            <table
                                {...getTableProps()}
                                style={{
                                    border: calendarBorderStyle,
                                    width: "100%",
                                }}
                            >
                                <thead>
                                    {headerGroups.map((headerGroup) => (
                                        <tr
                                            {...headerGroup.getHeaderGroupProps()}
                                        >
                                            {headerGroup.headers.map(
                                                (column: any) => (
                                                    <th
                                                        {...column.getHeaderProps(
                                                            column.getSortByToggleProps()
                                                        )}
                                                        style={{
                                                            textAlign: "left",
                                                            background:
                                                                setTodayHeader(
                                                                    column.Header
                                                                ),
                                                            color: `${headerColor}`,
                                                        }}
                                                    >
                                                        <div
                                                            className={
                                                                styles.headerNumberAndArrow
                                                            }
                                                        >
                                                            {column.render(
                                                                "Header"
                                                            )}
                                                            <span
                                                                className={
                                                                    styles.arrowSymbols
                                                                }
                                                            >
                                                                {column.isSorted
                                                                    ? column.isSortedDesc
                                                                        ? "⬇️"
                                                                        : "⬆️"
                                                                    : ""}
                                                            </span>
                                                        </div>
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
                                                        return (
                                                            <td
                                                                // COLUMN STYLE
                                                                style={{
                                                                    fontWeight:
                                                                        setBold(
                                                                            cell.value
                                                                        ),
                                                                    paddingLeft: `${columnPaddingWidth}`,
                                                                    height: `${columnHeight}em`,
                                                                    lineHeight: `${columnLineHeight}`,
                                                                    maxWidth: `${columnMaxWidth}`,
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
                                <tfoot className={styles.footerSection}>
                                    {footerGroups.map((group) => (
                                        <tr {...group.getFooterGroupProps()}>
                                            {group.headers.map((column) => (
                                                <td
                                                    {...column.getFooterProps()}
                                                >
                                                    {column.render("Footer")}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tfoot>
                            </table>
                        )}
                    </div>
                    {/*) : ( // If the screen width matches mobile*/}
                    {/*<div className={styles.verticalCalendar}>*/}
                    {/*    {[*/}
                    {/*        ...Array(*/}
                    {/*            new Date(*/}
                    {/*                selectedDate.getFullYear(),*/}
                    {/*                selectedDate.getMonth() + 1,*/}
                    {/*                0*/}
                    {/*            ).getDate()*/}
                    {/*        ),*/}
                    {/*    ].map((e, i) => (*/}
                    {/*        <div className={styles.dayDiv} key={i}>*/}
                    {/*            <div className={styles.dayNumber}>*/}
                    {/*                <p>{i + 1}</p>*/}
                    {/*                <p>*/}
                    {/*                    {getDayFromInt(*/}
                    {/*                        new Date(*/}
                    {/*                            selectedDate.getFullYear(),*/}
                    {/*                            selectedDate.getMonth(),*/}
                    {/*                            i*/}
                    {/*                        ).getDay()*/}
                    {/*                    )}*/}
                    {/*                </p>*/}
                    {/*            </div>*/}
                    {/*            <div className={styles.dayContent}>*/}
                    {/*                <div className={styles.content}>*/}
                    {/*                    <div*/}
                    {/*                        className={styles.onHolidayContent}*/}
                    {/*                    >*/}
                    {/*                        {getVacationerNames(i + 1).map(*/}
                    {/*                            (name, index) => (*/}
                    {/*                                <p key={index}>{name}</p>*/}
                    {/*                            )*/}
                    {/*                        )}*/}
                    {/*                    </div>*/}
                    {/*                    <div className={styles.workingContent}>*/}
                    {/*                        {getWorkerNames(i + 1).map(*/}
                    {/*                            (name, index) => (*/}
                    {/*                                <p key={index}>{name}</p>*/}
                    {/*                            )*/}
                    {/*                        )}*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}
                    {/*                <div className={styles.headerCont}>*/}
                    {/*                    <div className={styles.onHoliday}>*/}
                    {/*                        On Holiday:{" "}*/}
                    {/*                        {countVacationers(i + 1)}*/}
                    {/*                    </div>*/}
                    {/*                    <div className={styles.working}>*/}
                    {/*                        Working: {countWorkers(i + 1)}*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    ))}*/}
                    {/*</div>*/}
                    {/*)}*/}
                    {showSpinner && <CircularProgress />}
                </div>
            </div>
        </>
    );
}
