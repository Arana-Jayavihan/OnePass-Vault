import { useDispatch, useSelector } from 'react-redux'
import { keyExchange } from "./actions/authActions"
import { useCallback, useEffect, useState  } from 'react'

const WebSessionHandler = (props) => {
    const dispatch = useDispatch()
    const triggered = useSelector(state => state.general.keyExTriggered)
    const [count, setCount] = useState(0);
    const [render, setRender] = useState(false);
    const keyEx = useCallback(async () => {
        dispatch(keyExchange()).then((result) => {
            if (result){
                setCount(count + 1)
            }
        })
    })
    useEffect(() => {
        if (!triggered && count === 0){
            keyEx()
        }
    })
    useEffect(() => {
        if (triggered){
            setRender(true)
        }
    }, [triggered])
    if (render){
        return props.app
    }
}

export default WebSessionHandler