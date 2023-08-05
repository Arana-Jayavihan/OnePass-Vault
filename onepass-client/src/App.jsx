import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

import { lockUserVault } from "./actions/vaultActions";
import { isLoggedIn, tokenRefresh } from "./actions/authActions";
import { themeSettings } from "./theme";
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

	useEffect(() => {
		if (!authenticated) {
			dispatch(isLoggedIn());
		}
	}, []);

	useEffect(() => {
		if (!location.pathname.includes("/unlock-vault")) {
			if (vaultKey !== undefined) {
				console.log(true, vaultKey)
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

	);
}

export default App;
