import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { passReset } from "../../actions/authActions";
import Card from "components/Card/Card";
import { motion } from 'framer-motion'
import {
    Typography,
    useTheme,
} from "@mui/material";
import { toast } from "react-hot-toast";
import '../signin/signin.css'

const PassReset = () => {
    const { token } = useParams()
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [otp, setOtp] = useState(undefined);
    const [password, setPassword] = useState(undefined);
    const [confirmPassword, setConfirmPassword] = useState(undefined);

    const pwReset = () => {
        if (password === undefined || confirmPassword === undefined) {
            toast.error("Please provide the Passwords...")
        }
        else if (password !== confirmPassword) {
            toast.error("Passwords Mismatch...")
        }
        else {
            const form = {
                password,
                confirmPassword,
                token,
                otp
            }

            dispatch(passReset(form))
            setConfirmPassword(undefined)
            setPassword(undefined)
        }
    }

    return (
        <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: .75, ease: 'easeInOut' }}
            initial={{ opacity: 0 }}
            className="container-div">
            <div className="overlay">
                <Card>
                    <Typography variant="h3" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '2rem', marginTop: 0, color: theme.palette.secondary[500] }} >Password Reset</Typography>
                    <p className="subtitle">
                        Please enter new password and confirmation
                    </p>
                    <form onSubmit={pwReset}>
                        <div className="inputs_container">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <input type="button" value="Reset Password" className="login_button" onClick={(e) => pwReset()} />
                    </form>
                    <div className="link_container">
                        <p onClick={() => navigate("/")}  className="small">
                            Go to Signin
                        </p>
                    </div>
                </Card>
            </div>

        </motion.div>
    );
}

export default PassReset;
