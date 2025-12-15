import { JSX, useState, useEffect } from "react";
import { useGameStore } from "../state/gameStore";
import { getYearDrawDays } from "../../../utils/CompetitionFormatUtils";

interface DrawDate {
  day: number;
  month: number;
  year: number;
  compID: number;
  roundName: string | null;
}

const CalendarPage = (): JSX.Element => {
  const gameDate = useGameStore(state => state.gameDate);
  const getCompetitionPeriodicities = useGameStore(state => state.getCompetitionPeriodicities);
  const getCompetitionById = useGameStore(state => state.getCompetitionById);

  const { year } = gameDate;
  const [drawDates, setDrawDates] = useState<DrawDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);

  useEffect(() => {
    const periodicities = getCompetitionPeriodicities();
    const draws = getYearDrawDays(year, periodicities);
    setDrawDates(draws);
  }, [year, getCompetitionPeriodicities]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateClick = (day: number, month: number, year: number) => {
    if (selectedDate && selectedDate.day === day && selectedDate.month === month && selectedDate.year === year) {
      setSelectedDate(null);
    } else {
      setSelectedDate({ day, month, year });
    }
  };

  const renderMonth = (month: string, year: number) => {
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();

    const days: JSX.Element[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border border-gray-700 rounded-md p-2 text-center bg-gray-900"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDate = year === gameDate.year && monthIndex + 1 === gameDate.month && day === gameDate.day;
      const isDrawDate = drawDates.some(d => d.day === day && d.month === monthIndex + 1 && d.year === year);

      let dayClass = "border border-gray-600 rounded-md p-2 text-center bg-gray-800";
      if (isCurrentDate) {
        dayClass = "border border-indigo-600 rounded-md p-2 text-center bg-blue-500 font-bold";
      } else if (isDrawDate) {
        dayClass = "border border-green-600 rounded-md p-2 text-center bg-green-800 hover:bg-green-700 cursor-pointer";
      }

      days.push(
        <div key={day} className={dayClass} onClick={() => isDrawDate && handleDateClick(day, monthIndex + 1, year)}>
          {day}
        </div>
      );
    }

    const selectedDraws = selectedDate && selectedDate.month === monthIndex + 1 && selectedDate.year === year
      ? drawDates.filter(d => d.day === selectedDate.day && d.month === selectedDate.month && d.year === selectedDate.year)
      : [];

    return (
      <div key={month} className="bg-[#1a1a21] p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2 text-center text-white">{month} {year}</h3>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="font-bold text-center text-gray-400">{day}</div>
          ))}
          {days}
        </div>
        {selectedDraws.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold text-lg text-white">Draws for {month} {selectedDate?.day}</h4>
            <ul>
              {selectedDraws.map((draw, index) => {
                const competition = getCompetitionById(draw.compID);
                return (
                  <li key={index} className="text-white">
                    {competition?.name} - {draw.roundName ?? 'Main Draw'}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
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