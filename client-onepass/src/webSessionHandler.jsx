import { useDispatch, useSelector } from 'react-redux'
import { keyExchange, resetSessions } from "./actions/authActions"
import { useCallback, useEffect, useState } from 'react'
import { Typography, useMediaQuery } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const WebSessionHandler = (props) => {
    const dispatch = useDispatch()
    const triggered = useSelector(state => state.general.keyExTriggered)
    const logged = useSelector(state => state.general.logged)
    const [count, setCount] = useState(0);
    const [render, setRender] = useState(false);
    const navigate = useNavigate()
    const isNonMobile = useMediaQuery("(min-width: 600px)");
    const keyEx = useCallback(async () => {
        dispatch(keyExchange()).then((result) => {
            if (result) {
                setCount(count + 1)
            }
        })
    })

    const reset = useCallback(async () => {
        dispatch(resetSessions()).then((result) => {
            if (result) {
                navigate('/')
            }
        })
    })
    useEffect(() => {
        if (!triggered && count === 0) {
            keyEx()
        }
    })
    useEffect(() => {
        if (triggered) {
            setRender(true)
        }
    }, [triggered])

    if (render) {
        return props.app
    }
    if (logged) {
        return (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', height: "100%", width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#111111' }}>
                    <Typography variant={isNonMobile ? 'h1' : 'h4'} fontWeight="bold" sx={{ textAlign: 'center', color: 'transparent', width: 'fit-content', backgroundImage: 'linear-gradient(to right, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat' }} >
                        Already Logged In
                    </Typography>
                    <Typography sx={{ color: '#fff', margin: '1rem' }}>
                        Please close other tabs reset.
                    </Typography>
                    <motion.button
                        className='form-control' style={{ width: 'auto', margin: '1rem 1rem', backgroundImage: 'linear-gradient(to left, #cc00ee , #6d4aff)', backgroundSize: '100%', backgroundClip: 'text', backgroundRepeat: 'repeat', border: 'none', color: '#fff' }}
                        whileHover={{ scale: [1, 1.1] }}
                        onClick={() => reset()}
                    >
                        Reset Session
                    </motion.button>
                </div>

            </>
        )
    }
}

export default WebSessionHandler