import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import dotenv from "dotenv";
dotenv.config();

let sdk = undefined;
let contract = undefined;
let network = undefined;
let privateKey = undefined;
const contractPass = process.env.CONTRACT_PASS

try {
    privateKey = process.env.PRIVATE_KEY_ONLINE;
    network = Sepolia;

    sdk = ThirdwebSDK.fromPrivateKey(privateKey, network);
    contract = await sdk.getContract(process.env.CONTRACT);
} catch (error) {
    console.log(error);
}

// User Functions
export const validateHashPass = async (email, hashPass) => {
	try {
		const result = await contract.call("validateHashPass", [
			email,
			hashPass,
			contractPass
		])
		return result
	} catch (error) {
		console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
	}
}

export const addUserKeys = async (user) => {
    try {
        const result = await contract.call("addUserKeys", [
            user.email,
            user.encPrivateKey,
            user.encPublicKey,
            user.masterEncKey,
            user.hashPass,
			contractPass
        ]);
        if (result.receipt.confirmations != 0) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const addUserData = async (user) => {
    try {
        const result = await contract.call("addUserData", [
            user.email,
            user.firstName,
            user.lastName,
            user.contact,
            user.passwordHash,
			contractPass
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(user.email, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getUser = async (email) => {
    try {
        const result = await contract.call("getUserData", [
			email,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getAssignVaults = async (email) => {
    try {
        const result = await contract.call("getAssignVaults", [
			email,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getUserHashPass = async (email) => {
    try {
        const result = await contract.call("getUserHashPass", [
			email,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getPrivateKey = async (email, hashPass) => {
    try {
        const result = await contract.call("getPrivateKey", [
			email,
			hashPass,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getPublicKey = async (email) => {
    try {
        const result = await contract.call("getPublicKey", [
			email,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getMasterEncKey = async (email, hashPass) => {
    try {
        const result = await contract.call("getMasterEncKey", [
            email,
            hashPass,
			contractPass
        ]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const addTransactionHash = async (email, txnHash) => {
    try {
        const result = await contract.call("addTxnHash", [
			email,
			txnHash,
			contractPass
		]);
        if (result.receipt.confirmations != 0) {
            console.log("Transaction added to user", result);
        } else {
            console.log("Transaction not added to user", result);
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getUserTransactionHash = async (email) => {
    try {
        const result = await contract.call("getAllTxnHashes", [
			email,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const removeUser = async (email, hashPass) => {
    try {
        const result = await contract.call("removeUser", [
			email,
			hashPass,
			contractPass
		]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(email, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

// Vault Functions
export const createVault = async (
    email,
    vaultName,
    note,
    encVaultKey,
    vaultKeyHash,
    hashPass,
    customFields
) => {
    try {
        const result = await contract.call("createVault", [
            email,
            vaultName,
            note,
            encVaultKey,
            vaultKeyHash,
            hashPass,
			contractPass,
            customFields,
            customFields.length,
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(email, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const updateVault = async (
    vaultIndex,
    ownerEmail,
    hashPass,
    vaultName,
    note
) => {
    try {
        const result = await contract.call("updateVault", [
            vaultIndex,
            ownerEmail,
            hashPass,
			contractPass,
            vaultName,
            note,
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(ownerEmail, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const addVaultUser = async (
    vaultIndex,
    ownerEmail,
    addUserEmail,
    encVaultKey,
    hashPass
) => {
    try {
        const result = await contract.call("addVaultUser", [
            vaultIndex,
            ownerEmail,
            addUserEmail,
            encVaultKey,
            hashPass,
			contractPass
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(ownerEmail, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const removeVaultUser = async (
    email,
    hashPass,
    vaultIndex,
    userIndex
) => {
    try {
        const result = await contract.call("removeVaultUser", [
            email,
            hashPass,
			contractPass,
            vaultIndex,
            userIndex,
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(email, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const removeVault = async (ownerEmail, hashPass, vaultIndex) => {
    try {
        const result = await contract.call("removeVault", [
            ownerEmail,
            hashPass,
			contractPass,
            vaultIndex,
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(ownerEmail, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getUserVaults = async (email) => {
    try {
        const result = await contract.call("getUserVaults", [
			email,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getVault = async (vaultIndex) => {
    try {
        const result = await contract.call("getVault", [
			vaultIndex,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getUserVaultEncKey = async (email, hashPass, vaultIndex) => {
    try {
        const result = await contract.call("getUserEncVaultKey", [
            email,
            hashPass,
			contractPass,
            vaultIndex,
        ]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

// Login Functions
export const addVaultLogin = async (
    email,
    loginName,
    url,
    userName,
    password,
    hashPass,
    vaultIndex,
    customFields
) => {
    try {
        const result = await contract.call("addVaultLogin", [
            email,
            loginName,
            url,
            userName,
            password,
            hashPass,
			contractPass,
            vaultIndex,
            customFields,
            customFields.length,
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(email, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const updateVaultLogin = async (
    loginIndex,
    vaultIndex,
    ownerEmail,
    hashPass,
    loginName,
    url,
    userName,
    password
) => {
    try {
        const result = await contract.call("updateVaultLogin", [
            loginIndex,
            vaultIndex,
            ownerEmail,
            hashPass,
            loginName,
            url,
            userName,
            password,
			contractPass
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(ownerEmail, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const removeVaultLogin = async (
    ownerEmail,
    hashPass,
    vaultIndex,
    loginIndex
) => {
    try {
        const result = await contract.call("removeVaultLogin", [
            ownerEmail,
            hashPass,
            vaultIndex,
            loginIndex,
			contractPass
        ]);
        if (result.receipt.confirmations != 0) {
            addTransactionHash(ownerEmail, result.receipt.transactionHash);
            return result;
        } else if (!result.receipt) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};

export const getAllVaultLogins = async (vaultIndex) => {
    try {
        const result = await contract.call("getAllVaultLogins", [
			vaultIndex,
			contractPass
		]);
        return result;
    } catch (error) {
        console.log(error);
        if (error.reason) {
            return error.reason;
        } else {
            return false;
        }
    }
};
