import React from "react";
import {
  Box,
  Typography,
  Modal,
  Paper,
  Button,
  Divider,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import EventIcon from "@mui/icons-material/Event";
import { NavLink } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";

const ViewPostRide = (props) => {
  const { rideDetails, handleCloseModal } = props;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const totalPrice = rideDetails.passengers
    .map((item) => Number(item.total_price))
    .reduce((acc, price) => acc + price, 0);

  return (
    <Modal
      open={true}
      onClose={handleCloseModal}
      aria-labelledby="ride-details-modal"
      aria-describedby="ride-details-description"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "rgba(0, 0, 0, 0.5)",
          padding: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: { xs: "90%", sm: "500px" }, // Responsive width
            padding: "24px",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          {/* Header */}
          <Typography
            id="ride-details-modal"
            variant="h5"
            gutterBottom
            align="center"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Ride Details
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Ride Information */}
          <Stack spacing={2}>
            <Typography>
              <strong>From:</strong> {rideDetails.going_from}
            </Typography>
            <Typography>
              <strong>To:</strong> {rideDetails.going_to}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <EventIcon color="primary" />
              <Typography>
                <strong>Date:</strong>{" "}
                {new Date(rideDetails.date_time).toLocaleDateString()}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon color="secondary" />
              <Typography>
                <strong>Time:</strong>{" "}
                {new Date(rideDetails.date_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <PriceCheckIcon color="success" />
              <Typography>
                <strong>Total Price:</strong> ${totalPrice}
              </Typography>
            </Stack>

            <Typography>
              <strong>Seats Selected:</strong>{" "}
              {rideDetails.passengers[0]?.selected_seats.join(", ")}
            </Typography>
          </Stack>

          {/* Passenger Details */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Passengers
          </Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {rideDetails.passengers.map((passenger, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  padding: 2,
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>
                    <strong>Name:</strong> {passenger.Passenger_name}
                  </Typography>
                  <NavLink to={"/Messages"} style={{ textDecoration: "none" }}>
                    <IconButton color="primary" size="small">
                      <ChatIcon />
                    </IconButton>
                  </NavLink>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <Typography>
                    <strong>Status:</strong>
                  </Typography>
                  <Chip
                    label={passenger.status}
                    color={getStatusColor(passenger.status)}
                    size="small"
                    variant="filled"
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>

          {/* Notes */}
          <Divider sx={{ my: 2 }} />
          <Typography>
            <strong>Notes:</strong> {rideDetails.additional_notes}
          </Typography>

          {/* Close Button */}
          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 2, textTransform: "none", fontWeight: "bold" }}
          >
            Close
          </Button>
        </Paper>
      </Box>
    </Modal>
  );
};

export default ViewPostRide;