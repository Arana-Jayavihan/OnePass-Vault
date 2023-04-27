import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import Card from "components/Card/Card";
import {
    Typography,
    useTheme
} from "@mui/material";
import { toast } from "react-hot-toast";
import '../signin/signin.css'
import { motion } from 'framer-motion'
import { genKeys, addData, login } from "actions/authActions";
import CryptoJS from 'crypto-js'
import { encryptRSA, genRSAKeyPair, encryptAES, generateMasterEncryptionKey } from 'encrypt';

const Signup = () => {
    const loading = useSelector(state => state.auth.loading)
    const generating = useSelector(state => state.auth.generating)
    const authenticated = useSelector(state => state.auth.authenticated)

    useEffect(() => {
        if (generating === true) {
            toast.loading('Generating Keys...', {
                id: 'generating'
            })
        }
        else if (generating === false) {
            toast.dismiss('generating')
        }

    }, [generating]);

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

    const [keyGenMode, setKeyGenMode] = useState(true);
    const [email, setEmail] = useState(undefined);
    const [firstName, setFirstName] = useState(undefined);
    const [lastName, setLastName] = useState(undefined);
    const [contact, setContact] = useState(undefined);
    const [password, setPassword] = useState(undefined);
    const [confirmPassword, setConfirmPassword] = useState(undefined);
    const [masterEncKey, setMasterEncKey] = useState(undefined);

    const dispatch = useDispatch()
    const theme = useTheme()
    const navigate = useNavigate()

    const generateKeys = async () => {
        try {
            if (password === confirmPassword) {
                // Generate RSA Key Pair and Encrypt with Password
                const { privExpB64, pubExpB64, keyPair } = await genRSAKeyPair()
                const encPrivate = await encryptAES(privExpB64, password)
                const encPublic = await encryptAES(pubExpB64, password)

                // Generate Master Encryption Key and Encrypt with Password
                const masterEncryptionKey = await generateMasterEncryptionKey(password)
                const encryptedMasterEncKey = await encryptRSA(masterEncryptionKey, keyPair.publicKey)
                setMasterEncKey(masterEncryptionKey)

                const hashEmail = CryptoJS.SHA256(email).toString(CryptoJS.enc.Base64)

                const form = {
                    'email': hashEmail,
                    'encPrivateKey': encPrivate,
                    'encPublicKey': encPublic,
                    'masterEncKey': encryptedMasterEncKey
                }
                dispatch(genKeys(form)).then(result => {
                    if (result) {
                        setKeyGenMode(false)

                    }
                })
            }
            else {
                toast.error("Passwords Mismatch")
            }
        } catch (error) {
            console.log(error)
        }
    }
    const userSignup = async () => {
        if (password === confirmPassword) {
            const encFirstName = await encryptAES(firstName, masterEncKey)
            const encLastName = await encryptAES(lastName, masterEncKey)
            const encContact = await encryptAES(contact, masterEncKey)
            const hashEmail = CryptoJS.SHA256(email).toString(CryptoJS.enc.Base64)
            const hashPassword = CryptoJS.SHA512(password).toString(CryptoJS.enc.Base64)

            const form = {
                'email': hashEmail,
                'firstName': encFirstName,
                'lastName': encLastName,
                'contact': encContact,
                'passwordHash': hashPassword
            }
            dispatch(addData(form)).then(result => {
                if (result) {
                    const form = {
                        'hashEmail': hashEmail,
                        'hashPass': hashPassword
                    }
                    dispatch(login(form, password))
                }
            })
            setEmail(undefined)
            setFirstName(undefined)
            setLastName(undefined)
            setContact(undefined)
            setPassword(undefined)
            setConfirmPassword(undefined)
        }
        else {
            toast.error("Passwords Mismatch")
        }
    }

    const renderKeyGen = () => {
        return (
            <motion.div className="container-div"
                whileInView={{ opacity: [0, 1] }}
                transition={{ duration: .75, ease: 'easeInOut' }}
                initial={{ opacity: 0 }}
            >
                <Card
                    whileInView={{ opacity: [0, 1], y: [100, 0] }}
                    transition={{ duration: .75, ease: 'easeInOut' }}
                    initial={{ opacity: 0, y: 100 }}
                >
                    <Typography variant="h2" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '1.5rem', marginTop: 0, color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >DAPass Vault</Typography>
                    <p className="subtitle">
                        Please enter your email and password
                    </p>
                    <form onSubmit={generateKeys}>
                        <div className="inputs_container">
                            <input
                                placeholder="example@mail.com"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <motion.button
                                className='form-control' 
                                style={{ width: 'fit-content', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                whileHover={{ scale: [1, 1.1] }}
                                onClick={(e) => generateKeys()}
                            >
                                Generate Keys
                            </motion.button>
                        </div>

                    </form>
                    <div className="link_container1">
                        <p onClick={() => navigate("/")} className="small">
                            Go to Signin
                        </p>
                    </div>
                </Card>

            </motion.div>
        )
    }

    const renderAddData = () => {
        //040738
        return (
            <motion.div className="container-div"
                whileInView={{ opacity: [0, 1] }}
                transition={{ duration: .75, ease: 'easeInOut' }}
                initial={{ opacity: 0 }}
            >
                <Card>
                <Typography variant="h2" fontWeight="bold" sx={{ textAlign: 'center', margin: '3rem', marginBottom: '1.5rem', marginTop: 0, color: 'transparent', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >DAPass Vault</Typography>
                    <p className="subtitle">
                        Please fill account details
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
                            <input
                                type="tel"
                                placeholder="Contact"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <motion.button
                                className='form-control' 
                                style={{ width: 'fit-content', margin: '0 10px', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                                whileHover={{ scale: [1, 1.1] }}
                                onClick={(e) => userSignup()}
                            >
                                Sign Up
                            </motion.button>
                        </div>
                    </form>
                    <div className="link_container1">
                        <p onClick={() => navigate("/")} className="small">
                            Go to Signin
                        </p>
                    </div>
                </Card>
            </motion.div>
        )
    }
    if (authenticated) {
        return <Navigate to='/dashboard' />
    }
    return (
        <>
            {
                keyGenMode ? renderKeyGen() : renderAddData()
            }
        </>
    );
}

export default Signup;
