import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/system';
import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../services/userAuthApi';
import { getToken, storeToken } from '../../services/LocalStorageService';
import { setUserToken } from '../../features/authSlice';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [serverError, setServerError] = useState({});

  const [loginUser, { isLoading }] = useLoginUserMutation();

  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extracting data from the form
    const data = new FormData(e.currentTarget);
    const actualData = {
      email: data.get("email"),
      password: data.get("password"),
    };

    try {
      // Login user
      const res = await loginUser(actualData);

      if (res.error) {
        setServerError(res.error.data.errors); // Display login error
        return; // Exit early on error
      }

      if (res.data) {
        // Store the token and update Redux state
        storeToken(res.data.token);
        const { access_token } = getToken();
        dispatch(setUserToken({ access_token }));

        // // Fetch user profile using the access token
        // const result = await userProfile(access_token);

        // if (result.error) {
        //   setServerError(result.error.data.errors); // Display profile fetch error
        // } else if (result.data) {
        //   // Set user profile in Redux and navigate to the search page
        //   dispatch(setProfile({ profile: result.data }));
        navigate("/search");
        // }
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setServerError([{ msg: "An unexpected error occurred. Please try again later." }]);
    }
  };


  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: isMobile ? "#fff" : '#f0f2f5',
        padding: isMobile ? 0 : theme.spacing(2),
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 460,
          padding: theme.spacing(4),
          borderRadius: '8px',
          backgroundColor: '#FFFFFF',
          boxShadow: isMobile ? 'none' : '0px 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
        component="form"
        noValidate
        id="login-form"
        onSubmit={handleSubmit}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#FF6436',
            fontWeight: 'bold',
            marginBottom: theme.spacing(2),
          }}
        >
          Carnest
        </Typography>
        <Typography variant="h6" gutterBottom>
          Log Into Carnest
        </Typography>
        <TextField
          fullWidth
          required
          id="email"
          name="email"
          label="Email Address"
          variant="outlined"
          margin="normal"
          error={Boolean(serverError.email)}
          helperText={serverError.email ? serverError.email[0] : ''}
        />
        <TextField
          fullWidth
          required
          id="password"
          name="password"
          label="Password"
          type="password"
          variant="outlined"
          margin="normal"
          error={Boolean(serverError.password)}
          helperText={serverError.password ? serverError.password[0] : ''}
        />
        <Box>
          {isLoading ? <CircularProgress /> : <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#FF6436',
              color: 'white',
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(1),
              '&:hover': {
                backgroundColor: '#36a420',
              },
            }}
          >
            Log In
          </Button>}
        </Box>

        <Link
          href="/forgotpassword"
          color="inherit"
          underline="hover"
          sx={{ display: 'block', marginBottom: theme.spacing(2) }}
        >
          Forgot Password?
        </Link>
        {serverError.non_field_errors ? <Alert severity='error'>{serverError.non_field_errors[0]}</Alert> : ''}
        <Divider sx={{ marginY: 2 }}>or</Divider>
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#42b72a',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#36a420',
            },
          }}
          component={NavLink}
          to="/register"
        >
          Create New Account
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
