import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ViewPostRide from './ViewPostRide';

const PostRides = (props) => {
  const { ridesData } = props;

  console.log("post ride", ridesData)

  const [sortedData, setSortedData] = useState([]);
  const [viewRide, setViewRide] = useState(null);
  const [isViewRide, setIsViewRide] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    column: "date",
    direction: "asc",
  });

  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };


  const handleSort = (column) => {
    const newDirection = sortConfig.column === column && sortConfig.direction === "asc" ? "desc" : "asc";

    const sortedData = [...ridesData].sort((a, b) => {
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

    setSortConfig({ column, direction: newDirection });
    setSortedData(sortedData);

  };

  const handleVeiwRide = (ride) => {
    setViewRide(ride);
    setIsViewRide(true);
  };

  const handleCloseViewRide = () => {
    setViewRide(null);
    setIsViewRide(false);
  };

  // const renderTable = (title, rides, sortConfig, onSort, type) => (

  // );

  useEffect(() => {
    setSortedData(ridesData);
  }, [])

  return (
    <Box>
      {/* {renderTable("Past Rides", pastSortedData, pastSortConfig, handleSort, "past")} */}
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "date"}
                  direction={sortConfig.column === "date" ? sortConfig.direction : "asc"}
                  onClick={() => handleSort("date")}
                  sx={{ fontWeight: 700 }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "from"}
                  direction={sortConfig.column === "from" ? sortConfig.direction : "asc"}
                  onClick={() => handleSort("from")}
                  sx={{ fontWeight: 700 }}
                >
                  From
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "to"}
                  direction={sortConfig.column === "to" ? sortConfig.direction : "asc"}
                  onClick={() => handleSort("to")}
                  sx={{ fontWeight: 700 }}
                >
                  To
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.column === "rideBy"}
                  direction={sortConfig.column === "rideBy" ? sortConfig.direction : "asc"}
                  onClick={() => handleSort("rideBy")}
                  sx={{ fontWeight: 700 }}
                >
                  Passengers
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((ride, index) => (
              <TableRow key={index}>
                <TableCell sx={{ maxWidth: "150px" }}>{formatDate(new Date(ride.date_time))}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>{ride.going_from}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>{ride.going_to}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>{ride.passengers.map(item => item.Passenger_name).join(', ')}</TableCell>
                <TableCell sx={{ maxWidth: "150px" }}>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                    <Button
                      sx={{ color: "orange", textTransform: "none", fontWeight: 700 }}
                      onClick={() => handleVeiwRide(ride)}
                    >
                      View Ride
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {isViewRide && <ViewPostRide rideDetails={viewRide} handleCloseModal={handleCloseViewRide} />}
    </Box>
  )
}

export default PostRides