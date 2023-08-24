import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Redirect = () => {
    const navigate = useNavigate()
    const sessionId = useSelector(state => state.general.sessionId)
    useEffect(() => {
        if (sessionId !== undefined) {
            navigate(`${sessionId}`)
        }
        else
            navigate('/')

    }, [sessionId])
    return (
        null
    )
}

export default Redirect