import {useEffect, useMemo, useState} from "react";
import {useTable} from "react-table";
import axios from "axios";
import {Box, Button} from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styles from "./panorama.module.css";


export default function Panorama() {

    const today = new Date();
    const thisMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1)

    const [allHolidaysSelectedTime, setAllHolidaysSelectedTime] = useState([])
    const [selectedDate, setSelectedDate] = useState(thisMonthFirst)
    let hiddenColumns = []

    const setExcludedDates = (vacationers) => {
        let pureVacations = [];
        let namesOfVacationers = []
        for (let i = 0; i < vacationers.length; i++) {
            console.log(vacationers[i].vacations.start)
            let holidayObject = new Object()
            holidayObject.name = vacationers[i].name
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
        console.log("PUR", pureVacations)
        setAllHolidaysSelectedTime(pureVacations)
    }

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
                    holidayObject.one = "X"
                    break;
                case 2:
                    holidayObject.two = "X"
                    break;
                case 3:
                    holidayObject.three = "X"
                    break;
                case 4:
                    holidayObject.four = "X"
                    break;
                case 5:
                    holidayObject.five = "X"
                    break;
                case 6:
                    holidayObject.six = "X"
                    break;
                case 7:
                    holidayObject.seven = "X"
                    break;
                case 8:
                    holidayObject.eight = "X"
                    break;
                case 9:
                    holidayObject.nine = "X"
                    break;
                case 10:
                    holidayObject.ten = "X"
                    break;
                case 11:
                    holidayObject.eleven = "X"
                    break;
                case 12:
                    holidayObject.twelve = "X"
                    break;
                case 13:
                    holidayObject.thirteen = "X"
                    break;
                case 14:
                    holidayObject.fourteen = "X"
                    break;
                case 15:
                    holidayObject.fifteen = "X"
                    break;
                case 16:
                    holidayObject.sixteen = "X"
                    break;
                case 17:
                    holidayObject.seventeen = "X"
                    break;
                case 18:
                    holidayObject.eightteen = "X"
                    break;
                case 19:
                    holidayObject.nineteen = "X"
                    break;
                case 20:
                    holidayObject.twenty = "X"
                    break;
                case 21:
                    holidayObject.twentyone = "X"
                    break;
                case 22:
                    holidayObject.twentytwo = "X"
                    break;
                case 23:
                    holidayObject.twentythree = "X"
                    break;
                case 24:
                    holidayObject.twentyfour = "X"
                    break;
                case 25:
                    holidayObject.twentyfive = "X"
                    break;
                case 26:
                    holidayObject.twentysix = "X"
                    break;
                case 27:
                    holidayObject.twentyseven = "X"
                    break;
                case 28:
                    holidayObject.twentyeight = "X"
                    break;
                case 29:
                    holidayObject.twentynine = "X"
                    break;
                case 30:
                    holidayObject.thirty = "X"
                    break;
                case 31:
                    holidayObject.thirtyone = "X"
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
                    console.log("nyt")
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

        console.log("neee", selectedDate.getMonth(), nextMonth)

        axios.get(`http://localhost:3001/holidaysbetween?start=${selectedDate.toISOString()}&end=${nextMonth.toISOString()}`)
            .then((response) => {
                setExcludedDates(response.data);
                console.log(response.data)
            })
            .catch((error) => {
                console.error("There was a get error!", error);
            })
    }, [selectedDate])


    const columns = useMemo(
        () => [
            {
                Header: 'name',
                accessor: 'name',
            },
            {
                Header: '1',
                accessor: "one"
            },
            {
                Header: '2',
                accessor: "two"
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
                accessor: "eightteen"
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
        columns, data: allHolidaysSelectedTime, initialState: {
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

    return (
        <>
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
                                        background: 'aliceblue',
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
                                {row.cells.map(cell => {
                                    return (
                                        <td
                                            {...cell.getCellProps()}
                                            style={{
                                                padding: '10px',
                                                width: '10px',
                                                border: 'solid 1px gray',
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