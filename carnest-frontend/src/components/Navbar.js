import React, { useEffect, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Skeleton,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import CarnestLogo from '../assets/car-sharing-logo.png';
import { Search, DirectionsCar, List, Message } from '@mui/icons-material';
import { removeToken } from '../services/LocalStorageService';
import { useSelector, useDispatch } from 'react-redux';
import { setGovtIdType, setProfile, unSetUserToken } from '../features/authSlice';
import { useGetVehicleMutation } from '../services/apiService';
import { setVehiclesList } from '../features/apiSlice';
import { useGetGovtIdTypeMutation, useUserProfileMutation } from '../services/userAuthApi';


const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Access the token and derive `isLoggedIn` from Redux state
  const { access_token, profile } = useSelector((state) => state.auth);

  const [getVehicle] = useGetVehicleMutation();
  const [userProfile, { error, isLoading }] = useUserProfileMutation();
  const [getGovtIdType] = useGetGovtIdTypeMutation();

  if (error) return <div>Error loading profile</div>;

  const isLoggedIn = Boolean(access_token);

  const menuItems = [
    { name: 'Search', path: '/search', icon: <Search /> },
    { name: 'Post Ride', path: '/PostRide', icon: <DirectionsCar /> },
    { name: 'Your Rides', path: '/YourRides', icon: <List /> },
    { name: 'Messages', path: '/Messages', icon: <Message /> },
  ];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = async (url) => {
    if (url === 'YourRides') {

      navigate(`/${url}`);
    } else {
      navigate(`/${url}`);
    }
    handleClose()
  }

  const handleLogout = () => {
    dispatch(unSetUserToken())
    removeToken()
    dispatch(unSetUserToken()); // Clear token from Redux
    handleClose();
    navigate('/login');
  };

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
      // console.error(error);
    }
  };

  const getGovtIdTypeList = async () => {
    try {
      const res = await getGovtIdType(access_token);
      if (res.error) {
        console.error(res.error.data.errors); // Display login error
        return; // Exit early on error
      }
      if (res.data) {
        const { data } = res;
        dispatch(setGovtIdType({ data }));
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const getProfileDetails = async () => {
    try {
      const res = await userProfile(access_token);
      if (res.error) {
        console.error(res.error.data.errors); // Display login error
        return; // Exit early on error
      }
      if (res.data) {
        getVehiclesList();
        getGovtIdTypeList();
        dispatch(setProfile({ profile: res.data }));
      }
    } catch (error) {
      // console.error(error);
    }
  };

  // eslint-disable-next-line
  useEffect(() => {
    getProfileDetails();
  }, []) // eslint-disable-line

  return (
    <AppBar position="static" sx={{ backgroundColor: 'background.paper', borderRadius: '30px', boxShadow: 'none', zIndex: 1001 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        {/* Logo and Brand Name */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={CarnestLogo} alt="Carnest Logo" style={{ height: '35px', marginRight: '5px', marginBottom: '10px' }} />
          <Typography variant="h6" component={NavLink} to="/search" sx={{ textDecoration: 'none', color: 'text.primary' }}>
            Carnest
          </Typography>
        </Box>

        {/* Desktop Menu Items */}
        {!isMobile && isLoggedIn && <Box>
          {isLoading ?
            <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <Skeleton variant="rectangular" width={100} height={40} sx={{ mr: 2 }} />
              <Skeleton variant="rectangular" width={100} height={40} sx={{ mr: 2 }} />
              <Skeleton variant="rectangular" width={100} height={40} sx={{ mr: 2 }} />
              <Skeleton variant="rectangular" width={100} height={40} />
            </Box> : (
              <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                {menuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    style={({ isActive }) => ({
                      margin: '0 8px', textDecoration: 'none', color: isActive ? '#FF6436' : 'black', fontWeight: isActive ? 'bold' : 'normal',
                      display: 'flex', alignItems: 'center',
                    })}>
                    {item.icon}
                    <Typography sx={{ ml: 1 }}>{item.name}</Typography>
                  </NavLink>
                ))}
              </Box>
            )}</Box>}

        {/* Login/Signup or Profile Icon */}
        {isLoggedIn ? (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="black"
            >
              <Avatar alt={profile?.first_name} src={profile.profile_picture}>{profile?.first_name?.split('')[0]}</Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleMenuClick('userprofile')}>Profile</MenuItem>
              <MenuItem onClick={() => handleMenuClick('Vehicles')}>Vehicles</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        ) : (
          <Box>
            <Button backgroundColor="text.secondary" component={NavLink} to="/login">
              Login
            </Button>
          </Box>
        )
        }

        {/* Mobile Bottom Navigation */}
        {isMobile && isLoggedIn && (
          <BottomNavigation
            showLabels
            sx={{
              width: '100%',
              position: 'fixed',
              bottom: 0,
              left: 0,
              zIndex: 1000,
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {menuItems.map((item) => (
              <BottomNavigationAction
                key={item.name}
                label={item.name}
                icon={item.icon}
                component={NavLink}
                to={item.path}
                sx={{
                  '&.active': {
                    color: '#FF6436', // Active menu color
                  },
                  color: 'text.primary', // Default menu color
                }}
              />
            ))}
          </BottomNavigation>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
