import { vaultConsts } from "actions/constants"

const initState = {
    loading: false,
    vaults: []
}

export default (state = initState, action) => {
    switch (action.type) {
        case vaultConsts.GET_USER_ASSIGN_VAULTS_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break
        case vaultConsts.GET_USER_ASSIGN_VAULTS_SUCCESS:
            state = {
                ...state,
                loading: false,
                vaults: action.payload
            }
            break
        case vaultConsts.GET_USER_ASSIGN_VAULTS_FAILED:
            state = {
                ...state,
                loading: false
            }
            break
    }

    return state
}

