import { useEffect, useMemo, useState} from "react";
import "./clockStyle.css";
import axios from "axios";

interface IClockProps {
  name: string;
}

interface IResponseApi {
  abbreviation: string
  client_ip: string
  datetime: string
  day_of_week: number
  day_of_year: number
  dst: boolean
  dst_from: null
  dst_offset: number
  dst_until: null
  raw_offset: number
  timezone: string
  unixtime: number
  utc_datetime: string
  utc_offset: string
  week_number: number
}



const Clock = ({ name }: IClockProps) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const secondsRotate = useMemo(() => seconds * 6, [seconds])
  const minutesRotate = useMemo(() => minutes * 6, [minutes])
  const hoursRotate = useMemo(() => (hours + minutes / 60) * 30, [hours, minutes])


  const handleLoadingEnd = () => {
    setIsLoading(false);
  }

  const handleErrorVisible = () => {
    setHasError(true);
  }

  const handleUpdateClock = () => {
     setSeconds(secondsPrevState => {
        if (secondsPrevState + 1 === 60) {
          setMinutes(minutesPrevState => {
            if (minutesPrevState + 1 === 60) {
              setHours((hoursPrevState) => {
                if (hoursPrevState + 1 === 25) {
                  return 0
                }
                return hoursPrevState + 1;
              })
              return 0;
            }
            return minutesPrevState + 1;
          })
          return 0
        }
        return secondsPrevState + 1
      });
  }


  useEffect(() => {
    axios.get<IResponseApi>("https://worldtimeapi.org/api/timezone/Asia/Yekaterinburg").then(r => {
      const response = r.data;

      const date = new Date(response.datetime).toLocaleString();
      const time = date.split(",")[1].replace(" ", "");
      const timeSplitArr = time.split(":").map(item => +item);


      setHours(timeSplitArr[0])
      setMinutes(timeSplitArr[1])
      setSeconds(timeSplitArr[2]);
      handleLoadingEnd()

      setInterval(handleUpdateClock, 1000);

    }).catch((e) => {
      handleErrorVisible()
      handleLoadingEnd()
      throw new Error(e);
    })
  }, []);

  return (
    <>
      {isLoading && <h1>Загрузка...</h1>}
      <div className={"clock"}>
        <p>{name}</p>
        <div className={"clock-face"}>
          <div
            className={"dial seconds"}
            style={{ transform: `rotate(${secondsRotate}deg)` }}
          />
          <div
            className={"dial minutes"}
            style={{ transform: `rotate(${minutesRotate}deg)` }}
          />
          <div
            className={"dial hours"}
            style={{ transform: `rotate(${hoursRotate}deg)` }}
          />
        </div>
      </div>
      {hasError && <h1 style={{color: "red"}}>Ошибка запроса!!</h1>}
    </>
  );
};

export default Clock;
