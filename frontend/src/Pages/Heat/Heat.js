import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './styles.css'

export default function Heat() {
    const [startDate, setStartDate] = useState(new Date());
    const [firstAmount, setFirstAmount] = useState(0);
    const [secondAmount, setSecondAmount] = useState(0);
    const [thirdAmount, setThirdAmount] = useState(0);
    const [fourthAmount, setFourthAmount] = useState(0);
    const [fifthAmount, setFifthAmount] = useState(0);

    const [highlightedRanges, setHighlightedRanges] = useState([])
    const [disabledRanges, setDisabledRanges] = useState([])

    // From https://stackoverflow.com/questions/1184334/get-number-days-in-a-specified-month-using-javascript
    const daysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    }

    const saveToGroup = (vacationerAmount, start) => {
        let dateGroup = [];

        console.log("iso d", vacationerAmount, start, start.getUTCDate())
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

        if (start.getUTCDate() === 28){
            switch (daysInMonth(start.getUTCMonth() + 1, start.getUTCFullYear())){
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
            dateGroup.push(start, oneAfter, twoAfter, threeAfter, fourAfter, fiveAfter, sixAfter)
        }

        switch (true) {
            case vacationerAmount < 1:
                setHighlightedRanges((oldHighlighted) => [...oldHighlighted, {"react-datepicker__day--highlighted-custom-1b": dateGroup}])
                break;
            case vacationerAmount >= 1 && vacationerAmount < 2:
                setHighlightedRanges((oldHighlighted) => [...oldHighlighted, {"react-datepicker__day--highlighted-custom-2": dateGroup}])
                break;
            case vacationerAmount >= 2 && vacationerAmount < 3:
                setHighlightedRanges((oldHighlighted) => [...oldHighlighted, {"react-datepicker__day--highlighted-custom-2b": dateGroup}])
                break;
            case vacationerAmount >= 3 && vacationerAmount < 4:
                setHighlightedRanges((oldHighlighted) => [...oldHighlighted, {"react-datepicker__day--highlighted-custom-3": dateGroup}])
                break;
            case vacationerAmount >= 4 && vacationerAmount < 5:
                setHighlightedRanges((oldHighlighted) => [...oldHighlighted, {"react-datepicker__day--highlighted-custom-4": dateGroup}])
                break;
            case vacationerAmount >= 5 && vacationerAmount < 6:
                setHighlightedRanges((oldHighlighted) => [...oldHighlighted, {"react-datepicker__day--highlighted-custom-5": dateGroup}])
                break;
            case vacationerAmount >= 6:
                let disabledDateGroup = [];
                disabledDateGroup.start = start
                disabledDateGroup.end = sixAfter
                setDisabledRanges((oldDisabled) => [...oldDisabled, disabledDateGroup])
                break;
        }
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
        onChange(new Date())
    },[])

    const onChange = (date) => {
        setStartDate(date)
        setHighlightedRanges((oldHighlighted) => [])
        console.log("date", date.toISOString());

        // 1st day of the month
        let first = new Date(date.getUTCFullYear(), date.getUTCMonth(), 2);
        first.setUTCHours(0)
        console.log("yksi", first.toISOString());

        // 7th day of the month
        let second = new Date(date);
        second.setUTCHours(23, 59, 59)
        second.setUTCDate(first.getUTCDate() + 6);
        getFirst(first, second);
        console.log("kaksi", second.toISOString());

        // 14th day of the month
        let third = new Date(date);
        third.setUTCHours(23, 59, 59)
        third.setUTCDate(second.getUTCDate() + 7);
        getSecond(second, third);
        console.log("kolme", third.toISOString());

        // 21st day of the month
        let fourth = new Date(date);
        fourth.setUTCHours(23, 59, 59)
        fourth.setUTCDate(third.getUTCDate() + 7);
        getThird(third, fourth);
        console.log("neljä", fourth.toISOString());

        // 28th day of the month
        let fifth = new Date(date);
        fifth.setUTCHours(23, 59, 59)
        fifth.setUTCDate(fourth.getUTCDate() + 7);
        getFourth(fourth, fifth);
        console.log("viisi", fifth.toISOString());

        // Last day of the month (28th for FEB)
        let sixth = new Date(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
        sixth.setUTCHours(23, 59, 59)
        getFifth(fifth, sixth);
        console.log("kuusi", sixth.toISOString());
    };


    return (
        <div>
            <h1>Heat</h1>

            <div>{firstAmount && firstAmount}</div>
            <div>{secondAmount && secondAmount}</div>
            <div>{thirdAmount && thirdAmount}</div>
            <div>{fourthAmount && fourthAmount}</div>
            <div>{fifthAmount && fifthAmount}</div>
            <div>
                <DatePicker
                    selected={startDate}
                    value={startDate}
                    onChange={onChange}
                    onMonthChange={onChange}
                    inline
                    calendarStartDay={1}
                    highlightDates={highlightedRanges}
                    excludeDateIntervals={disabledRanges}
                    disabledKeyboardNavigation
                />
            </div>
        </div>
    );
}
