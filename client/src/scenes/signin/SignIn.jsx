import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import Card from "components/Card/Card";
import {
    Typography,
    useTheme,
} from "@mui/material";
import { toast } from "react-hot-toast";
import './signin.css'
import { passResetRequest, login } from "actions/authActions";
import { motion } from 'framer-motion'

const SignIn = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [resetMode, setResetMode] = useState(false);
    const [email, setEmail] = useState('');
    const [passwd, setPasswd] = useState('');
    const authenticated = useSelector(state => state.auth.authenticated)

    const userLogin = () => {
        if (email === '') {
            toast.error("Please provide an Email...")
        }
        else if (passwd === '') {
            toast.error("Please provide the Password...")
        }
        else if (email === '' && passwd === '') {
            toast.error("Please provide the Credentials...")
        }
        if (email !== '' && passwd !== '') {
            const user = {
                email,
                passwd
            }

            dispatch(login(user))
            setEmail('')
            setPasswd('')
        }
    }

    const passResetReq = () => {
        if (email === '') {
            toast.error("Please provide an Email...")
        }
        else {
            const form = {
                email
            }

            dispatch(passResetRequest(form))
            setEmail('')
        }
    }

    if (authenticated) {
        return <Navigate to='/dashboard' />
    }

    return (
        <>
            {
                resetMode ?
                    <motion.div className="container-div"
                        whileInView={{ opacity: [0, 1] }}
                        transition={{ duration: .75, ease: 'easeInOut' }}
                        initial={{ opacity: 0 }}
                    >
                        <div className="overlay">
                            <Card>
                                <Typography variant="h3" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '2rem', marginTop: 0, color: theme.palette.secondary[500] }} >Request Password Reset</Typography>
                                <p className="subtitle">
                                    You will recieve an email continue from there
                                </p>
                                <form onSubmit={userLogin}>
                                    <div className="inputs_container">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                    </div>
                                    <input type="button" value="Send Request" className="login_button" onClick={(e) => passResetReq()} />
                                </form>
                                <div className="link_container1">
                                    <p className="small" onClick={() => setResetMode(false)} >Go to Signin</p>
                                </div>
                            </Card>
                        </div>

                    </motion.div>
                    :
                    <motion.div className="container-div"
                        whileInView={{ opacity: [0, 1] }}
                        transition={{ duration: .75, ease: 'easeInOut' }}
                        initial={{ opacity: 0 }}
                    >
                        <div className="overlay">
                            <Card>
                                <Typography variant="h3" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '2rem', marginTop: 0, color: theme.palette.secondary[500] }} >DAPass Vault</Typography>
                                <p className="subtitle">
                                    Please log in using your email and password!
                                </p>
                                <form onSubmit={userLogin}>
                                    <div className="inputs_container">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={passwd}
                                            onChange={(e) => setPasswd(e.target.value)}
                                        />

                                    </div>
                                    <input type="button" value="Log In" className="login_button" onClick={(e) => userLogin()} />
                                </form>
                                <div className="link_container">
                                    <p className="small" onClick={() => setResetMode(true)} >Forgot Password?</p>
                                    <p onClick={() => navigate("/signup")} className="small">
                                        Create an Account
                                    </p>
                                </div>

                            </Card>
                        </div>

                    </motion.div>
            }
        </>

    );
}

export default SignIn;
