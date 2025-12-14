import { JSX } from "react";
import { useGameStore } from "../state/gameStore";

const CalendarPage = (): JSX.Element => {
  const gameDate = useGameStore(state => state.gameDate);
  const { year, month: currentMonth, day: currentDay } = gameDate;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderMonth = (month: string, year: number) => {
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border rounded-md p-2 text-center bg-gray-800"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDate = year === gameDate.year && monthIndex + 1 === gameDate.month && day === gameDate.day;
      const dayClass = isCurrentDate
        ? "border rounded-md p-2 text-center bg-blue-500 font-bold"
        : "border rounded-md p-2 text-center bg-gray-700";

      days.push(
        <div key={day} className={dayClass}>
          {day}
        </div>
      );
    }

    return (
      <div key={month} className="bg-[#1a1a21] p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2 text-center text-white">{month} {year}</h3>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="font-bold text-center text-gray-400">{day}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">Calendar {year}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map(month => renderMonth(month, year))}
      </div>
    </div>
  );
};

export default CalendarPage;
