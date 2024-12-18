import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Layout from "./pages/Layout";
import Search from "./pages/Search";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import YourRides from "./pages/YourRides";
import PostRide from "./pages/PostRide";
import Messages from "./pages/Messages";
import { useSelector } from "react-redux";
import UserProfile from "./pages/auth/UserProfile";
import Vehicles from "./pages/Vehicles";
import ChangePassword from "./pages/auth/ChangePassword";
import SendPasswordResetEmail from "./pages/auth/SendPasswordResetEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import LandingPage from "./pages/LandingPage";

function App() {
  const { access_token } = useSelector((state) => state.auth);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route index element={<Navigate to={access_token ? "/search" : "/login"} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/send-reset-password-email" element={<SendPasswordResetEmail />} />
            <Route path="api/user/reset/:id/:token" element={<ResetPassword />} />
            <Route path="/userprofile" element={<UserProfile />} />

            {/* Protected routes */}
            <Route path="/search" element={access_token ? <Search /> : <Navigate to="/login" />} />
            <Route path="/postride" element={access_token ? <PostRide /> : <Navigate to="/login" />} />
            <Route path="/yourrides" element={access_token ? <YourRides /> : <Navigate to="/login" />} />
            <Route path="/messages" element={access_token ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/vehicles" element={access_token ? <Vehicles /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
