import { Sepolia } from "@thirdweb-dev/chains";
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import dotenv from 'dotenv'
import CryptoJS from "crypto-js";

dotenv.config()

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, Sepolia);
const contract = await sdk.getContract("0xef256eE0FD34fbA949A1F3aab64D5FFc3F1C4cd6");

export const createContract = async (req, res) => {

    const result = await contract.call("BlockchainPassword")

    console.log(result)
    if (result.receipt.confirmations != 0) {
        res.status(201).json({
            message: 'Blockchain account connected'
        })
    }
    else {
        res.status(500).json({
            message: 'Connection failed',
            error: result
        })
    }
}

const getAllUserAccs = async (email) => {
    try {
        const result = await contract.call("getAllUserLogins", [email])
        let resultArray = []

        if (result) {
            console.log(result[1][0])
            const hashPass = getUserHashPass(email)
            const key = `${process.env.AES_SECRET}${hashPass}`
            for (let i = 0; i < result[1].length; i++) {
                let loginObj = {
                    'index': '',
                    'name': '',
                    'website': '',
                    'userName': '',
                    'password': ''
                }
                for (let j = 0; j < result[1][i].length; j++) {
                    if (result[1][i][j] !== '') {
                        if(j === 0){
                            loginObj['index'] = result[1][i][j]
                        }
                        else if (j === 1) {
                            loginObj['name'] = CryptoJS.AES.decrypt(result[1][i][j], key).toString(CryptoJS.enc.Utf8)
                        }
                        else if (j === 2) {
                            loginObj['website'] = CryptoJS.AES.decrypt(result[1][i][j], key).toString(CryptoJS.enc.Utf8)
                        }
                        else if (j === 3) {
                            loginObj['userName'] = CryptoJS.AES.decrypt(result[1][i][j], key).toString(CryptoJS.enc.Utf8)
                        }
                        else if (j === 4) {
                            loginObj['password'] = CryptoJS.AES.decrypt(result[1][i][j], key).toString(CryptoJS.enc.Utf8)
                        }
                    }
                    else {
                        continue
                    }

                }
                if (loginObj.name !== '' || loginObj.website !== '' || loginObj.userName !== '' || loginObj.password !== '') {
                    resultArray.push(loginObj)
                }
            }
            console.log(resultArray)
            return resultArray
        }
    } catch (error) {
        console.log(error)
    }
}

export const getUserHashPass = async (email) => {
    try {
        const result = await contract.call("getUserHashPass", [email])

        if (result) {
            return result
        }
    } catch (error) {
        console.log(error)
    }
}

export const addLogin = async (req, res) => {
    try {
        const user = req.user
        const data = req.body
        console.log(user, data)
        if (data.email === user.email) {
            const hashPass = getUserHashPass(user.email)
            const key = `${process.env.AES_SECRET}${hashPass}`
            const encName = CryptoJS.AES.encrypt(data.name.toString(CryptoJS.enc.Utf8), key).toString()
            const encWebsite = CryptoJS.AES.encrypt(data.website.toString(CryptoJS.enc.Utf8), key).toString()
            const encUserName = CryptoJS.AES.encrypt(data.userName.toString(CryptoJS.enc.Utf8), key).toString()
            const encPassword = CryptoJS.AES.encrypt(data.password.toString(CryptoJS.enc.Utf8), key).toString()
            console.log(encName, encUserName, encPassword)

            const result = await contract.call("addUserLogin", [user.email, encName, encWebsite, encUserName, encPassword])
            console.log(result)
            if (result.receipt.confirmations != 0) {
                const resultArray = await getAllUserAccs(user.email)
                res.status(201).json({
                    message: 'New Login data addded',
                    payload: resultArray
                })
            }
            else {
                res.status(500).json({
                    message: 'something went wrong',
                    error: result
                })
            }
        }
        else {
            res.status(401).json({
                message: 'Modified Request Unauthorized...'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Something went wrong...',
            error: error
        })
    }
}

export const getAllUserLogins = async (req, res) => {
    try {
        const data = req.body
        const user = req.user
        if (data.email === user.email) {
            const resultArray = await getAllUserAccs(user.email)
            res.status(200).json({
                message: 'User Logins Fetch Success',
                payload: resultArray
            })
        }
        else {
            res.status(401).json({
                message: 'Modified Request Unauthorized...'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Something went wrong...',
            error: error
        })
    }
}