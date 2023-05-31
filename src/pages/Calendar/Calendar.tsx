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
    FormControlLabel,
    FormGroup,
    Popper,
    Switch,
    ToggleButtonGroup,
    Tooltip,
} from "@mui/material";

import MuiToggleButton from "@mui/material/ToggleButton";
import { styled } from "@mui/material/styles";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import styles from "./calendar.module.css";
import DatePicker from "react-datepicker";
import { Team } from "../Team/TeamPage/TeamPage";
import { useOutletVariables } from "../../NavigationBar";
import Typography from "@mui/material/Typography";
import CalendarSettings from "./CalendarSettings/CalendarSettings";

export default function Calendar({ allVacationers, save }) {
    interface ButtonProps {
        onClick?: MouseEventHandler<HTMLButtonElement>;
    }

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
    const columnColorToday = "orange";
    const columnStyleToday = `solid 1.5px ${columnColorToday}`;
    const columnStyleDefault = "solid 1px black";
    const headerColor = "black";
    const headerBackgroundColor = "lightgrey";

    // HolidaySymbol can not be a number!
    const [holidaySymbol, setHolidaySymbol] = useState("");
    const [unconfirmedHolidaySymbol, setUnconfirmedHolidaySymbol] =
        useState("");
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
    const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [publicHolidaysOfMonth, setPublicHolidaysOfMonth] = useState([]);
    const [publicHolidays, setPublicHolidays] = useState([]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState();
    const [changesDoneWarning, setChangesDoneWarning] = useState(false);

    const hiddenColumns = [];
    const [teams, setTeams] = useState<Team[]>([]);
    const [vacationersOfMonth, setVacationersOfMonth] = useState([]);

    const ToggleButton = styled(MuiToggleButton)({
        "&.Mui-selected, &.Mui-selected:hover": {
            color: "white",
            backgroundColor: "#3874CB",
            borderColor: "grey",
        },
    });

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

    useEffect(() => {
        let membersToChoose = [];
        // Add members of selectedteams without duplicates
        if (selectedTeams && selectedTeams.length !== 0) {
            selectedTeams.forEach(function (team) {
                team.members.forEach(function (member) {
                    const found = membersToChoose.some(
                        (el) => el.name === member.name
                    );
                    if (!found) {
                        membersToChoose.push(member);
                    }
                });
            });
        }
        setSelectedMembers(membersToChoose);
    }, [selectedTeams]);

    // TODO: reduce re-renders!
    useEffect(() => {
        // Showing all employees of the selected team, not only the ones with holiday
        if (showAllVacationers && selectedMembers.length > 0) {
            setMonthsHolidays(filterHolidays(), selectedMembers);
        }
        // Showing only vacationing employees of the selected team
        else if (selectedMembers.length > 0) {
            setMonthsHolidays(filterHolidays(), null);
        }
        // Showing all employees, not only the ones with holiday
        else if (showAllVacationers) {
            setMonthsHolidays(vacationersOfMonth, allVacationers);
        }
        // Showing only vacationing employees
        else {
            setMonthsHolidays(vacationersOfMonth, null);
        }
    }, [
        showAllVacationers,
        vacationersOfMonth,
        holidaySymbol,
        unconfirmedHolidaySymbol,
        selectedMembers,
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
            setHolidaySymbol(user.calendarSettings[0].holidaySymbol);
            setUnconfirmedHolidaySymbol(
                user.calendarSettings[0].unConfirmedHolidaySymbol
            );
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

    const filterHolidays = () => {
        let filteredVacations = [];
        for (let i = 0; i < selectedMembers.length; i++) {
            // Filter the team's holidays from all the holidays of the month
            const filteredVacation = vacationersOfMonth.filter(
                (vacationer) => vacationer.name === selectedMembers[i].name
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
                setVacationersOfMonth(response.data);
                setShowSpinner(false);
            })
            .catch((error) => {
                setAPIError(true);
                console.error("There was a get holidaysbetween error!", error);
                setShowSpinner(false);
            });
    };

    // Creates the employee rows, vacationingEmployees is the list of employees with holidays,
    // allEmployees is the list of all users of selected scope (selected team or all users)
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
            symbolToUse = unconfirmedHolidaySymbol;
        } else {
            symbolToUse = holidaySymbol;
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

    function CalculateFootersValues({ info, selectedColumn }) {
        let peopleOnHoliday = 0;
        for (let i = 0; i < info.rows.length; i++) {
            if (
                info.rows[i].values[selectedColumn] === holidaySymbol ||
                info.rows[i].values[selectedColumn] === unconfirmedHolidaySymbol
            ) {
                peopleOnHoliday += 1;
            }
        }
        let peopleWorking = info.rows.length - peopleOnHoliday;

        const noWorkersInTeam = peopleWorking === 0 && peopleOnHoliday !== 0;

        return (
            <div>
                <b className={styles.onHolidayNumber}>{peopleOnHoliday}</b>
                <b
                    className={
                        noWorkersInTeam
                            ? styles.workingNumberWarning
                            : styles.workingNumber
                    }
                >
                    {peopleWorking}
                </b>
            </div>
        );
    }

    const sortItems = (prev, curr, columnId) => {
        if (
            prev.original[columnId].toLowerCase() >
            curr.original[columnId].toLowerCase()
        ) {
            return 1;
        } else if (
            prev.original[columnId].toLowerCase() <
            curr.original[columnId].toLowerCase()
        ) {
            return -1;
        } else {
            return 0;
        }
    };

    const columns = useMemo(
        () => [
            {
                Header: <div>Name</div>,
                accessor: "name",
                Footer: (
                    <div>
                        <b className={styles.onHolidayTitle}>
                            {onHolidayTitle}
                        </b>
                        <b className={styles.workingTitle}>{workerTitle}</b>
                    </div>
                ),
                // styling of names column (excluding the header)
                Cell: (s) => (
                    <span className={styles.nameColumn}>{s.value}</span>
                ),
                sortType: (prev, curr, columnId) => {
                    return sortItems(prev, curr, columnId);
                },
            },
            {
                Header: "01",
                accessor: "one",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"one"}
                    />
                ),
            },
            {
                Header: "02",
                accessor: "two",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"two"}
                    />
                ),
            },
            {
                Header: "03",
                accessor: "three",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"three"}
                    />
                ),
            },
            {
                Header: "04",
                accessor: "four",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"four"}
                    />
                ),
            },
            {
                Header: "05",
                accessor: "five",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"five"}
                    />
                ),
            },
            {
                Header: "06",
                accessor: "six",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"six"}
                    />
                ),
            },
            {
                Header: "07",
                accessor: "seven",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"seven"}
                    />
                ),
            },
            {
                Header: "08",
                accessor: "eight",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"eight"}
                    />
                ),
            },
            {
                Header: "09",
                accessor: "nine",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"nine"}
                    />
                ),
            },
            {
                Header: "10",
                accessor: "ten",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"ten"}
                    />
                ),
            },
            {
                Header: "11",
                accessor: "eleven",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"eleven"}
                    />
                ),
            },
            {
                Header: "12",
                accessor: "twelve",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twelve"}
                    />
                ),
            },
            {
                Header: "13",
                accessor: "thirteen",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"thirteen"}
                    />
                ),
            },
            {
                Header: "14",
                accessor: "fourteen",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"fourteen"}
                    />
                ),
            },
            {
                Header: "15",
                accessor: "fifteen",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"fifteen"}
                    />
                ),
            },
            {
                Header: "16",
                accessor: "sixteen",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"sixteen"}
                    />
                ),
            },
            {
                Header: "17",
                accessor: "seventeen",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"seventeen"}
                    />
                ),
            },
            {
                Header: "18",
                accessor: "eighteen",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"eighteen"}
                    />
                ),
            },
            {
                Header: "19",
                accessor: "nineteen",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"nineteen"}
                    />
                ),
            },
            {
                Header: "20",
                accessor: "twenty",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twenty"}
                    />
                ),
            },
            {
                Header: "21",
                accessor: "twentyone",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentyone"}
                    />
                ),
            },
            {
                Header: "22",
                accessor: "twentytwo",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentytwo"}
                    />
                ),
            },
            {
                Header: "23",
                accessor: "twentythree",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentythree"}
                    />
                ),
            },
            {
                Header: "24",
                accessor: "twentyfour",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentyfour"}
                    />
                ),
            },
            {
                Header: "25",
                accessor: "twentyfive",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentyfive"}
                    />
                ),
            },
            {
                Header: "26",
                accessor: "twentysix",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentysix"}
                    />
                ),
            },
            {
                Header: "27",
                accessor: "twentyseven",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentyseven"}
                    />
                ),
            },
            {
                Header: "28",
                accessor: "twentyeight",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentyeight"}
                    />
                ),
            },
            {
                Header: "29",
                accessor: "twentynine",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"twentynine"}
                    />
                ),
            },
            {
                Header: "30",
                accessor: "thirty",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"thirty"}
                    />
                ),
            },
            {
                Header: "31",
                accessor: "thirtyone",
                Footer: (info) => (
                    <CalculateFootersValues
                        info={info}
                        selectedColumn={"thirtyone"}
                    />
                ),
            },
        ],
        [holidaySymbol, unconfirmedHolidaySymbol]
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
            // POSSIBLE NEXT VERSION, EXAMPLE CODE for editable Cell values
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
            if (value === holidaySymbol) {
                colorToAdd = holidayColor;
            } else if (value === unconfirmedHolidaySymbol) {
                colorToAdd = unConfirmedHolidayColor;
            }
            let dateToCheck = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                index
            );

            // Saturday or Sunday
            if (dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6) {
                if (
                    holidaySymbol === value ||
                    unconfirmedHolidaySymbol === value
                ) {
                    colorToAdd = weekendHolidayColor;
                } else {
                    colorToAdd = weekendColor;
                }
            }

            // Public holidays
            if (publicHolidaysOfMonth.filter((e) => e === index).length > 0) {
                if (
                    holidaySymbol === value ||
                    unconfirmedHolidaySymbol === value
                ) {
                    colorToAdd = weekendHolidayColor;
                } else {
                    colorToAdd = weekendColor;
                }
            }
        }
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

    const setTodayHeader = (header) => {
        if (
            today.getFullYear() === selectedDate.getFullYear() &&
            today.getMonth() === selectedDate.getMonth() &&
            parseInt(header) === today.getDate()
        ) {
            return columnColorToday;
        } else {
            return headerBackgroundColor;
        }
    };

    const setColumnStyle = (value) => {
        if (
            today.getFullYear() === selectedDate.getFullYear() &&
            today.getMonth() === selectedDate.getMonth() &&
            parseInt(value.Header) === today.getDate()
        ) {
            return `${columnStyleToday}`;
        } else {
            return `${columnStyleDefault}`;
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

    const handleSettingsClick = (e) => {
        setSettingsOpen(true);
        setAnchorEl(e.currentTarget);
    };

    const selectTeam = (e: any, newTeams: Team[]) => {
        setSelectedTeams(newTeams);
    };

    return (
        <>
            <div className={styles.wholeCalendar}>
                <div>
                    <div className={styles.topRow}>
                        <div>
                            <div>
                                <ToggleButton
                                    onChange={() => setSelectedTeams([])}
                                    value={""}
                                    size={"small"}
                                    selected={selectedMembers.length === 0}
                                    key={"all teams"}
                                    className={styles.toggleButton}
                                >
                                    <Tooltip
                                        title={
                                            "Show all teams or set the displayed team"
                                        }
                                        placement={"top"}
                                    >
                                        <h4 className={styles.buttonAllTeams}>
                                            All teams
                                        </h4>
                                    </Tooltip>
                                </ToggleButton>
                            </div>
                            <ToggleButtonGroup
                                size={"small"}
                                value={selectedTeams}
                                onChange={selectTeam}
                                className={styles.toggleButtonGroup}
                            >
                                {teams.map((team) => (
                                    <ToggleButton
                                        value={team}
                                        key={team.id}
                                        className={styles.toggleButton}
                                    >
                                        <Tooltip
                                            title={
                                                "Show all teams or set the displayed team"
                                            }
                                            placement={"bottom"}
                                        >
                                            <h5
                                                className={
                                                    styles.buttonSingleTeam
                                                }
                                            >
                                                {team.title}
                                            </h5>
                                        </Tooltip>
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </div>
                    </div>

                    <div className={styles.chips}>
                        {selectedMembers &&
                            selectedMembers
                                // some sorting?
                                // .sort((v1, v2) => v1.name - v2.name)
                                .map((member) => (
                                    <Chip
                                        label={member.name}
                                        key={member.vacationerId}
                                    />
                                ))}
                    </div>
                </div>
                <div className={styles.wholeCalendar}>
                    <div className={styles.rowOnCalendar}>
                        <FormGroup>
                            <Tooltip
                                title={
                                    "Filter people with holidays / all people"
                                }
                            >
                                <FormControlLabel
                                    checked={!showAllVacationers}
                                    onChange={() => {
                                        setShowAllVacationers(
                                            !showAllVacationers
                                        );
                                    }}
                                    control={<Switch color="success" />}
                                    disabled={disableConditions}
                                    label={
                                        <Typography>
                                            {selectedTeams.length === 0
                                                ? "Show only people on holiday in all teams"
                                                : selectedTeams.length === 1
                                                ? `Show only people on holiday in ${selectedTeams[0].title}`
                                                : "Show only people on holiday in selected teams"}
                                        </Typography>
                                    }
                                />
                            </Tooltip>
                        </FormGroup>
                        {user && user.name && (
                            <div className={styles.calendarSettingsBox}>
                                <div className={styles.calendarSettingSymbols}>
                                    {holidaySymbol} = confirmed holiday <br />{" "}
                                    {unconfirmedHolidaySymbol} = un-confirmed
                                    holiday
                                </div>
                                <Button
                                    variant={"contained"}
                                    color={"secondary"}
                                    onClick={handleSettingsClick}
                                    disabled={settingsOpen}
                                    size={"small"}
                                >
                                    Calendar settings
                                </Button>
                                <Popper
                                    open={settingsOpen}
                                    anchorEl={anchorEl}
                                    placement={"left-end"}
                                >
                                    <Box className={styles.popperBox}>
                                        <CalendarSettings
                                            changesDoneWarning={
                                                changesDoneWarning
                                            }
                                            setChangesDoneWarning={
                                                setChangesDoneWarning
                                            }
                                            setSettingsOpen={setSettingsOpen}
                                            columnHeight={columnHeight}
                                            setColumnHeight={setColumnHeight}
                                            holidaySymbol={holidaySymbol}
                                            setHolidaySymbol={setHolidaySymbol}
                                            unconfirmedHolidaySymbol={
                                                unconfirmedHolidaySymbol
                                            }
                                            setUnconfirmedHolidaySymbol={
                                                setUnconfirmedHolidaySymbol
                                            }
                                            holidayColor={holidayColor}
                                            setHolidayColor={setHolidayColor}
                                            unConfirmedHolidayColor={
                                                unConfirmedHolidayColor
                                            }
                                            setUnConfirmedHolidayColor={
                                                setUnConfirmedHolidayColor
                                            }
                                            weekendColor={weekendColor}
                                            setWeekendColor={setWeekendColor}
                                            weekendHolidayColor={
                                                weekendHolidayColor
                                            }
                                            setWeekendHolidayColor={
                                                setWeekendHolidayColor
                                            }
                                        />
                                    </Box>
                                </Popper>
                            </div>
                        )}
                    </div>
                    {/*)}*/}
                    <Tooltip
                        title={"Select displayed month"}
                        placement={"top-start"}
                    >
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
                    </Tooltip>
                    <div>
                        <table
                            {...getTableProps()}
                            className={styles.fullCalendar}
                        >
                            <thead>
                                {headerGroups.map((headerGroup) => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(
                                            (column: any) => (
                                                <th
                                                    {...column.getHeaderProps(
                                                        column.getSortByToggleProps(
                                                            {
                                                                title: "Sort by pressing column",
                                                            }
                                                        )
                                                    )}
                                                    style={{
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
                                                                styles.headerArrowSymbols
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
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map((cell, index) => {
                                                return (
                                                    <td
                                                        className={
                                                            styles.cellStyle
                                                        }
                                                        style={{
                                                            fontWeight: setBold(
                                                                cell.value
                                                            ),
                                                            height: `${columnHeight}em`,
                                                            border: setColumnStyle(
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
                                                        {cell.render("Cell")}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                {footerGroups.map((group) => (
                                    <tr {...group.getFooterGroupProps()}>
                                        {group.headers.map((column) => (
                                            <td
                                                {...column.getFooterProps()}
                                                style={{
                                                    border: setColumnStyle(
                                                        column
                                                    ),
                                                }}
                                            >
                                                {column.render("Footer")}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tfoot>
                        </table>
                    </div>
                    {showSpinner && <CircularProgress />}
                </div>
            </div>
        </>
    );
}
