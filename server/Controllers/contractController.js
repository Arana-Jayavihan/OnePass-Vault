import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import dotenv from 'dotenv'

dotenv.config()
let sdk = undefined
let contract = undefined
try {
    sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, Sepolia);
    contract = await sdk.getContract("0x4d09Df7E9fcc25194549fe56869281842D34A097");
} catch (error) {
    console.log(error)
}

export const InitiateContract = async (req, res) => {

    const result = await contract.call("InitiateContract", [process.env.AES_SECRET])

    console.log(result)
    if (result.receipt.confirmations != 0) {
        res.status(201).json({
            message: 'Contract Initiated'
        })
    }
    else {
        res.status(500).json({
            message: 'Contract Initialization Failed',
            error: result
        })
    }
}

// User Functions
export const addUserKeys = async (user) => {
    try {
        const result = await contract.call("addUserKeys", [user.email, user.encPrivateKey, user.encPublicKey, user.masterEncKey])
        addTransactionHash(user.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const addUserData = async (user) => {
    try {
        const result = await contract.call("addUserData", [user.email, user.firstName, user.lastName, user.contact, user.passwordHash])
        addTransactionHash(user.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getUser = async (email) => {
    try {
        const result = await contract.call("getUserData", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getAssignVaults = async (email) => {
    try {
        const result = await contract.call("getAssignVaults", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getUserHashPass = async (email) => {
    try {
        const result = await contract.call("getUserHashPass", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getPrivateKey = async (email) => {
    try {
        const result = await contract.call("getPrivateKey", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getPublicKey = async (email) => {
    try {
        const result = await contract.call("getPublicKey", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getMasterEncKey = async (email) => {
    try {
        const result = await contract.call("getMasterEncKey", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const addTransactionHash = async (email, txnHash) => {
    try {
        const result = await contract.call("addTxnHash", [email, txnHash])
        console.log('Transaction added to user', result)
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getUserTransactionHash = async (email) => {
    try {
        const result = await contract.call("getAllTxnHashes", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const removeUser = async (email) => {
    try {
        const result = await contract.call("removeUser", [email])
        addTransactionHash(user.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

// Vault Functions
export const createVault = async (email, vaultName, note, encVaultKey, vaultKeyHash) => {
    try {
        const result = await contract.call("createVault", [email, vaultName, note, encVaultKey, vaultKeyHash])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const updateVault = async (vaultIndex, ownerEmail, vaultName, note) => {
    try {
        const result = await contract.call("updateVault", [vaultIndex, ownerEmail, vaultName, note])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const addVaultUser = async (vaultIndex, ownerEmail, addUserEmail, encVaultKey) => {
    try {
        const result = await contract.call("addVaultUser", [vaultIndex, ownerEmail, addUserEmail, encVaultKey])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const removeVaultUser = async (email, vaultIndex, userIndex) => {
    try {
        const result = await contract.call("removeVaultUser", [email, vaultIndex, userIndex])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const removeVault = async (ownerEmail, vaultIndex) => {
    try {
        const result = await contract.call("removeVault", [ownerEmail, vaultIndex])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getUserVaults = async (email) => {
    try {
        const result = await contract.call("getUserVaults", [email])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getVault = async (vaultIndex) => {
    try {
        const result = await contract.call("getVault", [vaultIndex])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getVaultHash = async (vaultIndex) => {
    try {
        const result = await contract.call("getVaultKeyHash", [vaultIndex])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const getUserVaultEncKey = async (vaultIndex, email) => {
    try {
        const result = await contract.call("getUserEncVaultKey", [email, vaultIndex])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

// Login Functions
export const addVaultLogin = async (email, loginName, url, userName, password, vaultIndex) => {
    try {
        const result = await contract.call("addVaultLogin", [email, loginName, url, userName, password, vaultIndex])
        return result
    } catch (c) {
        
    }
}

export const updateVaultLogin = async (loginIndex, vaultIndex, ownerEmail, loginName, url, userName, password) => {
    try {
        const result = await contract.call("updateVaultLogin", [loginIndex, vaultIndex, ownerEmail, loginName, url, userName, password])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}

export const removeVaultLogin = async (ownerEmail, vaultIndex, loginIndex) => {
    try {
        const result = await contract.call("removeVaultLogin", [ownerEmail, vaultIndex, loginIndex])
        return result
    } catch (error) {
        console.log(error)
        return false
    }
}