import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from '../components/Navbar';

jest.mock('@mui/material/useMediaQuery', () => jest.fn());

const mockStore = configureStore([]);

const renderWithProviders = (ui, { reduxState = {}, theme = createTheme() } = {}) => {
    const store = mockStore(reduxState);

    return render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <MemoryRouter>
                    <Navbar />
                </MemoryRouter>
            </ThemeProvider>
        </Provider>
    );
};

describe('Navbar Component', () => {
    const initialState = {
        auth: {
            access_token: null,
            profile: null,
        },
    };

    it('renders the Carnest logo and brand name', () => {
        renderWithProviders(<Navbar />, { reduxState: initialState });
        expect(screen.getByAltText(/Carnest Logo/i)).toBeInTheDocument();
        expect(screen.getByText(/Carnest/i)).toBeInTheDocument();
    });

    it('renders login button when user is not logged in', () => {
        renderWithProviders(<Navbar />, { reduxState: initialState });
        expect(screen.getByText(/Login/i)).toBeInTheDocument();
    });

    it('renders profile avatar when user is logged in', () => {
        const loggedInState = {
            auth: {
                access_token: 'mock-token',
                profile: { first_name: 'John', profile_picture: '/path/to/profile.jpg' },
            },
        };

        renderWithProviders(<Navbar />, { reduxState: loggedInState });
        expect(screen.getByLabelText(/account of current user/i)).toBeInTheDocument();
        expect(screen.getByAltText(/John/i)).toBeInTheDocument();
    });

    it('renders correct menu items for a driver role', () => {
        const loggedInState = {
            auth: {
                access_token: 'mock-token',
                profile: { role: 'Driver', first_name: 'John', profile_picture: '/path/to/profile.jpg' },
            },
        };

        renderWithProviders(<Navbar />, { reduxState: loggedInState });
        expect(screen.getByText(/Post Ride/i)).toBeInTheDocument();
        expect(screen.queryByText(/Search/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Messages/i)).toBeInTheDocument();
    });

    it('renders correct menu items for a non-driver role', () => {
        const loggedInState = {
            auth: {
                access_token: 'mock-token',
                profile: { role: 'User', first_name: 'Jane', profile_picture: '/path/to/profile.jpg' },
            },
        };

        renderWithProviders(<Navbar />, { reduxState: loggedInState });
        expect(screen.getByText(/Search/i)).toBeInTheDocument();
        expect(screen.getByText(/Your Rides/i)).toBeInTheDocument();
        expect(screen.getByText(/Messages/i)).toBeInTheDocument();
        expect(screen.queryByText(/Post Ride/i)).not.toBeInTheDocument();
    });

    it('opens and closes the profile menu', () => {
        const loggedInState = {
            auth: {
                access_token: 'mock-token',
                profile: { first_name: 'John', profile_picture: '/path/to/profile.jpg' },
            },
        };

        renderWithProviders(<Navbar />, { reduxState: loggedInState });

        // Open the menu
        const avatarButton = screen.getByLabelText(/account of current user/i);
        fireEvent.click(avatarButton);
        expect(screen.getByText(/Profile/i)).toBeInTheDocument();

        // Close the menu by clicking an item
        const logoutItem = screen.getByText(/Logout/i);
        fireEvent.click(logoutItem);

        // Use `queryByText` to verify the menu is no longer visible
        expect(screen.queryByText(/Profile/i)).not.toBeVisible();
    });

    it('navigates to correct pages when menu items are clicked', () => {
        const loggedInState = {
            auth: {
                access_token: 'mock-token',
                profile: { first_name: 'John', role: 'Driver', profile_picture: '/path/to/profile.jpg' },
            },
        };

        renderWithProviders(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>,
            { reduxState: loggedInState }
        );

        // Find and assert the "Post Ride" link
        const postRideLink = screen.getByText(/Post Ride/i).closest('a'); // Use `closest('a')` to ensure we target the anchor element
        expect(postRideLink).toHaveAttribute('href', '/PostRide');
    });
});
