import React from "react";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns"; // Import format from date-fns for formatting

const DateTimeInput = (props) => {
  const { serverError, id, name, value, handleDateTime } = props;

  const handleDateTimeChange = (newValue) => {
    // Keep the selected local date-time for display
    const localDateTime = format(new Date(newValue), "yyyy-MM-dd'T'HH:mm:ss");
    console.log("Local Date-Time:", localDateTime);

    // Send UTC equivalent to backend
    const utcDateTime = new Date(newValue).toISOString();
    console.log("UTC Date-Time for Backend:", utcDateTime);

    handleDateTime(utcDateTime); // Send UTC time to your backend
  };

  const formatDate = (date) => {
    console.log(date)
    if (!date) return null;
    // Convert UTC to local timezone and format it
    const localDate = new Date(date);
    return format(localDate, "yyyy-MM-dd'T'HH:mm:ss");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        sx={{ width: "100%" }}
        label="Select Date & Time"
        value={value ? new Date(value) : null} // Convert string value to Date object
        onChange={handleDateTimeChange}
        minDateTime={new Date()} // Disable past dates and times
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            required
            id={id}
            name={name}
            variant="outlined"
            margin="normal"
            InputLabelProps={{
              shrink: true, // Ensure label behaves like a placeholder
            }}
            value={formatDate(value)} // Display formatted local date
            error={Boolean(serverError?.dateTime)}
            helperText={serverError?.dateTime ? serverError.dateTime[0] : ""}
          />
        )}
      />
      {/* <DateTimePicker
        sx={{ width: "100%" }}
        label="Select Date & Time"
        value={value ? new Date(value) : null} // Convert string value to Date object
        onChange={handleDateTimeChange}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            required
            id={id}
            name={name}
            variant="outlined"
            margin="normal"
            value={formatDate(value)} // Ensure proper display format
            error={Boolean(serverError?.dateTime)}
            helperText={serverError?.dateTime ? serverError.dateTime[0] : ""}
          />
        )}
      /> */}
    </LocalizationProvider>
  );
};

export default DateTimeInput;
