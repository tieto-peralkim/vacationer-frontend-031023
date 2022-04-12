import {useEffect, useMemo, useState} from "react";
import {useTable} from "react-table";
import axios from "axios";
import {Box, Button, TextField} from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styles from "./panorama.module.css";
import {CompactPicker} from "react-color";

export default function Panorama() {

    const today = new Date();
    const thisMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1)

    const [allHolidaysSelectedTime, setAllHolidaysSelectedTime] = useState([])
    const [displayColorPicker, setDisplayColorPicker] = useState(false)

    const [holidayColor, setHolidayColor] = useState("#73D8FF")
    const [weekendColor, setWeekendColor] = useState("#CCCCCC")
    const [weekendHolidayColor, setWeekendHolidayColor] = useState("#666666")

    const [holidaySymbol, setHolidaySymbol] = useState(true)
    const WORKER_AMOUNT = 20;
    const WORKER_TITLE = "Paikalla"

    const [selectedDate, setSelectedDate] = useState(thisMonthFirst)
    const [selectedYear, setSelectedYear] = useState(thisMonthFirst.getFullYear())
    const [publicHolidaysOfMonth, setPublicHolidaysOfMonth] = useState([])
    const [publicHolidays, setPublicHolidays] = useState(thisMonthFirst.getFullYear())

    let hiddenColumns = []


    // https://date.nager.at/ Public holiday API
    useEffect(() => {
        axios.get(`https://date.nager.at/api/v3/publicholidays/${selectedYear}/FI`)
            .then((response) => {
                let publicDays = []
                for (let i = 0; i < response.data.length; i++) {
                    let publicDay = {}
                    publicDay["month"] = parseInt(response.data[i].date.slice(5, 7))
                    publicDay["day"] = parseInt(response.data[i].date.slice(8, 10))
                    publicDays.push(publicDay)
                }
                setPublicHolidays(publicDays)
                console.log("publicDays", publicDays)
            })
            .catch((error) => {
                console.error("There was a get error!", error);
            })
    }, [selectedYear])

    useEffect(() => {
        if (selectedDate.getFullYear() !== selectedYear) {
            setSelectedYear(selectedDate.getFullYear())
        }
        let publicDays = []
        for (let i = 0; i < publicHolidays.length; i++) {
            if (publicHolidays[i].month === selectedDate.getMonth() + 1) {
                publicDays.push(publicHolidays[i].day)
            }
        }
        console.log("publi", publicDays)
        setPublicHolidaysOfMonth(publicDays)
    }, [selectedDate, publicHolidays])

    const handleClick = () => {
        setDisplayColorPicker(prevValue => !prevValue)
    }
    const handleClose = () => {
        setDisplayColorPicker(false)
    }

    const handleHolidayColorChange = (color) => {
        setHolidayColor(color.hex)
    }
    const handleWeekendColorChange = (color) => {
        setWeekendColor(color.hex)
    }
    const handleWeekendHolidayColorChange = (color) => {
        setWeekendHolidayColor(color.hex)
    }

    const setExcludedDates = (vacationers) => {
        let pureVacations = [];
        let namesOfVacationers = []
        for (let i = 0; i < vacationers.length; i++) {
            console.log(vacationers[i].vacations.start)
            let holidayObject = new Object()
            if (vacationers[i].name.length > 9) {
                holidayObject.name = vacationers[i].name.slice(0, 9) + "..."
            } else {
                holidayObject.name = vacationers[i].name
            }
            holidayObject.start = vacationers[i].vacations.start
            holidayObject.end = vacationers[i].vacations.end
            holidayObject.comment = vacationers[i].vacations.comment
            holidayObject.id = vacationers[i].vacations._id
            let repeatingHolidayer;
            repeatingHolidayer = pureVacations.find(holiday => holiday.name === holidayObject.name);
            console.log("repee", repeatingHolidayer)

            if (repeatingHolidayer) {
                setNumbers(repeatingHolidayer, new Date(vacationers[i].vacations.start), new Date(vacationers[i].vacations.end))
                let index = pureVacations.findIndex((holiday) => holiday.name === holidayObject.name)
                pureVacations[index] = repeatingHolidayer;
            } else {
                setNumbers(holidayObject, new Date(vacationers[i].vacations.start), new Date(vacationers[i].vacations.end))
                namesOfVacationers.push(vacationers[i].name)
                pureVacations.push(holidayObject);
            }
        }
        pureVacations.push(
            {
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
            })
        console.log("PUR", pureVacations)
        setAllHolidaysSelectedTime(pureVacations)
    }

    const getWorkerAmount = (data, key) => {
        // try {
        //     console.log("häähä", data, key, data[1][key])
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i][key] === holidaySymbol) {
                total++
            }
        }
        return WORKER_AMOUNT - total;
        // } catch (e) {
        //     return WORKER_AMOUNT
        // }
    };

    const setNumbers = (holidayObject, start, end) => {
        console.log("obje", start.getDate(), end)

        let startingNumber = 0
        let endingNumber = 0

        if (start.getMonth() === end.getMonth()) {
            startingNumber = start.getDate()
            endingNumber = end.getDate()
        } else if (start.getMonth() !== selectedDate.getMonth() && end.getMonth() !== selectedDate.getMonth()) {
            startingNumber = 1
            endingNumber = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
        } else if (start.getMonth() !== selectedDate.getMonth()) {
            startingNumber = 1
            endingNumber = end.getDate()
        } else if (start.getMonth() === selectedDate.getMonth()) {
            startingNumber = start.getDate()
            endingNumber = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
        }

        console.log("objekt numerot", startingNumber, endingNumber)
        for (let i = startingNumber; i <= endingNumber; i++) {
            switch (i) {
                case 1:
                    holidayObject.one = holidaySymbol
                    break;
                case 2:
                    holidayObject.two = holidaySymbol
                    break;
                case 3:
                    holidayObject.three = holidaySymbol
                    break;
                case 4:
                    holidayObject.four = holidaySymbol
                    break;
                case 5:
                    holidayObject.five = holidaySymbol
                    break;
                case 6:
                    holidayObject.six = holidaySymbol
                    break;
                case 7:
                    holidayObject.seven = holidaySymbol
                    break;
                case 8:
                    holidayObject.eight = holidaySymbol
                    break;
                case 9:
                    holidayObject.nine = holidaySymbol
                    break;
                case 10:
                    holidayObject.ten = holidaySymbol
                    break;
                case 11:
                    holidayObject.eleven = holidaySymbol
                    break;
                case 12:
                    holidayObject.twelve = holidaySymbol
                    break;
                case 13:
                    holidayObject.thirteen = holidaySymbol
                    break;
                case 14:
                    holidayObject.fourteen = holidaySymbol
                    break;
                case 15:
                    holidayObject.fifteen = holidaySymbol
                    break;
                case 16:
                    holidayObject.sixteen = holidaySymbol
                    break;
                case 17:
                    holidayObject.seventeen = holidaySymbol
                    break;
                case 18:
                    holidayObject.eighteen = holidaySymbol
                    break;
                case 19:
                    holidayObject.nineteen = holidaySymbol
                    break;
                case 20:
                    holidayObject.twenty = holidaySymbol
                    break;
                case 21:
                    holidayObject.twentyone = holidaySymbol
                    break;
                case 22:
                    holidayObject.twentytwo = holidaySymbol
                    break;
                case 23:
                    holidayObject.twentythree = holidaySymbol
                    break;
                case 24:
                    holidayObject.twentyfour = holidaySymbol
                    break;
                case 25:
                    holidayObject.twentyfive = holidaySymbol
                    break;
                case 26:
                    holidayObject.twentysix = holidaySymbol
                    break;
                case 27:
                    holidayObject.twentyseven = holidaySymbol
                    break;
                case 28:
                    holidayObject.twentyeight = holidaySymbol
                    break;
                case 29:
                    holidayObject.twentynine = holidaySymbol
                    break;
                case 30:
                    holidayObject.thirty = holidaySymbol
                    break;
                case 31:
                    holidayObject.thirtyone = holidaySymbol
                    break;
            }
        }
    }


    // Month lengths (0-11)
    useEffect(() => {
        // Leap year
        if (((selectedDate.getFullYear() % 4 === 0 && selectedDate.getFullYear() % 100 !== 0) || selectedDate.getFullYear() % 400 === 0) && selectedDate.getMonth() === 1) {
            setHiddenColumns(["thirty", "thirtyone"])
        } else {
            switch (selectedDate.getMonth()) {
                case 1:
                    setHiddenColumns(["twentynine", "thirty", "thirtyone"])
                    break;
                case 0:
                case 2:
                case 4:
                case 6:
                case 7:
                case 9:
                case 11:
                    setHiddenColumns([])
                    break;
                case 3:
                case 5:
                case 6:
                case 8:
                case 10:
                    setHiddenColumns(["thirtyone"])
                    break;
            }
        }

        let nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)

        console.log("neee", selectedDate, nextMonth)

        axios.get(`http://localhost:3001/holidaysbetween?start=${selectedDate.toISOString()}&end=${nextMonth.toISOString()}`)
            .then((response) => {
                setExcludedDates(response.data);
                console.log(response.data)
            })
            .catch((error) => {
                console.error("There was a get error!", error);
            })
    }, [selectedDate])


    // const EditableCell = ({
    //     value: initialValue,
    //     row: { index },
    //     column: { id },
    // }) => {
    //     const [value, setValue] = useState(initialValue)
    //
    //     const onChange = e => {
    //         setValue(true)
    //     }
    //     useEffect(() =>{
    //         setValue(initialValue)
    //     }, [initialValue])
    //
    //     return <button>{value}</button>
    // }
    //
    // const defaultColumn = {
    //     Cell: EditableCell,
    // }

    const columns = useMemo(
        () => [
            {
                Header: 'name',
                accessor: 'name',
            },
            {
                Header: '1',
                accessor: "one",
            },
            {
                Header: '2',
                accessor: "two",
            },
            {
                Header: '3',
                accessor: "three"
            },
            {
                Header: '4',
                accessor: "four"
            },
            {
                Header: '5',
                accessor: "five"
            },
            {
                Header: '6',
                accessor: "six"
            },
            {
                Header: '7',
                accessor: "seven"
            },
            {
                Header: '8',
                accessor: "eight"
            },
            {
                Header: '9',
                accessor: "nine"
            },
            {
                Header: '10',
                accessor: "ten"
            },
            {
                Header: '11',
                accessor: "eleven"
            },
            {
                Header: '12',
                accessor: "twelve"
            },
            {
                Header: '13',
                accessor: "thirteen"
            },
            {
                Header: '14',
                accessor: "fourteen"
            },
            {
                Header: '15',
                accessor: "fifteen"
            },
            {
                Header: '16',
                accessor: "sixteen"
            },
            {
                Header: '17',
                accessor: "seventeen"
            },
            {
                Header: '18',
                accessor: "eighteen"
            },
            {
                Header: '19',
                accessor: "nineteen"
            },
            {
                Header: '20',
                accessor: "twenty"
            },
            {
                Header: '21',
                accessor: "twentyone"
            },
            {
                Header: '22',
                accessor: "twentytwo"
            },
            {
                Header: '23',
                accessor: "twentythree"
            },
            {
                Header: '24',
                accessor: "twentyfour"
            },
            {
                Header: '25',
                accessor: "twentyfive"
            },
            {
                Header: '26',
                accessor: "twentysix"
            },
            {
                Header: '27',
                accessor: "twentyseven"
            },
            {
                Header: '28',
                accessor: "twentyeight"
            },
            {
                Header: '29',
                accessor: "twentynine"
            },
            {
                Header: '30',
                accessor: "thirty"
            },
            {
                Header: '31',
                accessor: "thirtyone"
            },
        ],
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setHiddenColumns
    } = useTable({
        columns, data: allHolidaysSelectedTime,
        // defaultColumn,
        initialState: {
            hiddenColumns: hiddenColumns
        }
    })

    const goBackMonth = () => {
        let newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
        setSelectedDate(newDate)
    }
    const goForwardMonth = () => {
        let newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
        setSelectedDate(newDate)
    }


    const isCommonHoliday = (holiday, index) => {
        let colorToAdd = null

        if (index !== 0) {
            if (holiday === holidaySymbol) {
                colorToAdd = holidayColor
            }
            let dateToCheck = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), index)

            if (dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6) {
                if (holiday === holidaySymbol) {
                    colorToAdd = weekendHolidayColor
                } else {
                    colorToAdd = weekendColor
                }
            }
            if (publicHolidaysOfMonth.filter(e => e === index).length > 0) {
                if (holiday === holidaySymbol) {
                    colorToAdd = weekendHolidayColor
                } else {
                    colorToAdd = weekendColor
                }
            }
            if (typeof holiday === "number" || holiday === WORKER_TITLE) {
                colorToAdd = "bisque"
                if (holiday < 0.85 * WORKER_AMOUNT) {
                    colorToAdd = "orange"
                }
            }
        }
        return colorToAdd
    }


    const setBold = (value) => {
        if (typeof value === "number" || value === WORKER_TITLE) {
            return "bold";
        }
        return null;
    }

    const setTodayHeader = (header) => {
        console.log("jotain", header, selectedDate.getDate())
        if (today.getFullYear() === selectedDate.getFullYear() && today.getMonth() === selectedDate.getMonth() && header == today.getDate()) {
            return "blue"
        } else {
            return "aliceblue"
        }
    }

    const setTodayColumn = (value) => {
        console.log("valuu", value)
        if (today.getFullYear() === selectedDate.getFullYear() && today.getMonth() === selectedDate.getMonth() && parseInt(value.Header) === today.getDate()) {
            return "solid 2px blue"
        } else {
            return "solid 1px black"
        }
    }
    return (
        <>
            {/*<Button onClick={handleClick}>Holidaycolor</Button>*/}
            {/*{displayColorPicker ? <div className={styles.popover}>*/}
            {/*    <div className={styles.cover} onClick={handleClose}/>*/}
            <div className={styles.colorPickers}>
                <div><h3>Holiday color</h3>
                    <CompactPicker color={holidayColor} onChangeComplete={handleHolidayColorChange}/></div>
                <div><h3>Weekend color</h3>
                    <CompactPicker color={weekendColor} onChangeComplete={handleWeekendColorChange}/></div>
                <div><h3>Weekend holiday color</h3>
                    <CompactPicker color={weekendHolidayColor} onChangeComplete={handleWeekendHolidayColorChange}/>
                </div>
            </div>
            {/*</div> : null}*/}
            <TextField
                // className={styles.}
                label="Holiday symbol"
                variant="outlined"
                value={holidaySymbol}
                onChange={(e) => {
                    setHolidaySymbol(e.target.value)
                    setNumbers()
                }}/>
            <div className={styles.wholePage}>
                <Box className={styles.buttons}>
                    <Button onClick={() => goBackMonth()} startIcon={
                        <ArrowBackIosIcon/>}>Edellinen</Button>{selectedDate.toLocaleString('default', {
                    month: 'long',
                    year: 'numeric'
                })}<Button onClick={() => goForwardMonth()} endIcon={<ArrowForwardIosIcon/>}>Seuraava</Button>
                </Box>
                {allHolidaysSelectedTime.length > 0 ? <table {...getTableProps()} style={{border: 'solid 1px blue'}}>
                    <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th
                                    {...column.getHeaderProps()}
                                    style={{
                                        background: setTodayHeader(column.Header),
                                        color: 'black',
                                        width: '10px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell, index) => {
                                    console.log("info", cell.value, index)
                                    return (
                                        <td
                                            {...cell.getCellProps(
                                                {
                                                    onClick: () => {
                                                        console.log("juuh", cell.row.original.name, cell.column.Header)
                                                    }
                                                }
                                            )}
                                            style={{
                                                fontWeight: setBold(cell.value),
                                                paddingTop: '6px',
                                                height: '30px',
                                                maxWidth: '100px',
                                                border: setTodayColumn(cell.column),
                                                backgroundColor: isCommonHoliday(cell.value, index)
                                            }}
                                        >
                                            {cell.render('Cell')}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                    </tbody>
                </table> : <p>No vacationers</p>}
            </div>
        </>
    )
}