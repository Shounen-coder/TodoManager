//date formatting helper functions

export const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    
    const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

    return `${formattedDate} at ${formattedTime}`;

}

// Format date for DatePicker component (YYYY-MM-DD)
export const formatDatePicker = (date: Date): string => {
    return date.toISOString()
};


// Check if a given date string is in the past
export const isPastDate = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
};
