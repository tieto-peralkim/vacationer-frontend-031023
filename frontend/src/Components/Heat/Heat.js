import {useEffect, useState} from "react";
import axios from "axios";


export default function Heat() {

    const [holidayerData, setHolidayersData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/vacationers").then((response) => {
            setHolidayersData(response.data);
        });
    }, []);
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
            <div>
                {holidayerData.filter(holidayer => holidayer.vacations
            </div>
        </div>
    );
}
