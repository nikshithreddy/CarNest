import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { FaArrowLeft, FaCircle, FaSquare } from "react-icons/fa";
import { useBookRideMutation } from '../services/apiService';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { generateSeatList } from '../helper';

const CarpoolBooking = (props) => {
  const { handleBack, rideBookId } = props;

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success")
  const [render, setRender] = useState(false);

  const { access_token, profile } = useSelector((state) => state.auth);
  const { rideDetails } = useSelector((state) => state.apiSlice);
  console.log("rideDetails", rideDetails)

  const availableSeats = generateSeatList(4);

  const [bookRide, { isLoading }] = useBookRideMutation();

  const getSelectedSeat = () => {
    const bookedSeats = availableSeats.filter(
      (seat) =>
        rideDetails?.passengers.some((passenger) =>
          passenger.selected_seats.includes(seat)
        )
    );
    const result = selectedSeats.filter(item => !bookedSeats.includes(item));
    return result
  }

  const toggleSeatSelection = (seat) => {
    const nonBookedSeats = availableSeats.filter(
      (seat) =>
        !rideDetails?.passengers.some((passenger) =>
          passenger.selected_seats.includes(seat)
        )
    );
    console.log(selectedSeats);
    if (nonBookedSeats.includes(seat)) {
      if (selectedSeats.includes(seat)) {
        setSelectedSeats(selectedSeats.filter((s) => s !== seat));
      } else if (selectedSeats.length < rideDetails?.total_number_of_seats) {
        setSelectedSeats([...selectedSeats, seat]);
      }
    } else {
      setMessage("You cannot select booked seat");
      setOpen(true);
      setSeverity("error");
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedSeats([]);
    setRender(!render);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const calculateStartAndEndTime = (dateTime, withinTime) => {
    // Parse the given start date and time
    const startTime = new Date(dateTime);

    // Extract hours and minutes from the withinTime string (e.g., "4h 38m")
    const hoursMatch = withinTime.match(/(\d+)h/); // Extract hours
    const minutesMatch = withinTime.match(/(\d+)m/); // Extract minutes

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0; // Default to 0 if no hours
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0; // Default to 0 if no minutes

    // Calculate the end time by adding hours and minutes
    const endTime = new Date(startTime.getTime() + (hours * 60 + minutes) * 60 * 1000);

    // Format the time only with AM/PM
    const formatTime = (date) =>
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    return {
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
    };
  };

  const handleMakeReservation = async () => {
    // Map seat positions explicitly to their real-world locations
    const seatMapping = {
      'Front Right': 2, // Front-right maps to seat index 1
      'Back Left': 3,   // Back-left maps to seat index 2
      'Back Right': 4,  // Back-right maps to seat index 3
    };

    // Get all booked seat names from ride details
    const bookedSeats = rideDetails?.passengers.flatMap((passenger) => passenger.selected_seats) || [];

    // Filter selectedSeats to include only those not already booked
    const availableSelectedSeats = selectedSeats.filter((seat) => !bookedSeats.includes(seat));

    // Map available seats to indices for backend
    const bookedSeatIndices = availableSelectedSeats.map((seat) => seatMapping[seat]);

    // If no available seats are selected, show an error
    if (bookedSeatIndices.length === 0) {
      setMessage("No available seats selected.");
      setOpen(true);
      setSeverity("error");
      return;
    }

    try {
      const actualData = {
        ride: rideBookId,
        passenger: profile.id,
        seats: bookedSeatIndices, // Array of unbooked seat indices
        additional_notes: rideDetails.ride_description,
      };

      const res = await bookRide({ actualData, access_token });
      if (res.error) {
        if (res.error?.data?.non_field_errors) {
          res.error?.data?.non_field_errors.map(i => setMessage(i));
          setOpen(true);
          setSeverity("error");
        } else {
          setMessage(res.error.data.errors);
          setOpen(true);
          setSeverity("error");
        }
      } else if (res.data) {
        console.log(res);
        setMessage("Ride booked successfully");
        setOpen(true);
        setSeverity("success");
        setTimeout(() => {
          navigate(`/YourRides`);
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while booking the ride.");
      setOpen(true);
      setSeverity("error");
    }
  };

  useEffect(() => {
    if (rideDetails && rideDetails.passengers?.length > 0) {
      const bookedSeats = []; // Temporary array to collect booked seats
      rideDetails.passengers.forEach((passenger) => {
        console.log("element", passenger.selected_seats);
        passenger?.selected_seats.forEach((seat) => {
          if (!bookedSeats.includes(seat)) { // Avoid duplicates
            bookedSeats.push(seat);
          }
        });
      });
      setSelectedSeats(bookedSeats);
    }
  }, [rideDetails, render])

  return (
    <Box sx={{ height: "100%", backgroundColor: "#f0f2f5" }}>
      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
      <Box sx={{
        padding: 3, maxWidth: 800, margin: 'auto', fontFamily: 'Roboto', display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
      }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography onClick={() => handleBack('reservation')} sx={{ mr: 2 }}><FaArrowLeft style={{ marginRight: 5, cursor: "pointer" }} /></Typography>
            {/* Header */}
            <Typography variant="h6" gutterBottom>
              {formatDate(rideDetails?.date_time)}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tooltip title={rideDetails.going_from || ''} placement="top">
                <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                  <strong>{rideDetails.going_from}</strong>
                </Typography>
              </Tooltip>
              <Box sx={{ textAlign: "center", mr: 2, ml: 2 }}>
                <Typography>
                  {rideDetails.within_time}
                </Typography>
                <Typography>
                  ({rideDetails.within_distance}Miles)
                </Typography>
              </Box>

              <Tooltip title={rideDetails.going_to || ''} placement="top">
                <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                  <strong>{rideDetails.going_to}</strong>
                </Typography>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ml: 3, mr: 3, position: 'relative' }}>
              {/* Circle 1 */}
              <Typography>
                <FaCircle />
              </Typography>

              {/* Line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '39%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: 'black',
                  zIndex: 0,
                }}
              ></Box>

              {/* Circle 2 */}
              <Typography>
                <FaCircle />
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, ml: 1, mr: 1, position: 'relative' }}>
              <Typography sx={{ fontWeight: 700 }}>{calculateStartAndEndTime(rideDetails.date_time, rideDetails.within_time).startTime}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{calculateStartAndEndTime(rideDetails.date_time, rideDetails.within_time).endTime}</Typography>
            </Box>
            {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, ml: 1, mr: 1, position: 'relative' }}>
              <Typography sx={{ fontWeight: 400 }}>10 miles from your departure</Typography>
              <Typography sx={{ fontWeight: 400 }}>21 miles away from you arrival</Typography>
            </Box> */}

            {/* Driver and Trip Info */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{ mr: 2 }}
                      src={`${process.env.REACT_APP_BASE_URL}/${rideDetails.driver_profile_pic}`}
                    >
                      {rideDetails?.driver_name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body1">
                        <strong>{rideDetails.driver_name}</strong>
                      </Typography>
                      {/* <Typography variant="body2" color="text.secondary">
                        4.5/5 Rating
                      </Typography> */}
                    </Box>
                  </Box>
                  <NavLink to={'/Messages'}>
                    <IconButton color="primary">
                      <ChatIcon />
                    </IconButton>
                  </NavLink>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DirectionsCarIcon sx={{ mr: 1, color: 'gray' }} />
                  <Typography variant="body2">
                    {rideDetails.vehicle_name} (2016, {rideDetails.vehicle_color}) - ${rideDetails.price_per_seat} / Person
                  </Typography>
                </Box>

                {/* Other Passengers */}
                <Box>
                  <Typography variant="body2">
                    Other passengers:
                    <strong>{rideDetails.passengers.map(item => item.Passenger_name).join(',')}</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        {/* Seat Picker */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ background: "#fff", borderRadius: "10px", p: 2, textAlign: "center", maxWidth: 400, margin: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Car Seat Picker
            </Typography>
            <Box
              sx={{
                background: "#dbb16459",
                borderRadius: "10px",
                p: "8px 16px",
              }}
            >
              <Box
                sx={{
                  background: "#FFF",
                  p: 2,
                  border: "1px solid black",
                  borderRadius: "10px",
                  margin: "auto",
                  width: isMobile ? "100%" : "80%",
                  display: "flex",
                  flexWrap: "wrap", // Wrap items into rows
                  justifyContent: "space-between", // Space between columns
                  gap: 2, // Adjust spacing between items
                }}
              >
                {/* Fixed Button */}
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "capitalize",
                    fontSize: "0.9rem",
                    width: "30%",
                    height: "50px",
                    bgcolor: "#dbb16459",
                    color: "black",
                  }}
                >
                  <FaCircle />
                </Button>

                {/* Iterative Buttons */}
                {availableSeats.map((seat, index) => (
                  <Button
                    key={index}
                    onClick={() => toggleSeatSelection(seat)}
                    variant={selectedSeats.includes(seat) ? "contained" : "outlined"}
                    sx={{
                      textTransform: "capitalize",
                      fontSize: "0.9rem",
                      width: "30%", // Two columns layout
                      height: "50px",
                      bgcolor: selectedSeats.includes(seat) ? "orange" : "#dbb16459",
                      color: selectedSeats.includes(seat) ? "white" : "black",
                      mt: index > 0 ? 7 : 0
                    }}
                  >

                  </Button>
                ))}
              </Box>
            </Box>

            <Typography variant="body2" sx={{ mt: 1 }}>
              You selected: {getSelectedSeat().join(', ')}
              {/* selectedSeats.join(', ')} */}
            </Typography>
            <Button
              variant="contained"
              onClick={handleClearSelection}
              sx={{ py: 1.5, fontSize: '1rem', textTransform: 'none', background: "orange", mt: 2, mb: 2 }}
            >
              Clear Selection
            </Button>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ color: "#dbb16459" }}><FaSquare /> <span style={{ color: "black" }}>Available</span></Typography>
              <Typography sx={{ color: "orange" }}><FaSquare /> <span style={{ color: "black" }}>Selected</span></Typography>
              <Typography sx={{ color: "grey" }}><FaSquare /> <span style={{ color: "black" }}>Blocked</span></Typography>
            </Box>
          </Box>
        </Box>
      </Box>


      {/* Make Reservation Button */}
      <Box sx={{
        padding: 3, maxWidth: 800, margin: 'auto',
      }}>
        {isLoading ? <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress /> </Box> :
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5, fontSize: '1rem', textTransform: 'none', mb: 8 }}
            onClick={handleMakeReservation}
          >
            Make Reservation
          </Button>}
      </Box>
    </Box >
  );
};

export default CarpoolBooking;