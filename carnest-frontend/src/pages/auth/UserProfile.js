import React, { useEffect, useState } from "react";
import {
	Box,
	TextField,
	Avatar,
	Typography,
	Button,
	Snackbar,
	Alert,
	CircularProgress,
	Select,
	MenuItem,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useMediaQuery, useTheme } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import LocationSearchInput from "../../components/LocationSearchInput";
import { useUpdateUserProfileMutation } from "../../services/userAuthApi";
import { setProfile } from "../../features/authSlice";

const UserProfile = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const { profile, access_token, govtIdTypes } = useSelector((state) => state.auth);

	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [avtarChange, setAvatarChange] = useState(false);
	const [newAvatar, setNewAvatar] = useState(null);
	const [severity, setSeverity] = useState("success")
	const [user, setUser] = useState({
		avatar: "",
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		addressLat: "",
		addressLng: "",
		idType: "",
		idNumber: "",
	});

	const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();

	const dispatch = useDispatch()

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setNewAvatar(reader.result);
			};
			reader.readAsDataURL(file);
			setUser((prev) => ({ ...prev, avatar: file })); // Save the file
			setAvatarChange(true)
		}
	};

	const handleLatLng = (e, name) => {
		if (name === "address") {
			setUser((prev) => ({ ...prev, addressLat: e.lat, addressLng: e.lng }));
		}
	};

	const handleAddress = (e, name) => {
		if (name === "address") {
			setUser((prev) => ({ ...prev, address: e }));
		}
	};

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpen(false);
	};

	const handleSaveChanges = async () => {
		try {
			console.log("User Data Saved:", user);

			const { id } = profile; // Extracting the profile ID
			const data = new FormData();

			// Append profile picture to FormData
			if (user.avatar && avtarChange) {
				data.append("profile_picture", user.avatar);
			}

			// Append other user details to FormData
			user.address && data.append("address", user.address);
			user.addressLat && data.append("addressLat", user.addressLat);
			user.addressLng && data.append("addressLng", user.addressLng);
			user.firstName && data.append("first_name", user.firstName);
			user.idNumber && data.append("government_id_number", user.idNumber);
			user.idType && data.append("government_id_type", user.idType);
			user.lastName && data.append("last_name", user.lastName);

			// API call
			const res = await updateUserProfile({ actualData: data, access_token, user: id });

			// Handle API response
			if (res.error) {
				// Check if errors exist in response and display appropriate message
				if (res.error?.data?.errors?.non_field_errors) {
					res.error?.data?.errors?.non_field_errors.map(i => setMessage(i));
					setOpen(true);
					setSeverity("error");
				  } else {
					const errorMessage = res.error?.data?.errors || "Failed to save changes. Please try again.";
				setMessage(JSON.stringify(errorMessage));
					setOpen(true);
					setSeverity("error");
				  }
				
				
			} else if (res.data) {
				setMessage("Changes saved successfully!");
				setSeverity("success");
				setOpen(true);
				setAvatarChange(false)
				dispatch(setProfile({ profile: res.data }));
			}
		} catch (error) {
			// Catch any unexpected errors
			console.error("An error occurred:", error);
			setMessage("An unexpected error occurred. Please try again.");
			setSeverity("error");
			setOpen(true);
		}
	};

	useEffect(() => {
		setUser({
			avatar: profile.profile_picture,
			firstName: profile?.first_name,
			lastName: profile?.last_name,
			email: profile?.email,
			phone: profile?.phone_number,
			address: profile?.address,
			addressLat: profile?.address_lat,
			addressLng: profile?.address_lng,
			idType: profile?.government_id_type,
			idNumber: profile?.government_id_number,
		})
	}, [profile])

	return (
		<Box>
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
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					backgroundColor: isMobile ? "#fff" : "#f0f2f5",
					padding: isMobile ? 0 : theme.spacing(2),
				}}
			>
				<Box
					sx={{
						width: "100%",
						maxWidth: 640,
						padding: theme.spacing(4),
						borderRadius: "8px",
						backgroundColor: "#FFFFFF",
						boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
						textAlign: "center",
					}}
				>
					<Typography
						variant="h4"
						sx={{ fontWeight: "bold", color: "#FF6436" }}
						align="center"
						gutterBottom
					>
						User Profile
					</Typography>
					<Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
						<label htmlFor="avatar-upload">
							<Avatar
								sx={{ width: 100, height: 100, cursor: "pointer" }}
								src={avtarChange ? newAvatar : `${user.avatar}`}
							>
								{user?.firstName?.[0]}
							</Avatar>
						</label>
						<input
							id="avatar-upload"
							type="file"
							accept="image/*"
							style={{ display: "none" }}
							onChange={handleAvatarChange}
						/>
					</Box>
					<Grid container spacing={2}>
						<Grid item size={6} >
							<TextField
								label="First Name"
								name="firstName"
								value={user.firstName}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
						<Grid item size={6}>
							<TextField
								label="Last Name"
								name="lastName"
								value={user.lastName}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
					</Grid>
					<TextField
						label="Email Address"
						name="email"
						disabled
						value={user.email}
						type="email"
						fullWidth
						margin="normal"
					/>
					<TextField
						label="Phone Number"
						name="phone"
						disabled
						value={user.phone}
						fullWidth
						margin="normal"
					/>
					<LocationSearchInput
						id="address"
						name="address"
						label="Address"
						value={user.address}
						handleLatLng={handleLatLng}
						handleAddress={handleAddress}
					/>
					<Grid container spacing={2}>
						<Grid item size={6}>
							<Select
								fullWidth
								required
								id="idType"
								name="idType"
								value={user.idType}
								onChange={handleInputChange}
								displayEmpty
								sx={{ mt: 2, textAlign: "left" }}
								variant="outlined"
							>
								<MenuItem value={null} disabled>
									Government ID Type
								</MenuItem>
								{govtIdTypes?.map(item => (<MenuItem key={item} value={item}>{item}</MenuItem>))}
							</Select>
							{/* <TextField
								label="Government ID Type"
								name="idType"
								value={user.idType}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/> */}
						</Grid>
						<Grid item size={6}>
							<TextField
								label="Government ID Number"
								name="idNumber"
								value={user.idNumber}
								onChange={handleInputChange}
								fullWidth
								margin="normal"
							/>
						</Grid>
					</Grid>
					{<Box>{isLoading ? <CircularProgress /> : <Button
						variant="contained"
						sx={{
							backgroundColor: "#FF6436",
							color: "white",
							marginTop: theme.spacing(2),
							marginBottom: isMobile ? "40px" : theme.spacing(1),
							"&:hover": {
								backgroundColor: "#36a420",
							},
							textTransform: "none",
						}}
						fullWidth
						onClick={handleSaveChanges}
					>
						Save Changes
					</Button>}
					</Box>}
				</Box>
			</Box>
		</Box>
	);
};

export default UserProfile;
