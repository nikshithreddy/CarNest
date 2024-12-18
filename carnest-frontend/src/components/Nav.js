import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import CarnestLogo from '../assets/car-sharing-logo.png';
 
 
const Nav = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
 
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
 
  const handleClose = () => {
    setAnchorEl(null);
  }; 
 
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

 
        {/* Login/Signup or Profile Icon */}
 
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="black"
            >
              <Avatar alt={""}>{""}</Avatar>
            </IconButton>
            <Menu
            sx={{
                marginTop: '20px',
            }}
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
 
              <MenuItem onClick={()=> navigate('/login')}>Login</MenuItem>
              <MenuItem onClick={()=> navigate('/register')}>Signup</MenuItem>
            </Menu>
          </div>
      </Toolbar>
    </AppBar>
  )
}
 
export default Nav;