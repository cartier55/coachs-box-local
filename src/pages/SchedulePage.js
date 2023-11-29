import { useEffect, useState } from "react";
import DayView from "../components/ScheduleComponents/DayView";
import MonthView from "../components/ScheduleComponents/MonthView";
import { isSameDay, parseISO } from "date-fns";
import { setHours, setMinutes, setSeconds, subMilliseconds } from 'date-fns';
import Test from "../components/Test";
import DateToolBar from "../components/ScheduleComponents/DayToolBar";
import EventList from "../components/ScheduleComponents/EventList";
import { useEvents } from "../react-query/useEvents";

const Schedule = () => {

  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  
  const today = new Date();
  // console.log(currentMonth)
  const { events, error, isLoading } = useEvents({ month: currentMonth.getMonth() + 1, year: currentMonth.getFullYear(), fetchType: 'monthly' });

  // console.log(data)
  
    console.log(currentMonth.getMonth() + 1)

    events ? console.log(events) : console.log('no events')

    // Pre-format the 'start' and 'end' fields to be Date objects
    const formattedEvents = events ? events.map(event => ({
      ...event,
      start: parseISO(event.start),
      end: parseISO(event.end)
    })) : [];

    const todaysEvents = formattedEvents.filter(event => isSameDay(event.start, selectedDate));

    function getElementIndex(element) {
      const parent = element.parentNode;
      const children = Array.from(parent.children);
      return children.indexOf(element);
    }

    const updateSelectedDayStyle = (date) => {
      let index;
      let greyDotRow;
      // Remove the rbc-now class from the previous element
      // Which adds red color to day number
      // console.log(typeof date)
      const currentElement = document.querySelector('div.rbc-row div.rbc-date-cell.rbc-now'); //Select the element with the rbc-now class that is the currently selected day
      if (currentElement) {
        index = getElementIndex(currentElement)
        // console.log(index)
        if (index >= 0) {
          // console.log(currentElement.parentNode.nextSibling.children)
          // console.log(currentElement.parentNode.nextSibling.children[index])
          if (currentElement.parentNode.nextSibling && currentElement.parentNode.nextSibling.children[index]){
            currentElement.parentNode.nextSibling.children[index].children[0].classList.remove('rbc-selected')
          }
        }
        currentElement.classList.remove('rbc-now'); //Remove the rbc-now class from the currently selected day
      }
  
      let eventDate; //Create placeholder for the event date
      if (isNaN(date)) { //If date is not a number
        eventDate = new Date(Date.parse(date)); //If string date argument is passed, convert it to a Date object
      } else {
        eventDate = new Date(date); //If is a number (timestamp), convert it to a Date object
      }

      let dayNumber = eventDate.getDate().toString(); //Get the day number of the eventDate and convert it to a string
      // Append '0' to the dayNumber if it's less than 10
      if(dayNumber.length === 1) { //If the dayNumber is less than 10
        dayNumber = '0' + dayNumber; //Append a '0' to the beginning of the dayNumber
      } 

      const dateCells = document.querySelectorAll('div.rbc-row div.rbc-date-cell:not(.rbc-off-range)'); //Select all the date cells that are not in the previous or next month
      dateCells.forEach(cell => {
        // console.log('test')
        const spanElement = cell.querySelector('span'); //Select the span element in the date cell
        if (spanElement && spanElement.textContent === dayNumber) { //If the span element exists and the text content of the span element is equal to the dayNumber
          cell.classList.add('rbc-now'); 
          // greyDotRow = cell.parentNode.nextSibling
          // cell.parentNode.nextSibling.children[getElementIndex(cell)].classList.add('rbc-selected')
          index = getElementIndex(cell);
          if (index >= 0) {
            if (cell.parentNode.nextSibling && cell.parentNode.nextSibling.children[index]){
              cell.parentNode.nextSibling.children[index].children[0].classList.add('rbc-selected')
            }
          }
        }
      });

      setSelectedDate(date); //Set the selected date to the date passed in
      // console.log(date) 
    }
  
    useEffect(() => {
      // console.log("Selected Date:", selectedDate);
      updateSelectedDayStyle(selectedDate);
      if (selectedDate.getMonth() !== currentMonth.getMonth()) {
        setCurrentMonth(selectedDate);
    }
    }, [selectedDate]);
    
    if (isLoading) return 'Loading...';
    if (error) return `An error occurred: ${error.message}`;

    return (
        <div style={{height:'50%'}}>
            <MonthView
                currentMonth={currentMonth}
                setSelectedDate={setSelectedDate}
                events={formattedEvents} 
                onSelectSlot={slotInfo => {
                    setSelectedDate(slotInfo.start);
                }}
                onSelectEvent={(event) => updateSelectedDayStyle(event.start)}
            />
            <DayView events={todaysEvents} currentDate={selectedDate} setCurrentDate={setSelectedDate} />
            {/* <DateToolBar/>
            <EventList events={todaysEvents} /> */}
        </div>
    );
}
 
export default Schedule;
