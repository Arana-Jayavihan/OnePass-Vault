import { Backdrop, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useIdleTimer } from 'react-idle-timer'
import { motion } from 'framer-motion'

import { lockUserVault } from "./actions/vaultActions";
import { isLoggedIn, tokenRefresh, signout } from "./actions/authActions";
import { themeSettings } from "./helpers/theme";
import './App.css'

import Dashboard from "./scenes/dashboard"
import Layout from "./scenes/layout";
import SignIn from "./scenes/signin/SignIn";
import PassReset from "./scenes/pwReset/PassReset";
import Signup from "./scenes/signup/Signup";
import Transactions from "./scenes/transactions/Transactions";
import Vaults from "./scenes/vaults/Vaults";
import Billing from "./scenes/billing/Billing";
import Profile from "./scenes/profile/Profile";
import UnlockedVault from "./scenes/unlockedVault/UnlockedVault";
import VaultInvite from "./scenes/vaultInvite/vaultInvite";

function App() {
	const dispatch = useDispatch()
	const loading = useSelector(state => state.auth.loading)
	const checking = useSelector(state => state.auth.authChecking)
	const verifying = useSelector(state => state.auth.verifying)
	const mode = useSelector(state => state.general.mode)
	const authenticated = useSelector(state => state.auth.authenticated);
	const authenticating = useSelector(state => state.auth.authenticating)
	const vaultKey = useSelector(state => state.vault.vaultKey)
	const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
	const location = useLocation()
	const navigate = useNavigate()

	const timeout = 1000 * 60 * 3
	const promptBeforeIdle = 1000 * 60 * 2
	const [remaining, setRemaining] = useState(timeout);
	const [open, setOpen] = useState(false);
	const [blur, setBlur] = useState(0);

	const onIdle = () => {
		if (authenticated) {
			setBlur(0)
			setOpen(false)
			dispatch(signout())
		}
	}

	const onActive = () => {
		setBlur(0)
		setOpen(false)
		dispatch(tokenRefresh())
	}

	const onPrompt = () => {
		setOpen(true)
	}

	const {
		getRemainingTime,
		activate,
		start
	} = useIdleTimer({
		onIdle,
		onActive,
		onPrompt,
		startManually: true,
		crossTab: true,
		syncTimers: 200,
		timeout,
		promptBeforeIdle
	})

	useEffect(() => {
		if (authenticated) {
			start()
		}
	}, [authenticated])

	useEffect(() => {
		const interval = setInterval(() => {
			setRemaining(Math.ceil(getRemainingTime() / 1000))
			if (remaining <= 120) {
				setBlur(blur + 0.1)
			}
		}, 100)

		return () => {
			clearInterval(interval)
		}
	})

	const renderTimeoutModal = () => {
		return (
			<>
				{
					authenticated ?
						<motion.div
							whileInView={{ opacity: [0, 1] }}
							transition={{ duration: .75, ease: 'easeInOut' }}
							initial={{ opacity: 0 }}
							className='modal123'
							style={{
								display: open ? 'flex' : 'none',
								backdropFilter: `blur(${blur}px)`
							}}>
							<motion.div
								whileInView={{ opacity: [0, 1] }}
								transition={{ duration: .75, ease: 'easeInOut' }}
								initial={{ opacity: 0 }}
								style={{ width: 'fit-content', height: 'fit-content', background: theme.palette.primary[900], borderRadius: '15px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
							>
								<Typography
									variant="h4" fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', width: 'fit-content', backgroundImage: 'linear-gradient(to right, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }}
								>
									Are you still there?
								</Typography>
								{
									Math.floor(remaining / 60) > 0 ?
										<p style={{ color: theme.palette.primary[100] }} >Logging out in {Math.floor(remaining / 60)} minutes and {remaining % 60} seconds.</p>
										:
										<p style={{ color: theme.palette.primary[100] }} >Logging out in {remaining % 60} seconds.</p>

								}
								<motion.button
									className='form-control' style={{ width: 'auto', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
									whileHover={{ scale: [1, 1.1] }}
									onClick={() => activate()}
								>
									I'm still here
								</motion.button>
							</motion.div>
						</motion.div>
						:
						null
				}
			</>
		)
	}

	useEffect(() => {
		if (!authenticated) {
			dispatch(isLoggedIn());
		}
	}, []);

	useEffect(() => {
		if (!location.pathname.includes("/unlock-vault")) {
			if (vaultKey !== undefined) {
				dispatch(lockUserVault())
			}
		}
	}, [location.pathname]);

	useEffect(() => {
		dispatch(tokenRefresh())
	}, [location.pathname]);

	useEffect(() => {
		if (checking === true) {
			toast.loading('Validating Session...', {
				id: 'Validating Session'
			})
		}
		else if (checking === false) {
			toast.dismiss('Validating Session')
		}

	}, [checking]);

	useEffect(() => {
		if (authenticating === true) {
			toast.loading('Logging in...', {
				id: 'Logging in'
			})
		}
		else if (authenticating === false) {
			toast.dismiss('Logging in')
		}

	}, [authenticating]);

	useEffect(() => {
		if (verifying === true) {
			toast.loading('Verifying user...', {
				id: 'verify'
			})
		}
		else if (verifying === false) {
			toast.dismiss('verify')
		}

	}, [verifying]);

	useEffect(() => {
		if (loading === true) {
			toast.loading('Processing...', {
				id: 'loading'
			})
		}
		else if (loading === false) {
			toast.dismiss('loading')
		}

	}, [loading]);

	return (
		<>
			<div className="app">
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Toaster
						position="top-center"
						reverseOrder={true}
						toastOptions={{
							style: {
								background: mode === 'dark' ? '#333333' : '#dddddd',
								color: mode === 'dark' ? '#ffffff' : '#333333'
							}
						}}
					/>
					<Routes>
						<Route path="/" element={<SignIn />} />
						<Route path="/signup" element={<Signup />} />

						{/* <Route path="/test" element={<Test />} /> */}
						{/* <Route path="pw-reset/:token" element={<PassReset />} /> */}

						<Route element={authenticated ? <Layout /> : <SignIn />}>
							{/* <Route path="/dashboard" element={<Test />} /> */}
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/transactions" element={<Transactions />} />
							<Route path="/vaults" element={<Vaults />} />
							<Route path="/billing" element={<Billing />} />
							<Route path="/profile" element={<Profile />} />
							<Route path="/unlock-vault/:id" element={<UnlockedVault />} />
							<Route path="/vault-invite/:token" element={<VaultInvite />} />
						</Route>
					</Routes>

				</ThemeProvider>
			</div>
			{renderTimeoutModal()}
		</>
	);
}

export default App;
