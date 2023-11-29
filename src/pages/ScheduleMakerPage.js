import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../stylez/ScheduleMaker.css';
import { addDays, format, isSameDay, parseISO, set } from 'date-fns';
import useScheduleMaker from '../react-query/useScheduleMaker';
import { formatDateTime } from '../functions/Helpers';

// const initialTimeSlots = (startDate, numDays) => {
//   const days = [];
//   for (let i = 0; i < numDays; i++) {
//     const date = addDays(startDate, i);
//     days.push({
//       date,
//       slots: [{start:'5:00a', title:''}, {start:'6:00a', title:''}, {start:'7:30a', title:''}, {start:'9:00a', title:''}, {start:'10:15a', title:''}, {start:'11:30a', title:''}, {start:'4:00p', title:''}, {start:'5:15p', title:''}, {start:'6:30p', title:''}]
//     });
//   }
//   return days;
// };

// const buildTimeSlots = (startDate, numDays, timeSlots) => {
//     const days = [];
//     for (let i = 0; i < numDays; i++) {
//         const date = addDays(startDate, i);
//         let dayTimeSlots = [];
//         timeSlots.forEach(timeSlot => {
//             if (isSameDay(date, parseISO(timeSlot.start))) {
//                 dayTimeSlots.push(timeSlot);
//             }
//         });
//         days.push({
//           date,
//         //   slots: [{start:'5:00a', title:''}, {start:'6:00a', title:''}, {start:'7:30a', title:''}, {start:'9:00a', title:''}, {start:'10:15a', title:''}, {start:'11:30a', title:''}, {start:'4:00p', title:''}, {start:'5:15p', title:''}, {start:'6:30p', title:''}]
//           slots: dayTimeSlots
//         });
//       }
//       return days;
// }


const ScheduleMaker = () => {
    const [currentDate, setCurrentDate] = useState(new Date()); // Set the current date state
    const [numDays, setNumDays] = useState(5); // Set the current date state
    const [initalLoad, setInitalLoad] = useState(true); // Set the current date state
    const { rawData, groupedData: timeSlots, isLoading, isError } = useScheduleMaker(currentDate, numDays); // Pass a formatted string

    const [selectedSlot, setSelectedSlot] = useState({ dayIndex: null, slotIndex: null });
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [schedule, setSchedule] = useState([]); // Initial empty schedule

    const containerRef = useRef(null);
    const dayRefs = useRef([]);
    



  const handleTimeSlotClick = (time, index) => {
    setSelectedSlot(index); // Update the selected slot index
    // Handle further actions here, such as setting an appointment
  };

    const handleScroll = useCallback(() => {
      const container = containerRef.current;
    if (container) {
        const containerMiddle = container.scrollTop + container.clientHeight / 2;
      const dayToLoadIndex = dayRefs.current.findIndex(dayRef => {
        return dayRef.offsetTop + dayRef.clientHeight > containerMiddle;
      });

      if (dayToLoadIndex >= 0 && dayToLoadIndex !== currentDayIndex) {
        setCurrentDayIndex(dayToLoadIndex);
        // Load more days if necessary
          if (dayToLoadIndex === schedule.length - 2) {
            console.log('refetching')
            const newCurrentDate = addDays(schedule[schedule.length - 1].date, 1);
            setCurrentDate(newCurrentDate);
            setNumDays(1)
          }
        }
            }
      }, [currentDayIndex, schedule.length]);
      
      console.log(schedule)

      useEffect(() => {
        if (!isLoading && timeSlots) {
            if (initalLoad) {
                // Handle initial load
                console.log('setting schedule')
                console.log(timeSlots)
                setSchedule(timeSlots);
                setInitalLoad(false);
            } else if (currentDate > schedule[schedule.length - 1]?.date) {
                console.log('updating schedule')
                // Update schedule when new timeSlots are loaded
                setSchedule(prevSchedule => [...prevSchedule, ...timeSlots]);
            }
            console.log(schedule)
        }
    }, [timeSlots, isLoading, initalLoad]);
    
    // useEffect(() => {
    //     // You can add another useEffect if you need to do something
    //     // specifically when currentDate or numDays changes.
    //     // ...
    // }, [currentDate, numDays]);
    

    return (
      <div className="schedule-maker">
        <div className="schedule-header">
          <div className="schedule-title">Schedule Maker</div>
          {schedule.length > 0 && (
        <div className="schedule-date">
            {console.log(schedule[currentDayIndex].date)}
            {console.log(typeof schedule[currentDayIndex].date)}
          {format(schedule[currentDayIndex].date, 'MM/dd/yyyy')}
        </div>
      )}
    </div>
    {isLoading ? (
      <div>Loading...</div>
    ) : (
      schedule.length > 0 ? (
        <div className="scroll-container" onScroll={handleScroll} ref={containerRef}>
            {console.log('schedule 130')}
            {console.log(schedule)}
          {schedule.map((daySchedule, dayIndex) => (
            // console.log('daySchedule 131'),
            // console.log(daySchedule),
            <React.Fragment key={dayIndex}>
              <div className="time-slots-container" key={dayIndex} ref={el => dayRefs.current[dayIndex] = el}>
                {daySchedule.slots.map((cur_el, slotIndex) => {
                    // console.log('daySchedule 136')
                    // console.log(daySchedule)
                    return (
                  <div key={slotIndex} className="time-slot-row">
                    <div className="time-label">{formatDateTime(cur_el.start)}</div>
                    <div className={`time-slot ${selectedSlot.dayIndex === dayIndex && selectedSlot.slotIndex === slotIndex ? 'selected' : ''}`}
                         onClick={() => handleTimeSlotClick(dayIndex, slotIndex)}>
                      {cur_el.title === '' ? 'OPEN' : cur_el.title}
                    </div>
                  </div>
                )})}
              </div>
              {dayIndex < schedule.length - 1 && <div className="day-divider"></div>}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div>No schedule available</div>
      )
    )}
  </div>
    );
  }

  export default ScheduleMaker;