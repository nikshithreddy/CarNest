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
import ChatIcon from '@mui/icons-material/Chat';


const ViewRide = (props) => {
  const { ride, handleCloseModal } = props;

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
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "400px",
            padding: "24px",
            borderRadius: "8px",
          }}
        >
          <Typography
            id="ride-details-modal"
            variant="h5"
            gutterBottom
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            Ride Details
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography>
                <strong>Driver:</strong> {ride.driver_name}
              </Typography>
              <NavLink to={'/Messages'}>
                <IconButton color="primary">
                  <ChatIcon />
                </IconButton>
              </NavLink>
            </Box>

            <Typography>
              <strong>From:</strong> {ride.going_from}
            </Typography>
            <Typography>
              <strong>To:</strong> {ride.going_to}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <EventIcon color="primary" />
              <Typography>
                <strong>Date:</strong> {new Date(ride.ride_date).toLocaleDateString()}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTimeIcon color="secondary" />
              <Typography>
                <strong>Time:</strong> {new Date(ride.ride_date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Stack>

            <Typography>
              <strong>Passenger:</strong> {ride.Passenger_name}
            </Typography>
            <Typography>
              <strong>Seats Selected:</strong> {ride?.selected_seats.join(", ")}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <PriceCheckIcon color="success" />
              <Typography>
                <strong>Total Price:</strong> ${ride.total_price}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>
                <strong>Status:</strong>
              </Typography>
              <Chip
                label={ride.status}
                color={getStatusColor(ride.status)}
                variant="outlined"
              />
            </Stack>

            <Typography>
              <strong>Notes:</strong> {ride.additional_notes}
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Button
            onClick={handleCloseModal}
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
          >
            Close
          </Button>
        </Paper>
      </Box>
    </Modal>
  );
};

export default ViewRide;
