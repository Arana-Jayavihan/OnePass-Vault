import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { Typography, useTheme, IconButton } from "@mui/material";
import { toast } from "react-hot-toast";
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai'
import { motion } from 'framer-motion'
import CryptoJS from "crypto-js";

import './signin.css'
import Card from "../../components/Card/Card";
import { passResetRequest, login, signInReq } from "../../actions/authActions";
import { generateHighEntropyKey } from "../../helpers/encrypt";

const SignIn = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [resetMode, setResetMode] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const authenticated = useSelector(state => state.auth.authenticated)
    const hashPass = useSelector(state => state.auth.hashPass)

    const userLoginReq = async () => {
        if (email === '' || email === undefined) {
            toast.error("Please provide an Email...")
        }
        else {
            const form = {
                'email': email
            }
            dispatch(signInReq(form)).then(result => {
                if (result) {
                    setEmailVerified(true)
                }
            })
        }
    }

    const userLogin = async () => {
        if (password === '' || password === undefined) {
            toast.error("Please enter your password")
        }
        else {
            try {
                const derivedHighEntropyPassword = await generateHighEntropyKey(password)
                const passwordHash = CryptoJS.SHA512(derivedHighEntropyPassword).toString(CryptoJS.enc.Base64)
                const passwordHashAlt = CryptoJS.SHA256(derivedHighEntropyPassword).toString(CryptoJS.enc.Base64)
                if (passwordHash === hashPass) {
                    const form = {
                        'hashEmail': email,
                        'hashPass': passwordHash,
                        'hashPassAlt': passwordHashAlt
                    }
                    dispatch(login(form, password)).then(result => {
                        if (result === false) {
                            setEmailVerified(false)
                        }
                    })
                    setEmail('')
                    setPassword('')
                }
                else {
                    toast.error("Invalid Password...")
                    setPassword('')
                }
            } catch (error) {
                console.log(error)
            }
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
    const [showPassword, setShowPassword] = useState(false);
    const [passType, setPassType] = useState('password');
    const showPasswords = () => {
        if (passType === 'password') {
            setPassType('text')
            setShowPassword(true)
        }
        else {
            setPassType('password')
            setShowPassword(false)
        }
    }

    if (authenticated) {
        return <Navigate to={`/vaults`} />
    }

    const renderSignin = () => {
        return (
            <>
                {
                    emailVerified ?
                        <motion.div className="container-div"
                            whileInView={{ opacity: [0, 1] }}
                            transition={{ duration: .75, ease: 'easeInOut' }}
                            initial={{ opacity: 0 }}
                        >
                            <div className="overlay">
                                <Card>
                                    <Typography variant="h2" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '1.5rem', marginTop: 0, color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >OnePass Vault</Typography>
                                    <p className="subtitle">
                                        Please enter your password
                                    </p>
                                    <div className="inputs_container1">
                                        <input
                                            type={passType}
                                            placeholder="Password"
                                            value={password}
                                            autoFocus
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <IconButton sx={{ width: 'fit-content', height: 'fit-content' }} tabIndex='-1' onClick={() => showPasswords()} >
                                            {
                                                showPassword ?
                                                    <AiFillEye style={{ fontSize: '25px', color: theme.palette.secondary[400] }} />
                                                    :
                                                    <AiFillEyeInvisible style={{ fontSize: '25px', color: theme.palette.secondary[400] }} />
                                            }
                                        </IconButton>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <motion.button
                                            className='form-control' style={{ padding: '.5rem 2rem', width: 'fit-content', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                            whileHover={{ scale: [1, 1.1] }}
                                            onClick={(e) => userLogin()}
                                        >
                                            Sign In
                                        </motion.button>
                                    </div>
                                    <div className="link_container">
                                        <p className="small" onClick={() => setResetMode(true)} >Forgot Password?</p>
                                        <p onClick={() => navigate(`/signup`)} className="small">
                                            Create an Account
                                        </p>
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
                                    <Typography variant="h2" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '1.5rem', marginTop: 0, color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >OnePass Vault</Typography>
                                    <p className="subtitle">
                                        Please enter your email to continue
                                    </p>
                                    <div className="inputs_container">
                                        <input
                                            type="email"
                                            placeholder="example@mail.com"
                                            autoFocus
                                            autoComplete="on"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <motion.button
                                            className='form-control' style={{ padding: '.5rem 2rem', width: 'fit-content', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                            whileHover={{ scale: [1, 1.1] }}
                                            onClick={(e) => userLoginReq()}
                                        >
                                            Verify
                                        </motion.button>
                                    </div>
                                    <div className="link_container1">
                                        <p onClick={() => navigate(`/signup`)} className="small">
                                            Create an Account
                                        </p>
                                    </div>

                                </Card>
                            </div>

                        </motion.div>
                }
            </>
        )
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
                                <Typography variant="h2" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '1.5rem', marginTop: 0, color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >Request Password Reset</Typography>
                                <p className="subtitle">
                                    You will recieve an email continue from there
                                </p>
                                <form onSubmit={userLogin}>
                                    <div className="inputs_container">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            autoFocus
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                        <motion.button
                                            className='form-control' style={{ padding: '.5rem 2rem', width: 'fit-content', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                            whileHover={{ scale: [1, 1.1] }}
                                            onClick={(e) => passResetReq()}
                                        >
                                            Request
                                        </motion.button>
                                    </div>
                                </form>
                                <div className="link_container1">
                                    <p className="small" onClick={() => setResetMode(false)} >Go to Signin</p>
                                </div>
                            </Card>
                        </div>

                    </motion.div>
                    :
                    renderSignin()
            }
        </>

    );
}

export default SignIn;
