import { vaultConsts } from "actions/constants"

const initState = {
    creating: false,
    updating: false,
    deleteing: false,
    accepting: false,
    loading: false,
    adding: false,
    unlocking: false,
    vaultKey: undefined,
    vaults: [],
    vault: {},
    invite: {}
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
        case vaultConsts.UNLOCK_VAULT_REQUEST:
            state = {
                ...state,
                unlocking: true
            }
            break
        case vaultConsts.UNLOCK_VAULT_SUCCESS:
            state = {
                ...state,
                unlocking: false,
                vaultKey: action.payload
            }
            break
        case vaultConsts.UNLOCK_VAULT_FAILED:
            state = {
                ...state,
                unlocking: false
            }
            break
        case vaultConsts.GET_VAULT_DATA_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break
        case vaultConsts.GET_VAULT_DATA_SUCCESS:
            state = {
                ...state,
                loading: false,
                vault: action.payload
            }
            break
        case vaultConsts.GET_VAULT_DATA_FAILED:
            state = {
                ...state,
                loading: false,
                vaultKey: undefined,
            }
            break
        case vaultConsts.LOCK_VAULT_SUCCESS:
            state = {
                ...state,
                vaultKey: undefined,
                vault: {}
            }
            break
        case vaultConsts.LOCK_VAULT_FAILED:
            state = {
                ...state,
                vaultKey: undefined,
                vault: {}
            }
            break
        case vaultConsts.ADD_NEW_VAULT_LOGIN_REQUEST:
            state = {
                ...state,
                adding: true
            }
            break
        case vaultConsts.ADD_NEW_VAULT_LOGIN_SUCCESS:
            state = {
                ...state,
                adding: false,
                vault: {
                    ...state.vault,
                    vaultLogins: action.payload
                }
            }
            break
        case vaultConsts.ADD_NEW_VAULT_LOGIN_FAILED:
            state = {
                ...state,
                adding: false
            }
            break
        case vaultConsts.ADD_VAULT_USER_REQUEST_REQUEST:
            state = {
                ...state,
                adding: true
            }
            break
        case vaultConsts.ADD_VAULT_USER_REQUEST_SUCCESS:
            state = {
                ...state,
                adding: false,
            }
            break
        case vaultConsts.ADD_VAULT_USER_REQUEST_FAILED:
            state = {
                ...state,
                adding: false
            }
            break
        case vaultConsts.GET_VAULT_INVITE_DATA_REQUEST:
            state = {
                ...state,
                loading: true
            }
            break
        case vaultConsts.GET_VAULT_INVITE_DATA_SUCCESS:
            state = {
                ...state,
                loading: false,
                invite: action.payload
            }
            break
        case vaultConsts.GET_VAULT_INVITE_DATA_FAILED:
            state = {
                ...state,
                loading: false,
                invite: {}
            }
            break
        case vaultConsts.VAULT_INVITE_ACCEPT_REQUEST:
            state = {
                ...state,
                accepting: true
            }
            break
        case vaultConsts.VAULT_INVITE_ACCEPT_SUCCESS:
            state = {
                ...state,
                accepting: false
            }
            break
        case vaultConsts.VAULT_INVITE_ACCEPT_FAILED:
            state = {
                ...state,
                accepting: false
            }
            break
    }

    return state
}

