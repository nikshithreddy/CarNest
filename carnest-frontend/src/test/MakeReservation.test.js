import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CarpoolBooking from '../components/MakeReservation';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);

describe('CarpoolBooking Component', () => {
	let store;

	beforeEach(() => {
		store = mockStore({
			auth: { access_token: 'mockToken', profile: { id: 1, name: 'John Doe' } },
			apiSlice: { rideDetails: { available_seats: 4, date_time: '2024-12-10T12:00:00Z', within_time: '18m', ride_description: 'A comfortable ride', going_from: 'City A', going_to: 'City B', driver_name: 'Jane Smith', vehicle_name: 'Toyota Corolla', vehicle_color: 'Red', price_per_seat: 20, avatar: null } },
		});
	});

	it('renders the component without crashing', async () => {
		await act(async () => {
			render(
				<Provider store={store}>
					<BrowserRouter>
						<CarpoolBooking handleBack={jest.fn()} rideBookId={1} />
					</BrowserRouter>
				</Provider>
			);
		});

		expect(screen.getByText(/City A/)).toBeInTheDocument();
		expect(screen.getByText(/City B/)).toBeInTheDocument();
		expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
		expect(screen.getByText(/Toyota Corolla/)).toBeInTheDocument();
	});
});
