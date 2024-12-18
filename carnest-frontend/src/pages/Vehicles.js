import React, { useState } from "react";
import {
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TextField,
	Box,
	CircularProgress,
	Snackbar,
	Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useMediaQuery, useTheme } from '@mui/system';
import { useDispatch, useSelector } from "react-redux";
import { useCreateVehicleMutation, useDeleteVehicleMutation, useGetVehicleMutation, useUpdateVehicleMutation } from "../services/apiService";
import { setVehiclesList } from "../features/apiSlice";

const Vehicles = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [severity, setSeverity] = useState("success")
	const [loader, setLoader] = useState(false)
	const [isEdit, setIsEdit] = useState(false)
	const [vehicleId, setVehicleId] = useState("");
	const [newVehicle, setNewVehicle] = useState({
		make: "",
		model: "",
		plateNo: "",
		year: "",
		color: "",
		state: "",
		number_of_seats: ""
	});

	const { access_token, profile } = useSelector((state) => state.auth);
	const { vehiclesList } = useSelector((state) => state.apiSlice || { vehiclesList: [] });
	const [createVehicle, { isLoading }] = useCreateVehicleMutation();
	const [updatedVehicles] = useUpdateVehicleMutation();
	const [deleteVehicle] = useDeleteVehicleMutation();
	const [getVehicle] = useGetVehicleMutation();

	const dispatch = useDispatch();

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpen(false);
	};

	const handleEdit = (vehicle) => {
		setIsEdit(true)
		setVehicleId(vehicle.id);
		setNewVehicle({
			make: vehicle.make,
			model: vehicle.model,
			plateNo: vehicle.plate_number,
			year: vehicle.year,
			color: vehicle.color,
			number_of_seats: vehicle.number_of_seats,
			state: vehicle.state
		})
		// () => handleUpdateVehicle(vehicle.id)
	}

	const getVehiclesList = async () => {
		try {
			const res = await getVehicle(access_token);
			if (res.error) {
				console.error(res.error.data.errors); // Display login error
				return; // Exit early on error
			}
			if (res.data) {
				const { data } = res;
				dispatch(setVehiclesList({ data }));
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewVehicle({ ...newVehicle, [name]: value });
	};

	const handleAddVehicle = async () => {
		try {
			const actualData = {
				owner: profile?.id,
				make: newVehicle?.make,
				model: newVehicle.model,
				year: newVehicle.year,
				plate_number: newVehicle.plateNo,
				color: newVehicle.color,
				state: newVehicle.state,
				number_of_seats: 4,
			}

			const res = await createVehicle({ actualData, access_token })
			if (res.error) {
				console.error(res); // Display login error
				setMessage(JSON.stringify(res.error.data));
				setOpen(true);
				setSeverity("error")
				return; // Exit early on error
			} else if (res.data) {
				setMessage("Added Successfully");
				setOpen(true);
				setSeverity("success")
				getVehiclesList()
			}
		} catch (error) {
			console.error(error)
		}
		setNewVehicle({ make: "", model: "", plateNo: "", year: "", color: "" });
	};

	const handleUpdateVehicle = async () => {
		setLoader(true)
		try {
			const actualData = {
				owner: profile?.id,
				make: newVehicle?.make,
				model: newVehicle.model,
				year: newVehicle.year,
				plate_number: newVehicle.plateNo,
				color: newVehicle.color,
				number_of_seats: newVehicle.number_of_seats
			}
			const res = await updatedVehicles({ id: vehicleId, actualData, access_token })
			if (res.error) {
				console.error(res.error.data.errors);
				setMessage(res.error.data.errors);
				setOpen(true);
				setSeverity("error")
				setLoader(false)
				return;
			} else if (res.data) {
				setIsEdit(false)
				setVehicleId("");
				getVehiclesList()
				setMessage("Updated Successfully");
				setOpen(true);
				setSeverity("success")
				setLoader(false)
			}
		} catch (error) {
			console.error(error)
			setLoader(false)
		}
		setNewVehicle({ make: "", model: "", plateNo: "", year: "", color: "", number_of_seats: "", state: "" });
	};

	const handleDeleteVehicle = async (id) => {
		setLoader(true)
		try {
			const res = await deleteVehicle({ id, access_token })
			if (res.error) {
				console.error(res.error.data.errors);
				setMessage(res.error.data.errors);
				setOpen(true);
				setSeverity("error")
				setLoader(false)
				return;
			} else if (res) {
				getVehiclesList()
				setMessage("Delete Successfully");
				setOpen(true);
				setSeverity("error")
				setLoader(false)
			}
		} catch (error) {
			console.error(error)
			setLoader(false)
		}
	};

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				backgroundColor: '#f0f2f5',
				padding: isMobile ? 0 : theme.spacing(2),
				overflowY: 'scroll',
				pt: 8
			}}
		>
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
			{/* Main Content */}
			{isLoading ? <Box>
				<CircularProgress />
			</Box> : <Box
				sx={{
					width: '100%',
					maxWidth: 640,
					padding: isMobile ? 0 : theme.spacing(4),
					borderRadius: '8px',
					backgroundColor: '#FFFFFF',
					boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
					textAlign: 'center',
					mb: isMobile ? 5 : 0
				}}
			>
				<Typography variant="h4" align="center" sx={{ p: 2, fontWeight: "bold", color: "#FF6436" }} gutterBottom>
					Vehicles
				</Typography>

				{/* Vehicle Table */}
				<TableContainer component={Paper} sx={{ marginBottom: 4 }}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><strong>Make</strong></TableCell>
								<TableCell><strong>Model</strong></TableCell>
								<TableCell><strong>Plate No.</strong></TableCell>
								<TableCell><strong>Year</strong></TableCell>
								<TableCell><strong>Color</strong></TableCell>
								<TableCell><strong>Actions</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loader ? <TableRow>
								<TableCell colSpan={7} sx={{ textAlign: "center" }}><CircularProgress /></TableCell>
							</TableRow> : vehiclesList.map((vehicle) => (
								<TableRow key={vehicle.id}>
									<TableCell>{vehicle.make}</TableCell>
									<TableCell>{vehicle.model}</TableCell>
									<TableCell>{vehicle.plate_number}</TableCell>
									<TableCell>{vehicle.year}</TableCell>
									<TableCell>{vehicle.color}</TableCell>
									<TableCell sx={{ display: "flex" }}>
										<Button
											color="primary"
											onClick={() => handleEdit(vehicle)}
										>
											Edit
										</Button>
										<Button
											color="error"
											onClick={() => handleDeleteVehicle(vehicle.id)}
										>
											Delete
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Add New Vehicle Form */}
				<Paper elevation={3} sx={{ padding: 3 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, textAlign: "left" }} gutterBottom>
						{isEdit ? "Edit Vehicle" : "Add New Vehicle"}
					</Typography>
					<Grid container spacing={2}>
						<Grid size={6}>
							<TextField
								label="Make"
								name="make"
								value={newVehicle.make}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
						<Grid size={6}>
							<TextField
								label="Model"
								name="model"
								value={newVehicle.model}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
					</Grid>
					<Grid container spacing={2}>
						<Grid size={6}>
							<TextField
								label="Plate No."
								name="plateNo"
								value={newVehicle.plateNo}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
						<Grid size={6}>
							<TextField
								label="State"
								name="state"
								value={newVehicle.state}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
					</Grid>
					<Grid container spacing={2}>
						<Grid size={6}>
							<TextField
								label="Year"
								name="year"
								value={newVehicle.year}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
						<Grid size={6}>
							<TextField
								label="Color"
								name="color"
								value={newVehicle.color}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
					</Grid>
					{/* <Grid container spacing={2}>
						<Grid size={12}>
							<TextField
								label="No of seats"
								name="number_of_seats"
								value={newVehicle.number_of_seats}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
					</Grid> */}
					{isEdit ? <Button
						variant="contained"
						sx={{
							backgroundColor: '#FF6436',
							color: 'white',
							marginTop: theme.spacing(2),
							marginBottom: theme.spacing(1),
							'&:hover': {
								backgroundColor: '#36a420',
							},
							textTransform: "none"
						}}
						fullWidth
						onClick={handleUpdateVehicle}
					>
						Edit Vehicle
					</Button> : <Button
						variant="contained"
						sx={{
							backgroundColor: '#FF6436',
							color: 'white',
							marginTop: theme.spacing(2),
							marginBottom: theme.spacing(1),
							'&:hover': {
								backgroundColor: '#36a420',
							},
							textTransform: "none"
						}}
						fullWidth
						onClick={handleAddVehicle}
					>
						Add Vehicle
					</Button>}
				</Paper>
			</Box>}
		</Box>
	);
};

export default Vehicles;
