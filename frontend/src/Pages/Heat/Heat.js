import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import VacationerNumber from './Components/VacationerNumber'

export default function Heat() {
    const [holidayerData, setHolidayersData] = useState([]);
    const [lowerDate, setLowerDate] = useState(new Date());
    const [upperDate, setUpperDate] = useState(new Date());

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setHolidayersData(response.data);
        });
        console.log("lowerDate", lowerDate);
    }, []);



    const onChange = (date) => {
        console.log("date", date.toISOString());
        let firstDate = date;
        // Bug, does not work with 00:00:00:000, reason probably DST
        firstDate.setUTCHours(2, 0, 0, 0);
        setLowerDate(firstDate);
        console.log("pienii", firstDate.toISOString());
        let today = new Date(date);
        let secondDate = new Date(today.setUTCMonth(today.getUTCMonth() + 1));
        secondDate.setUTCHours(0, 0, 0, 0);
        setUpperDate(secondDate);
        console.log("isooo", secondDate.toISOString());
    };

    return (
        <div>
            <h1>Heat</h1>
            <ul>
                {holidayerData.map((holidayer, index) => (
                    <li key={index}>
                        <ul>
                            {holidayer.initials}
                            {holidayer.vacations.map((vacations, index) => (
                                <li key={index}>
                                    {vacations.start} - {vacations.end}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
            <DatePicker
                selected={lowerDate}
                onChange={onChange}
                inline
                calendarStartDay={1}
                showMonthYearPicker
            />
            <h3>This month colleagues on holiday:</h3>

            {holidayerData.length !== 0 && <VacationerNumber vacationers={holidayerData} startDate={lowerDate} endDate={upperDate}/>}
        </div>
    );
}
