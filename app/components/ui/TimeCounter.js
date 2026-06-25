"use client";
import { useEffect, useState } from "react";

export default function TimeCounter({ matchDate, matchTime, className = "" }) {
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  useEffect(() => {
    let interval;

    function convertTime(timeStr) {
      const [time, modifier] = timeStr.split(" ");
      const [rawHours, mins] = time.split(":");
      let hoursVal = rawHours;
      if (hoursVal === "12") hoursVal = "00";
      if (modifier === "PM") {
        hoursVal = (parseInt(hoursVal) + 12).toString();
      }
      return `${hoursVal}:${mins}`;
    }

    function convertTimestamp(mDate, mTime) {
      const months = [
        "January",
        "Feburary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const [year, month, day] = mDate.split("-");
      return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year} ${convertTime(mTime)}`;
    }

    const initCounter = () => {
      // A full ISO instant (contains "T") is the exact match time — count to it directly;
      // otherwise build the target from the date + time strings (parsed in local time).
      const countDownDate =
        typeof matchDate === "string" && matchDate.includes("T")
          ? new Date(matchDate).getTime()
          : new Date(convertTimestamp(matchDate, matchTime)).getTime();

      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        if (distance < 0) {
          clearInterval(interval);
          setDays("0");
          setHours("0");
          setMinutes("0");
          setSeconds("0");
          return;
        }

        setDays(Math.floor(distance / (1000 * 60 * 60 * 24)).toString());
        setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString());
        setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString());
        setSeconds(Math.floor((distance % (1000 * 60)) / 1000).toString());
      }, 1000);
    };

    initCounter();
    return () => clearInterval(interval);
  }, [matchDate, matchTime]);

  return (
    <div className={`flex gap-6 flex-wrap justify-between ${className}`}>
      {[
        { label: "DAY", value: days },
        { label: "HOUR", value: hours },
        { label: "MINUTE", value: minutes },
        { label: "SECOND", value: seconds },
      ].map(({ label, value }) => (
        <div key={label} className="text-center">
          <p className="p2 font-medium tracking-wide">{label}</p>
          <div className="text-[6vw] font-semibold font-oswald mt-1">{value}</div>
        </div>
      ))}
    </div>
  );
}
