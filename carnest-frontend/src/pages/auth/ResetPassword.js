import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { useNavigate, useParams } from "react-router-dom";
import { useResetPasswordMutation } from "../../services/userAuthApi";

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id, token } = useParams(); // Get the user ID and token from the URL params
  const [serverError, setServerError] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      password: data.get("password"),
      password2: data.get("password2"),
    };

    const res = await resetPassword({ actualData, id, token });
    if (res.error) {
      setServerError(res.error.data.errors || {});
      setServerMessage("");
    } else if (res.data) {
      setServerError({});
      setServerMessage(res.data.msg); // Success message from backend
      document.getElementById("reset-password-form").reset();
      setTimeout(() => navigate("/login"), 3000); // Redirect to login page after 3 seconds
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        padding: theme.spacing(2),
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 460,
          padding: theme.spacing(4),
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
        component="form"
        noValidate
        id="reset-password-form"
        onSubmit={handleSubmit}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#FF6436",
            fontWeight: "bold",
            marginBottom: theme.spacing(2),
          }}
        >
          Carnest
        </Typography>
        <Typography variant="h6" gutterBottom>
          Reset Your Password
        </Typography>
        <Typography variant="body2" gutterBottom>
          Enter your new password below.
        </Typography>
        <TextField
          fullWidth
          required
          id="password"
          name="password"
          label="New Password"
          type="password"
          variant="outlined"
          margin="normal"
          error={Boolean(serverError.password)}
          helperText={serverError.password ? serverError.password[0] : ""}
        />
        <TextField
          fullWidth
          required
          id="password2"
          name="password2"
          label="Confirm Password"
          type="password"
          variant="outlined"
          margin="normal"
          error={Boolean(serverError.password2)}
          helperText={serverError.password2 ? serverError.password2[0] : ""}
        />
        <Box>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#FF6436",
                color: "white",
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(1),
                "&:hover": {
                  backgroundColor: "#36a420",
                },
              }}
            >
              Reset Password
            </Button>
          )}
        </Box>
        {serverMessage && (
          <Alert severity="success" sx={{ marginTop: theme.spacing(2) }}>
            {serverMessage}
          </Alert>
        )}
        {serverError.non_field_errors && (
          <Alert severity="error" sx={{ marginTop: theme.spacing(2) }}>
            {serverError.non_field_errors[0]}
          </Alert>
        )}
        <Divider sx={{ marginY: 2 }}>or</Divider>
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#42b72a",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#36a420",
            },
          }}
          href="/login"
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPassword;
