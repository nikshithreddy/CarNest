import { render, screen, act } from "@testing-library/react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import DateTimeInput from "../components/DateTimeInput";
import { format } from "date-fns";

describe("DateTimeInput Component", () => {
  const mockHandleDateTime = jest.fn();

  const renderComponent = (props = {}) =>
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimeInput
          id="test-id"
          name="test-name"
          value={props.value || ""}
          serverError={props.serverError || {}}
          handleDateTime={mockHandleDateTime}
        />
      </LocalizationProvider>
    );

  test("renders DateTimeInput component correctly", () => {
    renderComponent();

    const inputElement = screen.getByLabelText(/select date & time/i);
    expect(inputElement).toBeInTheDocument();
  });

  test("formats value prop and displays it correctly", () => {
    const value = "2024-12-09T15:30:00";
    renderComponent({ value });

    const inputElement = screen.getByLabelText(/select date & time/i);

    // Format the expected value as it would appear in the input field
    const expectedValue = format(new Date(value), "MM/dd/yyyy hh:mm a"); // Adjust format for MUI's localization
    expect(inputElement).toHaveValue(expectedValue);
  });

  test("does not throw error when value is null or undefined", () => {
    renderComponent({ value: null });

    const inputElement = screen.getByLabelText(/select date & time/i);
    expect(inputElement).toHaveValue("");
  });
});
