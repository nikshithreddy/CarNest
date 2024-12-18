import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // primary: {
    //   main: '#FEFEFE',  // Define your primary color
    // },
    // secondary: {
    //   main: '#ff4081',  // Define your secondary color
    // },
    background: {
      default: '#F4F4F4',  // Background color for the entire app
      paper: '#FEFEFE',    // Background color for cards and paper components
    },
    text: {
      primary: '#191A1F',  // Primary text color
      secondary: '#FF6436',  // Secondary text color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',  // You can also customize the font family
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
