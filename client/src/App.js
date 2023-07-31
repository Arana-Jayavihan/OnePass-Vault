import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { themeSettings } from "theme";
import { Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "scenes/dashboard";
import Layout from "scenes/layout";
import SignIn from "scenes/signin/SignIn";
import { Toaster, toast } from "react-hot-toast";
import { isLoggedIn, tokenRefresh } from "actions/authActions";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import './App.css'
import { signout } from "actions/authActions";
import PassReset from "scenes/pwReset/PassReset";
import Signup from "scenes/signup/Signup";
import Test from "scenes/Test/Test";
import Transactions from "scenes/transactions/Transactions";
import Vaults from "scenes/vaults/Vaults";
import Billing from "scenes/billing/Billing";
import Profile from "scenes/profile/Profile";
import UnlockedVault from "scenes/unlockedVault/UnlockedVault";
import { lockUserVault } from "actions/vaultActions";
import VaultInvite from "scenes/vaultInvite/vaultInvite";

function App() {
	const dispatch = useDispatch()
	const loading = useSelector(state => state.auth.loading)
	const verifying = useSelector(state => state.auth.verifying)
	const mode = useSelector(state => state.general.mode)
	const authenticated = useSelector(state => state.auth.authenticated);
	const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
	useEffect(() => {
		if (!authenticated) {
			dispatch(isLoggedIn());
		}
	}, []);

	const refreshToken = useCallback(() => {
		dispatch(tokenRefresh())
	}, [dispatch])

	const lockVault = useCallback(() => {
		dispatch(lockUserVault())
	}, [dispatch])

	useEffect(() => {
		const interval = setInterval(() => {
			refreshToken()
		}, 1800000);
		return () => clearInterval(interval);
	}, []);

	const authenticating = useSelector(state => state.auth.authenticating)

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
			{/* <AuthVerify logOut={logOut} refreshToken={refreshToken} lockVault={lockVault} /> */}
		</div>

	);
}

export default App;
