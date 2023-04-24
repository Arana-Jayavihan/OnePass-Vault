import React, { useEffect, useState } from 'react';
import { JSEncrypt } from 'jsencrypt'
import CryptoJS from 'crypto-js'
import sh from 'shortid'
import { toast } from 'react-hot-toast'
import { genRSAKeyPair, byteArrayToB64, b64ToByteArray, encryptRSA, decryptRSA, encryptAES, decryptAES, importRSAPrivKey } from 'encrypt';

const Test = () => {
    const [password, setPassword] = useState(undefined);

    const signup = async () => {
        // const crypto = new JSEncrypt({ default_key_size: 2048 })
        // const publicKey =  crypto.getPublicKey()
        // const privateKey = crypto.getPrivateKey()
        // console.log(privateKey)


        // const encPrivate = CryptoJS.AES.encrypt(privateKey, CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64), {
        //     iv: CryptoJS.SHA256(sh.generate()).toString(),
        //     mode: CryptoJS.mode.CBC,
        //     padding: CryptoJS.pad.Pkcs7
        // })
        // console.log(encPrivate.toString(), 'encPriv')
        // const encPublic = CryptoJS.AES.encrypt(publicKey, CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64), {
        //     iv: CryptoJS.SHA256(sh.generate()).toString(),
        //     mode: CryptoJS.mode.CBC,
        //     padding: CryptoJS.pad.Pkcs7
        // })
        // console.log(encPublic.toString(), 'encPub')

        // const decPrivate = CryptoJS.AES.decrypt(encPrivate, CryptoJS.SHA256(password).toString(CryptoJS.enc.Base64))
        // // console.log(decPrivate.toString(CryptoJS.enc.Utf8), 'decPriv')
        // console.log(publicKey)

        // crypto.setPublicKey(publicKey)
        // const encMsg = crypto.encrypt('hello')
        // console.log(encMsg)

        // const decrypt = new JSEncrypt()
        // decrypt.setPrivateKey(decPrivate.toString(CryptoJS.enc.Utf8))
        // console.log(keyPair.privateKey)

        // console.log(pubExpB64, privExpB64)

        // const decMsg = decrypt.decrypt(encMsg)
        // console.log(decMsg)

        // const byteArrayToB64 = (byteArray) => {
        //     return window.btoa(String.fromCharCode.apply(null, new Uint8Array(byteArray)))
        // }

        // const b64ToByteArray = (b64EncStr) => {
        //     const str = window.atob(b64EncStr)
        //     const buf = new ArrayBuffer(str.length);
        //     const bufView = new Uint8Array(buf);
        //     for (let i = 0, strLen = str.length; i < strLen; i++) {
        //         bufView[i] = str.charCodeAt(i);
        //     }
        //     return buf;
        // }

        // const encryptRSA = async (plainText, publicKey) => {
        //     const encoder = new TextEncoder()
        //     const encodedPlainText = encoder.encode(plainText)

        //     const encryptedByteArray = await window.crypto.subtle.encrypt(
        //         {
        //             name: "RSA-OAEP",
        //         },
        //         publicKey,
        //         encodedPlainText
        //     )
        //     return byteArrayToB64(encryptedByteArray)
        // }

        // const decryptRSA = async (cipherText, privateKey) => {
        //     const decoder = new TextDecoder()
        //     const byteArray = b64ToByteArray(cipherText)
        //     const decryptedByteArray = await window.crypto.subtle.decrypt(
        //         {
        //             name: "RSA-OAEP",
        //         },
        //         privateKey,
        //         byteArray
        //     )
        //     const decodedPlainText = decoder.decode(decryptedByteArray)
        //     return decodedPlainText
        // }

        const generateKeys = async () => {
            const keyPair = await genRSAKeyPair()
            const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
            const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey)
            const privExpB64 = byteArrayToB64(privateKey)
            const pubExpB64 = byteArrayToB64(publicKey)

            const encPrivate = (await encryptAES(privExpB64, password)).toString()
            console.log(encPrivate)

            const encPublic = await encryptAES(pubExpB64, password)

            const decPrivate = await decryptAES(encPrivate, password)

            const importedPrivKey = await importRSAPrivKey(decPrivate.toString(CryptoJS.enc.Utf8))

            const msg = "thatlongpassword"

            const encryptedMsg = await encryptRSA(msg, keyPair.publicKey)
            console.log(encryptedMsg)

            const decryptedMsg = await decryptRSA(encryptedMsg, importedPrivKey)
            console.log(decryptedMsg)

            // const enc = new TextEncoder()
            // const encodedMsg = enc.encode(msg)
            // const encMsg = await window.crypto.subtle.encrypt(
            //     {
            //         name: "RSA-OAEP",
            //     },
            //     keyPair.publicKey,
            //     encodedMsg
            // )
            // console.log(byteArrayToB64(encMsg))

            // const decMsg = await window.crypto.subtle.decrypt(
            //     {
            //         name: "RSA-OAEP",
            //     },
            //     importedPrivKey,
            //     encMsg
            // )
            // const dec = new TextDecoder()
            // const decodedMsg = dec.decode(decMsg)
            // console.log(decodedMsg)
        }

        toast.promise(
            generateKeys(),
            {
                loading: "Generating RSA Public Key",
                success: (data) => 'Keys Generated',
                error: (error) => console.log(error)
            }
        )


    }
    return (
        <>
            test
            <input type='type' value={password} onChange={(e) => setPassword(e.target.value)} />
            <button value="Submit" onClick={() => signup()}>Submit</button>
        </>
    );
}

export default Test;
