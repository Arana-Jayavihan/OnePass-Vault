import { vaultConsts } from "actions/constants"

const initState = {
    creating: false,
    updatung: false,
    deleteing: false,
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
        case vaultConsts.ADD_USER_VAULT_REQUEST:
            state = {
                ...state,
                creating: true
            }
            break
        case vaultConsts.ADD_USER_VAULT_SUCCESS:
            state = {
                ...state,
                creating: false,
                vaults: action.payload
            }
            break
        case vaultConsts.ADD_USER_VAULT_FAILED:
            state = {
                ...state,
                creating: false
            }
            break
    }

    return state
}

