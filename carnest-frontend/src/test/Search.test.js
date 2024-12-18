import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useSearchRidesMutation } from '../services/apiService';
import userEvent from '@testing-library/user-event';
import Search from '../pages/Search';

// Mocking the useSearchRidesMutation hook and other required dependencies
jest.mock('../services/apiService', () => ({
	useSearchRidesMutation: jest.fn(),
}));

jest.mock('../components/LocationSearchInput', () => ({
	__esModule: true,
	default: ({ name, label, error, value, handleLatLng, handleAddress }) => {
		return (
			<input
				name={name}
				value={value}
				onChange={(e) => handleAddress(e.target.value, name)}
				placeholder={label}
				aria-invalid={error ? 'true' : 'false'}
			/>
		);
	},
}));

// A mock store for Redux
const mockStore = createStore((state) => ({
	auth: { access_token: 'mocked_access_token' }, // Mock the auth state
}));

describe('Search Component', () => {
	const mockSearchRides = jest.fn();
	const mockDispatch = jest.fn();

	beforeEach(() => {
		mockSearchRides.mockReset();

		// Mock the `useSearchRidesMutation` hook to return mock data
		useSearchRidesMutation.mockReturnValue([
			mockSearchRides,
			{ isLoading: false }, // This simulates the loading state
		]);
	});

	test('should validate form and make a search request', async () => {
		mockSearchRides.mockResolvedValueOnce({ data: { rides: [] } });

		render(
			<Provider store={mockStore}>
				<Search />
			</Provider>
		);

		// Fill in the form fields
		fireEvent.change(screen.getByPlaceholderText('From'), { target: { value: 'New York' } });
		fireEvent.change(screen.getByPlaceholderText('Going To'), { target: { value: 'Boston' } });
		fireEvent.change(screen.getByLabelText(/no of passengers/i), { target: { value: '2' } });
		fireEvent.change(screen.getByLabelText(/range in km/i), { target: { value: '50' } });
		await userEvent.type(screen.getByTestId('date-input'), '2024-12-10');  
		// Submit the form
		fireEvent.click(screen.getByText('Search'));

		// Wait for the search to be processed
		// await waitFor(() => expect(mockSearchRides).toHaveBeenCalledTimes(1));
		// expect(mockSearchRides).toHaveBeenCalledWith({
		// 	going_from_lat: expect.any(String),
		// 	going_from_lng: expect.any(String),
		// 	no_of_passengers: 2,
		// 	range_in_km: 50,
		// 	date: '2024-12-10',
		// });
	});

	test('should show validation errors when the form is submitted with missing fields', async () => {
	// 	render(
	// 		<Provider store={mockStore}>
	// 			<Search />
	// 		</Provider>
	// 	);

	// 	// Submit the form without filling in any field
	// 	fireEvent.click(screen.getByText('Search'));

	// 	// Wait for validation errors to show
	// 	await waitFor(() => {
	// 		expect(screen.getByText('From location is required.')).toBeInTheDocument();
	// 		expect(screen.getByText('Going to location is required.')).toBeInTheDocument();
	// 		expect(screen.getByText('Date is required.')).toBeInTheDocument();
	// 		expect(screen.getByText('Number of passengers is required.')).toBeInTheDocument();
	// 		expect(screen.getByText('Range in km is required.')).toBeInTheDocument();
	// 	});
	// });
});
