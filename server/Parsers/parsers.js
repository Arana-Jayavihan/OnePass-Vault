export const assignVaultParser = (vaults) => {
    let vaultArr = []
    for (let i = 0; i < vaults.length; i++) {
        let vaultObj = {}
        vaultObj['vaultIndex'] = parseInt(vaults[i][0]._hex)
        vaultObj['vaultName'] = vaults[i][1]
        vaultObj['desctiption'] = vaults[i][2]
        if(vaults[i][1] !== '' && vaults[i][2] !== '') {
            vaultArr.push(vaultObj)
        }
    }
    return vaultArr
}

export const vaultLoginParser = (logins) => {
    let loginArr = []
    for (let i = 0; i < logins.length; i++) {
        let loginObj = {}
        loginObj['loginIndex'] = parseInt(logins[i][0]._hex)
        loginObj['ownerEmail'] = logins[i][1]
        loginObj['loginName'] = logins[i][2]
        loginObj['loginUrl'] = logins[i][3]
        loginObj['loginUsername'] = logins[i][4]
        loginObj['loginPassword'] = logins[i][5]
        if(logins[i][1] !== '' && logins[i][2] !== '' && logins[i][3] !== '' && logins[i][4] !== '' && logins[i][5] !== '') {
            loginArr.push(loginObj)
        }
    }
    return loginArr
}