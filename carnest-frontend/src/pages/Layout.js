import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
    const location = useLocation();
    const hideNavbarPaths = [
        '/login',
        '/register',
        '/forgotpassword',
        '/changepassword',
        '/send-reset-password-email',
        'api/user/reset/',
        '/',
    ];
    return <>
        {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
        <Outlet />
    </>
};

export default Layout;