import React from "react";
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme,
} from "@mui/material";
import {
    ChevronLeft,
    ChevronRightOutlined,
    HomeOutlined,
    Groups2Outlined,
    AdminPanelSettingsOutlined,
} from "@mui/icons-material";
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from "./FlexBetween";
import { motion } from 'framer-motion'
import { MdLogout } from 'react-icons/md'
import { signout } from "../actions/authActions";
import { useDispatch, useSelector } from "react-redux";
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

const navItems = [
    {
        text: "Dashboard",
        icon: <HomeOutlined />,
    },
    {
        text: "Client Facing",
        icon: null,
    },
    {
        text: "Inquiries",
        icon: <InventoryOutlinedIcon />,
    },
    {
        text: "Customers",
        icon: <Groups2Outlined />,
    },
    {
        text: "Orders",
        icon: <SwapHorizOutlinedIcon />,
    },
    
    {
        text: "Management",
        icon: null,
    },
    {
        text: "Administrators",
        icon: <AdminPanelSettingsOutlined />,
    }
];

const Sidebar = (props) => {
    const user = useSelector(state => state.auth.user)
    const { pathname } = useLocation()
    const [active, setActive] = useState("");
    const navigate = useNavigate()
    const theme = useTheme()
    const dispatch = useDispatch()

    const signOut = () => {
        dispatch(signout()).then(
            window.location.href = "localhost:3000/"
        )
    }

    useEffect(() => {
        setActive(pathname.substring(1))
    }, [pathname]);


    return (
        <motion.div
            animate={props.isSidebarOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: .75, ease: 'easeInOut' }}
            initial={{ opacity: 0, scale: 0 }}
        >
            <Box component="nav">

                <Drawer
                    open={props.isSidebarOpen}
                    onClose={() => props.setIsSidebarOpen(false)}
                    varient="persistent"
                    anchor="left"
                    sx={{
                        width: props.drawerWidth,
                        "& .MuiDrawer-paper": {
                            color: theme.palette.secondary[200],
                            backgroundColor: theme.palette.background.alt,
                            boxSixing: "border-box",
                            borderWidth: props.isNonMobile ? 0 : "2px",
                            width: props.drawerWidth,
                            paddingBottom: '1.5rem'
                        },
                    }}
                >
                    <motion.Box width="100%"
                        animate={props.isSidebarOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.5, ease: 'easeInOut', delay: .25 }}
                        initial={{ y: 30, opacity: 0 }}
                    >
                        <Box m="1.5rem 2rem 2rem 3rem">
                            <FlexBetween color={theme.palette.secondary[400]} sx={{ justifyContent: 'center' }} >
                                <Box display="flex" alignItems="center" gap="0.5rem" >
                                    <Typography variant="h4" fontWeight="bold" sx={{ textAlign: 'center' }} >
                                        ADMIN PANEL
                                    </Typography>
                                </Box>
                                {!props.isNonMobile && (
                                    <IconButton onClick={() => props.setIsSidebarOpen(!props.isSidebarOpen)}>
                                        <ChevronLeft className="p-2" />
                                    </IconButton>
                                )}
                            </FlexBetween>
                        </Box>
                        <List>
                            {navItems.map(({ text, icon }) => {
                                if (!icon) {
                                    return (
                                        <Typography key={text} sx={{ m: "2.25rem 0 1rem 3rem" }}>
                                            {text}
                                        </Typography>
                                    );
                                }
                                const lcText = text.toLowerCase();

                                return (
                                    <ListItem key={text} disablePadding>
                                        <ListItemButton
                                            onClick={() => {
                                                navigate(`/${lcText}`);
                                                setActive(lcText);
                                                props.setIsSidebarOpen(false)
                                            }}
                                            sx={{
                                                backgroundColor:
                                                    active === lcText
                                                        ? theme.palette.secondary[400]
                                                        : "transparent",
                                                color:
                                                    active === lcText
                                                        ? theme.palette.primary[600]
                                                        : theme.palette.secondary[100],
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    ml: "2rem",
                                                    color:
                                                        active === lcText
                                                            ? theme.palette.primary[600]
                                                            : theme.palette.secondary[300],
                                                }}
                                            >
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText primary={text} />
                                            {active === lcText && (
                                                <ChevronRightOutlined sx={{ ml: "auto" }} />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </motion.Box>
                    <motion.Box
                        position="absolute"
                        bottom="2rem"
                        animate={props.isSidebarOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.5, ease: 'easeInOut', delay: .25 }}
                        initial={{ y: 30, opacity: 0 }}
                    >
                        <Divider />
                        <FlexBetween textTransform="none" gap="1rem" m="1.5rem 2rem 0 3rem">
                        <ManageAccountsOutlinedIcon
                                sx={{ color: theme.palette.secondary[300], fontSize: "25px" }}
                            />
                            <Box textAlign="left">
                                <Typography
                                    fontWeight="bold"
                                    fontSize="0.9rem"
                                    sx={{ color: theme.palette.secondary[100] }}
                                >
                                    {
                                        user ? 
                                            user.firstName + " " + user.lastName
                                        : null
                                    }
                                </Typography>
                                <Typography
                                    fontSize="0.8rem"
                                    sx={{ color: theme.palette.secondary[300] }}
                                >
                                    {user ? user.role : null}
                                </Typography>
                            </Box>
                            <IconButton onClick={signOut} >
                                <MdLogout style={{ fontSize: '25px', color: theme.palette.secondary[400] }} />
                            </IconButton>

                        </FlexBetween>
                    </motion.Box>
                </Drawer>

            </Box>
        </motion.div>

    );
}

export default Sidebar;
