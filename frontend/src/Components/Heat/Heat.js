import {useEffect, useState} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";

export default function Heat() {

    const [holidayerData, setHolidayersData] = useState([]);
    const [lowerDate, setLowerDate] = useState(new Date());
    const [upperDate, setUpperDate] = useState(new Date());

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setHolidayersData(response.data);
        });
    }, []);

    const onChange = (date) => {

        var firstDate = new Date(date.setUTCDate(1))
        firstDate.setUTCHours(0, 0, 0, 0);
        setLowerDate(firstDate);
        console.log("pienii", firstDate.toISOString())
        var secondDate = new Date(date.setUTCMonth(date.getUTCMonth() + 1))
        secondDate.setUTCHours(0, 0, 0, 0);
        setUpperDate(secondDate);
        console.log("isooo", secondDate.toISOString())
    }

    return (
        <div>
            <h1>Heat</h1>
            <p>Sisältöä</p>
            <ul>
                {holidayerData.map((holidayer) => (
                    <li key={holidayer.id}>
                        <ul>
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
                locale="fi"
                // className={styles.datePicker}
                selected={lowerDate}
                onChange={onChange}
                inline
                calendarStartDay={1}
                showMonthYearPicker
            />
            <h3>Filtered</h3>
            <div>{lowerDate.toISOString()} ja {upperDate.toISOString()} välillä lomalla ovat</div>
            <ul>
                {holidayerData.filter(holidayer => holidayer.vacations[0].start < upperDate.toISOString() && holidayer.vacations[0].end > lowerDate.toISOString())
                        .map((filteredHoliday, index) => (
                            <li key={index}>{filteredHoliday.vacations[0].start} - {filteredHoliday.vacations[0].end}</li>
                        ))}
            </ul>
        </div>
    );
}
