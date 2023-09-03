import { Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Redirect = () => {
    const navigate = useNavigate()
    useEffect(() => {
        const redirectTimeOut = setTimeout(() => {
            navigate('/')
            
        }, 3000)
        return clearTimeout(redirectTimeOut)
    }, [])
    return (
        <>
            <Typography varient='h1' >
                Oops bad URL!
            </Typography>
        </>
    )
}

export default Redirect