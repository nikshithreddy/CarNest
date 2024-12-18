import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../../services/userAuthApi';
import { storeToken } from '../../services/LocalStorageService';

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();

  const [serverError, setServerError] = useState({});

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      first_name: data.get('first_name'),
      last_name: data.get('last_name'),
      email: data.get('email'),
      phone_number: data.get('phone_number'),
      password: data.get('password'),
      password2: data.get('password2'),
      terms_and_conditions_accepted: data.get('terms_and_conditions_accepted') === 'true',
      role: data.get('role'),
    };
    // console.log(actualData)

    const res = await registerUser(actualData);
    // console.log(res)
    if (res.error) {
      setServerError(res.error.data.errors);
    } else if (res.data) {
      storeToken(res.data.token);
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: isMobile ? '#fff' : '#f0f2f5',
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
        onSubmit={handleSubmit}
      >
        <Typography variant="h4" sx={{ color: '#FF6436', fontWeight: 'bold', mb: 2 }}>
          Carnest
        </Typography>
        <Typography variant="h6" component="div" gutterBottom>
          Create a new account
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          It’s quick and easy.
        </Typography>

        <Box display="flex" gap={1} mb={2}>
          <TextField
            name="first_name"
            label="First Name"
            variant="outlined"
            fullWidth
            required
            error={Boolean(serverError.first_name)}
            helperText={serverError.first_name ? serverError.first_name[0] : ''}
          />
          <TextField
            name="last_name"
            label="Last Name"
            variant="outlined"
            fullWidth
            required
            error={Boolean(serverError.last_name)}
            helperText={serverError.last_name ? serverError.last_name[0] : ''}
          />
        </Box>
        <Box display="flex" gap={1} >
          {/* <Select
            fullWidth
            required
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            displayEmpty
            sx={{ mt: 2, mb: 2, textAlign: "left" }}
            variant="outlined"
            error={Boolean(serverError.role)}
            helperText={serverError.role ? serverError.role[0] : ''}
          >
            <MenuItem value="" disabled>
              Select Role
            </MenuItem>
            <MenuItem value="Passenger">Passenger</MenuItem>
            <MenuItem value="Driver">Driver</MenuItem>
          </Select> */}
          <TextField
            name="phone_number"
            label="Mobile Number"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            error={Boolean(serverError.phone_number)}
            helperText={serverError.phone_number ? serverError.phone_number[0] : ''}
          />
        </Box>

        <TextField
          name="email"
          label="Email Address"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          error={Boolean(serverError.email)}
          helperText={serverError.email ? serverError.email[0] : ''}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          error={Boolean(serverError.password)}
          helperText={serverError.password ? serverError.password[0] : ''}
        />
        <TextField
          name="password2"
          label="Confirm Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          error={Boolean(serverError.password2)}
          helperText={serverError.password2 ? serverError.password2[0] : ''}
        />
        <FormControlLabel
          control={<Checkbox name="terms_and_conditions_accepted" color="primary" />}
          label="I agree to the terms and conditions."
        />
        {serverError.terms_and_conditions_accepted && (
          <Typography sx={{ color: 'red', fontSize: 12 }}>
            {serverError.terms_and_conditions_accepted[0]}
          </Typography>
        )}


        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#FF6436',
            color: '#fff',
            mt: theme.spacing(2),
            '&:hover': { backgroundColor: '#36a420' },
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Register'}
        </Button>

        {serverError.non_field_errors && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {serverError.non_field_errors[0]}
          </Alert>
        )}

        <Link href="/login" color="primary" underline="hover" sx={{ mt: 2, display: 'block' }}>
          Already have an account?
        </Link>
      </Box>
    </Box>
  );
};

export default Register;
