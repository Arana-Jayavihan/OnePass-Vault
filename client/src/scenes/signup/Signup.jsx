import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Card from "components/Card/Card";
import {
    Typography,
    useTheme
} from "@mui/material";
import { toast } from "react-hot-toast";
import '../signin/signin.css'
import { motion } from 'framer-motion'
import { signup } from "actions/authActions";

const Signup = () => {
    const loading = useSelector(state => state.auth.loading)
    const [email, setEmail] = useState(undefined);
    const [firstName, setFirstName] = useState(undefined);
    const [lastName, setLastName] = useState(undefined);
    const [contact, setContact] = useState(undefined);
    const [password, setPassword] = useState(undefined);
    const [confirmPassword, setConfirmPassword] = useState(undefined);
    const dispatch = useDispatch()
    const theme = useTheme()

    const userSignup = () => {
        if (password === confirmPassword) {
            const form = {
                email,
                firstName,
                lastName,
                contact,
                password
            }
            console.log(form)
            dispatch(signup(form))
            setEmail('')
            setFirstName('')
            setLastName('')
            setContact('')
            setPassword('')
            setConfirmPassword('')
            
        }
        else {
            toast.error("Passwords Mismatch")
        }
    }

    if (loading) {
        return <Navigate to='/' />
    }
    return (
        <>
            <motion.div className="container-div"
                whileInView={{ opacity: [0, 1] }}
                transition={{ duration: .75, ease: 'easeInOut' }}
                initial={{ opacity: 0 }}
            >
                <div className="overlay">
                    <Card>
                        <Typography variant="h3" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '2rem', marginTop: 0, color: theme.palette.secondary[500] }} >DAPass Vault</Typography>
                        <p className="subtitle">
                            Please create an account!
                        </p>
                        <form onSubmit={userSignup}>
                            <div className="inputs_container">
                                <div className="inputs_container1">
                                    <input
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                    <input
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                                <div className="inputs_container1">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Contact"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                    />
                                </div>
                                <div className="inputs_container1">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <input type="button" value="Sign Up" className="login_button" onClick={(e) => userSignup()} />
                        </form>
                        <div className="link_container1">
                            <a href="/" className="small">
                                Go to Signin
                            </a>
                        </div>
                    </Card>
                </div>

            </motion.div>
        </>
    );
}

export default Signup;
