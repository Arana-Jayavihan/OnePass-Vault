import { useDispatch, useSelector } from 'react-redux'
import { keyExchange } from "./actions/authActions"
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const WebSessionHandler = (props) => {
    const dispatch = useDispatch()
    const triggered = useSelector(state => state.general.keyExTriggered)
    const [count, setCount] = useState(0);
    const [render, setRender] = useState(false);
    const navigate = useNavigate()
    const sessionId = useSelector(state => state.general.sessionId)
    const loading = useSelector(state => state.general.loading)
    const keyEx = useCallback(async () => {
        dispatch(keyExchange()).then((result) => {
            if (result) {
                setCount(count + 1)
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

    useEffect(() => {
        if ( loading === false && render && sessionId !== null && sessionId !== undefined) {
            navigate(`${sessionId}`)
        }
    }, [sessionId, loading])
    if (render) {
        return props.app
    }
}

export default WebSessionHandler