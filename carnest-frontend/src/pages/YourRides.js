import React, { useState, useEffect } from "react";
import {
	Box,
	Tabs,
	Tab,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useGetBookedRidesMutation, useGetRidesMutation } from "../services/apiService";
import { setBookedRides, setRidesList } from "../features/apiSlice";
import BookedRides from "../components/BookedRides";
import PostRides from "../components/PostRides";

const YourRides = () => {
	const { bookedRides, ridesList } = useSelector((state) => state.apiSlice);
	const dispatch = useDispatch();
	const { access_token, profile } = useSelector((state) => state.auth);
	const [getBookedRides] = useGetBookedRidesMutation();
	const [getRides] = useGetRidesMutation();

	const today = new Date();

	const formatDate = (date) => {
		const options = { day: "2-digit", month: "short", year: "numeric" };
		return new Intl.DateTimeFormat("en-US", options).format(date);
	};

	const [tabIndex, setTabIndex] = useState(0); // Manage tab selection
	const [ridesData, setRidesData] = useState({ upcoming: [], past: [] });
	const [render, setRender] = useState(false);

	useEffect(() => {
		const upcoming = [];
		const past = [];
		bookedRides.forEach((ride) => {
			const rideDate = new Date(ride.ride_date);
			const rideInfo = {
				date: formatDate(rideDate),
				from: ride.going_from,
				to: ride.going_to,
				rideBy: ride.driver_name,
				...ride,
			};

			if (rideDate >= today) {
				upcoming.push(rideInfo);
			} else {
				past.push(rideInfo);
			}
		});

		setRidesData({ upcoming, past });
	}, [bookedRides]); // eslint-disable-line

	const handleTabChange = (event, newValue) => {
		setTabIndex(newValue);
	};

	const getBookedRideList = async () => {
		try {
			const res = await getBookedRides(access_token);
			if (res.error) {
				console.error(res.error.data.errors);
				return;
			}
			if (res.data) {
				const { data } = res;
				dispatch(setBookedRides({ data }));
			}
		} catch (error) {
			console.error(error);
		}
	};

	const getRideList = async () => {
		try {
			const res = await getRides(access_token);
			if (res.error) {
				console.error(res.error.data.errors);
				return;
			}
			if (res.data) {
				const { data } = res;
				const { rides } = data;
				console.log(rides, profile)
				const temp = rides.filter(item => item.driver === profile.id)
				console.log(temp)
				dispatch(setRidesList({ data: temp }));
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		getRideList();
	}, []); // eslint-disable-line

	useEffect(() => {
		getBookedRideList();
	}, [render]); // eslint-disable-line

	return (
		<Box sx={{ padding: 2, backgroundColor: "#f9f9f9" }}>
			{/* Tabs */}
			<Tabs value={tabIndex} onChange={handleTabChange}>
				<Tab label="Booked Rides" />
				<Tab label="Posted Rides" />
			</Tabs>
			{tabIndex === 0 && <BookedRides ridesData={ridesData} access_token={access_token} handleRender={() => setRender(!render)} />}
			{tabIndex === 1 && <PostRides ridesData={ridesList} />}
		</Box>
	);
};

export default YourRides;
