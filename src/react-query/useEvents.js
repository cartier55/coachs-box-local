import { useQuery, useQueryClient } from 'react-query';
import { fetchEventsForMonth, fetchEventsForBiWeekly, fetchNxtEvent } from '../services/api_data';

export function useEvents({ month, year, startDate, endDate, fetchType = 'monthly' }) {
  const queryClient = useQueryClient();
  
  let fetcher, queryKey, queryArgs;

  if (fetchType === 'nextEvent') {
    fetcher = fetchNxtEvent;
    queryKey = ['nextEvent'];
    queryArgs = {};
  } else {
    fetcher = fetchType === 'biweekly' ? fetchEventsForBiWeekly : fetchEventsForMonth;
    queryKey = fetchType === 'biweekly' ? ['eventsForBiWeekly', startDate, endDate] : ['eventsForMonth', month, year];
    queryArgs = fetchType === 'biweekly' ? { startDate, endDate } : { month, year };
  }

  const { data, isLoading, isError, error } = useQuery(
    queryKey,
    () => fetcher(queryArgs),
    {
      enabled: fetchType === 'nextEvent' ? true : (fetchType === 'biweekly' ? !!startDate && !!endDate : !!month && !!year),
      retry: 1,
      onError: (error) => {
        if (error.response?.status === 404 && fetchType === 'nextEvent') {
          // Manually set the query data to undefined
          queryClient.setQueryData('nextEvent', undefined);
        }
      },
    }
  );

  const filteredData = data ? data.filter(event => event.title && event.title.trim() !== '') : [];

  const output = {
    isLoading,
    isError,
    error,
    events: fetchType === 'nextEvent' ? data : filteredData, // Use filtered data for non-nextEvent types
  };

  if (fetchType === 'nextEvent') {
    output.event = data || null;
  }

  return output;
}