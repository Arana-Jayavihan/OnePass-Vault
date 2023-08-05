import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [user, setUser] = useState({});
  const fUser = useSelector(state => state.auth.user)
  useEffect(() => {
    setUser(fUser)
  }, [user]);

  return (
    <Box display={isNonMobile ? "flex" : "block"} width="100%" height="100%" marginBottom='3rem'>
      <Box flexGrow={1}>
        <Sidebar
          user={user || {}}
          isNonMobile={isNonMobile}
          drawerWidth="300px"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Navbar
          user={user || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Outlet/>
      </Box>
    </Box>
  );
};

export default Layout;