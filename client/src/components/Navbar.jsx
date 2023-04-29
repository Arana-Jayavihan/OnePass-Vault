import React, { useState } from 'react';
import {
    LightModeOutlined,
    DarkModeOutlined,
    Menu as MenuIcon,
    ArrowDropDownOutlined,
} from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FlexBetween from './FlexBetween';
import { useDispatch, useSelector } from 'react-redux';
import { AppBar, IconButton, Toolbar, useTheme, Box, Button, Typography, Menu, MenuItem } from '@mui/material';
import { switchMode } from '../actions/generalActions';
import { signout } from 'actions/authActions';
import './style.css'

const Navbar = (props) => {
    const mode = useSelector(state => state.general.mode)
    const user = props.user
    const dispatch = useDispatch()
    const theme = useTheme()

    const [anchorEl, setAnchorEl] = useState(null);
    const isOpen = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null)
    const menuOnClick = () => dispatch(signout())
    return (
        <AppBar sx={{
            top: 0,
            position: 'fixed',
            background: 'none',
            boxShadow: 'none',
            backgroundImage: "linear-gradient(to right, #cc00ee , #6d4aff)"
        }}  >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <FlexBetween>
                    <IconButton onClick={() => props.setIsSidebarOpen(!props.isSidebarOpen)} >
                        <MenuIcon sx={{ color:'#fff' }} />
                    </IconButton>
                </FlexBetween>

                <FlexBetween
                    gap='1.5rem'
                >
                    <IconButton onClick={() => mode === 'light' ? dispatch(switchMode("light")) : mode === 'dark' ? dispatch(switchMode("dark")) : {}}>
                        {
                            theme.palette.mode === "dark" ? (
                                <DarkModeOutlined sx={{ fontSize: '25px', color: '#fff' }} />
                            ) : (
                                <LightModeOutlined sx={{ fontSize: '25px', color: '#fff' }} />
                            )
                        }
                    </IconButton>
                    <FlexBetween>
                        <Button
                            onClick={handleClick}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                textTransform: "none",
                                gap: "1rem",
                            }}
                        >
                            <AccountCircleIcon
                                sx={{ color: "#fff", fontSize: "35px" }}
                            />
                            <Box textAlign="left">
                                <Typography
                                    fontWeight="bold"
                                    fontSize="0.85rem"
                                    sx={{ color: "#fff" }}
                                >
                                    {
                                        user ? 
                                            user.firstName + " " + user.lastName
                                        : null
                                    }
                                </Typography>
                                <Typography
                                    fontSize="0.75rem"
                                    sx={{ color: "#fff" }}
                                >
                                    {user.role}
                                </Typography>
                            </Box>
                            <ArrowDropDownOutlined
                                sx={{ color: "#fff", fontSize: "25px" }}
                            />
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={isOpen}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        >
                            <MenuItem onClick={menuOnClick}>Log Out</MenuItem>
                        </Menu>
                    </FlexBetween>
                </FlexBetween>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;