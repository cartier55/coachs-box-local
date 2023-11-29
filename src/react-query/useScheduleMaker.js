// useScheduleMaker.js
import { useQuery } from 'react-query';
import { fetchTimeSlots } from '../services/api_data';
import { toast } from 'react-toastify';

const useScheduleMaker = (current_date, day_count) => {

    const groupTimeslotsByDate = (timeslots) => {
        const grouped = {};
        timeslots.forEach(timeslot => {
            // Parse the 'start' string into a Date object
            let dateObj = new Date(timeslot.start);
            // Extract the date part and reset time to midnight for consistent grouping
            dateObj.setHours(0, 0, 0, 0);
            // Convert the date object to a string for use as a key
            const dateKey = dateObj.toISOString();
    
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: dateObj,  // Store the actual Date object
                    slots: []
                };
            }
            grouped[dateKey].slots.push(timeslot);
        });
    
        // Sorting each group by start time
        for (const dateKey in grouped) {
            grouped[dateKey].slots.sort((a, b) => new Date(a.start) - new Date(b.start));
        }
    
        // Convert grouped object into an array
        return Object.values(grouped);
    };
    
    

    console.log('useScheduleMaker usequery')
    const { data, isLoading, isError, error } = useQuery(
        ['timeSlots', current_date, day_count], 
        () => fetchTimeSlots(current_date, day_count),
    {
        // staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
        onSuccess: (data) => {
          },
      onError: () => {
        console.log('error')
        toast.error('Oops! There was a problem fetching time slots.');
      },
    }
  );
    console.log('last check query')

    const groupedData = data ? groupTimeslotsByDate(data) : null;

    return { rawData: data, groupedData, isLoading, isError, error };
};

export default useScheduleMaker;
