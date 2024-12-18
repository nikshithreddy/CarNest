import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useCancelRideMutation } from '../services/apiService';
import ViewRide from './ViewRide';

const BookedRides = (props) => {
  const { ridesData, access_token, handleRender } = props;

  const [upcomingSortedData, setUpcomingSortedData] = useState([]);
	const [pastSortedData, setPastSortedData] = useState([]);
  const [viewRide, setViewRide] = useState(null);
  const [rideToCancel, setRideToCancel] = useState(null);
	const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
	const [isViewRide, setIsViewRide] = useState(false);
  const [upcomingSortConfig, setUpcomingSortConfig] = useState({
		column: "date",
		direction: "asc",
	});
	const [pastSortConfig, setPastSortConfig] = useState({
		column: "date",
		direction: "asc",
	});

  const [cancelRide] = useCancelRideMutation();


  const handleSort = (type, column) => {
		const isUpcoming = type === "upcoming";
		const sortConfig = isUpcoming ? upcomingSortConfig : pastSortConfig;
		const newDirection = sortConfig.column === column && sortConfig.direction === "asc" ? "desc" : "asc";

		const sortedData = [...(isUpcoming ? ridesData.upcoming : ridesData.past)].sort((a, b) => {
			if (column === "date") {
				const dateA = new Date(a[column]);
				const dateB = new Date(b[column]);
				return newDirection === "asc" ? dateA - dateB : dateB - dateA;
			} else {
				return newDirection === "asc"
					? a[column].localeCompare(b[column])
					: b[column].localeCompare(a[column]);
			}
		});

		if (isUpcoming) {
			setUpcomingSortConfig({ column, direction: newDirection });
			setUpcomingSortedData(sortedData);
		} else {
			setPastSortConfig({ column, direction: newDirection });
			setPastSortedData(sortedData);
		}
	};

	const handleVeiwRide = (ride) => {
		setViewRide(ride);
		setIsViewRide(true);
	};

	const handleCloseViewRide = () => {
		setViewRide(null);
		setIsViewRide(false);
	};

	const handleCancelConfirm = async () => {
		if (rideToCancel) {
			try {
				const res = await cancelRide({ id: rideToCancel.id, access_token });
				if (res.error) {
					console.error(res.error.data.errors);
					return;
				} else if (res.data) {
					handleRender();
				}
			} catch (error) {
				console.error(error);
			} finally {
				setCancelConfirmOpen(false);
				setRideToCancel(null);
			}
		}
	};

	const openCancelConfirm = (ride) => {
		setRideToCancel(ride);
		setCancelConfirmOpen(true);
	};

  useEffect(()=> {
		setUpcomingSortedData(ridesData?.upcoming);
		setPastSortedData(ridesData?.past);
  }, [ridesData])

  const renderTable = (title, rides, sortConfig, onSort, type) => (
    <>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>
        {title}
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "date"}
                  direction={sortConfig.column === "date" ? sortConfig.direction : "asc"}
                  onClick={() => onSort(type, "date")}
                  sx={{ fontWeight: 700 }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "from"}
                  direction={sortConfig.column === "from" ? sortConfig.direction : "asc"}
                  onClick={() => onSort(type, "from")}
                  sx={{ fontWeight: 700 }}
                >
                  From
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "to"}
                  direction={sortConfig.column === "to" ? sortConfig.direction : "asc"}
                  onClick={() => onSort(type, "to")}
                  sx={{ fontWeight: 700 }}
                >
                  To
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "rideBy"}
                  direction={sortConfig.column === "rideBy" ? sortConfig.direction : "asc"}
                  onClick={() => onSort(type, "rideBy")}
                  sx={{ fontWeight: 700 }}
                >
                  Ride by
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rides.map((ride, index) => (
              <TableRow key={index}>
                <TableCell sx={{ maxWidth: "150px" }}>{ride.date}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>{ride.from}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>{ride.to}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>{ride.rideBy}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                    <Button
                      sx={{ color: "orange", textTransform: "none", fontWeight: 700 }}
                      onClick={() => handleVeiwRide(ride)}
                    >
                      View Ride
                    </Button>
                    {ride.status !== "Cancelled" && (
                      <Button
                        sx={{ color: "red", textTransform: "none", fontWeight: 700 }}
                        onClick={() => openCancelConfirm(ride)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );

  return (
    <Box>
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this ride?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>No</Button>
          <Button onClick={handleCancelConfirm} color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {renderTable(
        "Upcoming Rides",
        upcomingSortedData,
        upcomingSortConfig,
        handleSort,
        "upcoming"
      )}
      {renderTable("Past Rides", pastSortedData, pastSortConfig, handleSort, "past")}
      {isViewRide && <ViewRide ride={viewRide} handleCloseModal={handleCloseViewRide} />}
    </Box>
  )
}

export default BookedRides