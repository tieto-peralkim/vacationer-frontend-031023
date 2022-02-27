import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./picker.module.css";
import fi from "date-fns/locale/fi";

registerLocale("fi", fi);

export default function Picker() {
  const [initials, setInitials] = useState("");
  const [holidayers, setHolidayers] = useState([]);

  // startDate is local date at noon UTC (just to set the calendar default)
  const [startDate, setStartDate] = useState(new Date());
  startDate.setUTCHours(12, 0, 0, 0);
  console.log("sd",startDate)
  const [endDate, setEndDate] = useState(null);

  const today = new Date();

  //  nexMonday and nextSunday are in UTC time
  const nextMonday = new Date();
  nextMonday.setUTCDate(
    today.getUTCDate() + ((1 + 7 - today.getUTCDay()) % 7 || 7)
  );
  nextMonday.setUTCHours(0, 0, 0, 0);
  const nextSunday = new Date();
  nextSunday.setUTCDate(nextMonday.getUTCDate() + 6);
  nextSunday.setUTCHours(23, 59, 59, 999);

  const [vacationers, setVacationers] = useState(0);

  const checkOverlaps = (vacations) => {
    for (let i = 0; i < vacations.length; i++) {
      console.log(nextMonday.toISOString() < vacations[i].end);
      console.log(nextSunday.toISOString() >= vacations[i].start);
      console.log("terve");
      // console.log("MON", nextMonday.toISOString(), "SUN", nextSunday.toISOString());
      console.log("today", today.toISOString());

      if (
        nextMonday.toISOString() <= vacations[i].end &&
        nextSunday.toISOString() >= vacations[i].start
      ) {
        console.log("Lomalla", vacations[i].start, "-", vacations[i].end);
        setVacationers((vacationers) => vacationers + 1);
        return;
      } else {
        // console.log("Loma ei ensi viikolla:", new Date(Date.parse(vacations[i].start)).toLocaleDateString(), "-", new Date(Date.parse(vacations[i].end)).toLocaleDateString());
      }
    }
  };

  useEffect(() => {
    axios.get("http://localhost:3001/vacationers").then((response) => {
      setHolidayers(response.data);
    });
  }, []);

  useEffect(() => {
    for (let i = 0; i < holidayers.length; i++) {
      console.log("id ", holidayers[i].id);
      checkOverlaps(holidayers[i].vacations);
    }
  }, [holidayers]);

  const createVacation = (e) => {
    e.preventDefault();
    const newVacation = {
      initials: initials,
      vacations: [
        {
          start: startDate,
          end: endDate,
        },
      ],
    };
    console.log("NV", newVacation);
    console.log("NV", startDate instanceof Date);

    axios
      .post("http://localhost:3001/vacationers", newVacation)
      .then((response) => console.log(response))
      .catch((error) => {
        console.error("There was a post error!", error);
      });
  };

  const onChange = (dates) => {
    const [start, end] = dates;
    console.log("nää on", start, end)
    setStartDate(start)
    setEndDate(end);
  };

  return (
    <div>
      <h1>Picker</h1>
      <h2>
        Tänään on {today.toLocaleDateString()}. getDay on {today.getUTCDay()}
      </h2>
      <h2>
        Ensi viikko on {nextMonday.toISOString()} - {nextSunday.toISOString()}
      </h2>
      <h2>Ensi viikolla on {vacationers} työntekijää lomalla</h2>

      <div>
        <div>Add vacation</div>
        <form onSubmit={createVacation}>
          <label>
            Name
            <input
              type="text"
              name="user"
              onChange={(e) => setInitials(e.target.value)}
            />
          </label>
          <DatePicker
            locale="fi"
            className={styles.datePicker}
            selected={startDate}
            onChange={onChange}
            selectsRange
            startDate={startDate}
            endDate={endDate}
            inline
            calendarStartDay={1}
            showWeekNumbers
          />
          <input type="submit" value="Save" />
        </form>
      </div>
      <div>
        <ul>
          {holidayers.map((holidayer) => (
            <li key={holidayer.id}>
              {holidayer.initials ? <b>{holidayer.initials}</b> : <b>No name</b>}
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
      </div>
    </div>
  );
}
