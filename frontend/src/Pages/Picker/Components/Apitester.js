import {useEffect, useState} from "react";
import axios from "axios";

export default function Apitester(props) {

    const [numberOfPeople, setNumberOfPeople] = useState(0)

    useEffect(() => {
        axios.get(`http://localhost:3001/vacationeramount?start=${props.start}&end=${props.end}`).then((response) => {
            setNumberOfPeople(response.data.length);
        });
    }, [props.end]);

    return (
        <>
            {numberOfPeople}
        </>
    )
}