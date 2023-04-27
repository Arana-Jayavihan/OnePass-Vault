import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import dotenv from 'dotenv'

dotenv.config()
let sdk = undefined
let contract = undefined
try {
    sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, Sepolia);
    contract = await sdk.getContract("0xA1BA41aCBc2723a800c40d0E62D05591a176FaE6");
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

export const addTransactionHash = async (email, txnHash) => {
    try {
        const result = await contract.call("addTxnHash", [email, txnHash])
        console.log('Transaction added to user', result)
    } catch (error) {
        console.log(error)
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
    }
}

export const addUserData = async (user) => {
    try {
        const result = await contract.call("addUserData", [user.email, user.firstName, user.lastName, user.contact, user.passwordHash])
        addTransactionHash(user.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getUser = async (email) => {
    try {
        const result = await contract.call("getUserData", [email])
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getUserHashPass = async (email) => {
    try {
        const result = await contract.call("getUserHashPass", [email])
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getPrivateKey = async (email) => {
    try {
        const result = await contract.call("getPrivateKey", [email])
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getPublicKey = async (email) => {
    try {
        const result = await contract.call("getPublicKey", [email])
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getMasterEncKEy = async (email) => {
    try {
        const result = await contract.call("getMasterEncKEy", [email])
        return result
    } catch (error) {
        console.log(error)
    }
}

export const removeUser = async (email) => {
    try {
        const result = await contract.call("removeUser", [email])
        addTransactionHash(user.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

// Vault Functions
export const createVault = async (vault) => {
    try {
        const result = await contract.call("createVault", [vault.email, vault.name, vault.note, vault.vaultKeyHash])
        addTransactionHash(vault.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getVaults = async (email) => {
    try {
        const result = await contract.call("getVaults", [email])
        return result
    } catch (error) {
        console.log(error)
    }
}

export const updateVault = async (vault) => {
    try {
        const result = await contract.call("updateVault", [vault.email, vault.index, vault.name, vault.note])
        addTransactionHash(vault.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const addVaultKeyHash = async (vault) => {
    try {
        const result = await contract.call("addVaultKeyHash", [vault.email, vault.vaultKeyHash, vault.index])
        addTransactionHash(vault.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const removeVault = async (vault) => {
    try {
        const result = await contract.call("removeVault", [vault.email, vault.index])
        addTransactionHash(vault.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

// Login Functions
export const addVaultLogin = async (login) => {
    try {
        const result = await contract.call("addVaultLogin", [login.email, login.name, login.website, login.userName, login.password, login.vaultIndex])
        addTransactionHash(login.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const updateVaultLogin = async (login) => {
    try {
        const result = await contract.call("updateVaultLogin", [login.vaultIndex, login.loginIndex, login.email, login.name, login.website, login.userName, login.password])
        addTransactionHash(login.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getAllVaultLogins = async (login) => {
    try {
        const result = await contract.call("getAllVaultLogins", [login.vaultIndex, login.loginIndex, login.email])
        return result
    } catch (error) {
        console.log(error)
    }
}

export const removeUserLogin = async (data) => {
    try {
        const result = await contract.call("removeUserLogin", [data.email, data.vaultIndex])
        addTransactionHash(data.email, result.receipt.transactionHash)
        return result
    } catch (error) {
        console.log(error)
    }
}