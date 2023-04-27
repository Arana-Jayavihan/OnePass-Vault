// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract DAPass {
    address private owner;
    string private contractHash;

    struct User {
        string fName;
        string lName;
        string contact;
        string email;
        string hashPassPhrase;
        string encPrivateKey;
        string publicKey;
        string masterEncKey;
        string[] transactionHashes;
    }

    struct VaultUser {
        bool isOwner;
        uint256 index;
        string email;
        string encVaultPass;
    }

    struct Vault {
        uint256 index;
        string name;
        string note;
        string owner;
        uint256 numLogins;
        uint256 numUsers;
        string vaultKeyHash;
        VaultUser[] vaultUsers;
        Login[] logins;
    }

    struct Login {
        uint256 index;
        string owner;
        string name;
        string website;
        string userName;
        string password;
    }

    struct TxnHash {
        string tHash;
    }

    uint256 private numTxnHashes = 0;
    uint256 private vaultCount = 0;
    mapping(uint256 => TxnHash) private txnHashes;
    mapping(string => Login) private vaultLogins;
    mapping(string => User) private users;
    mapping(string => VaultUser) private vaultUsers;
    Vault[] private vaults;

    //Constructor
    function InitiateContract(string memory contHash) public {
        owner = msg.sender;
        contractHash = contHash;
    }

    // Require Owner
    function requireOwner() private view {
        require(msg.sender == owner, "You are not the user");
    }

    // Compare Strings
    function compareStrings(
        string memory str1,
        string memory str2
    ) public pure returns (bool success) {
        if (bytes(str1).length != bytes(str2).length) {
            return false;
        }
        return
            keccak256(abi.encodePacked(str1)) ==
            keccak256(abi.encodePacked(str2));
    }

    // User Functions
    function addUserKeys(
        string memory email,
        string memory encPrivateKey,
        string memory publicKey,
        string memory masterEncKey
    ) public returns (bool success) {
        requireOwner();

        users[email].email = email;
        users[email].encPrivateKey = encPrivateKey;
        users[email].publicKey = publicKey;
        users[email].masterEncKey = masterEncKey;
        return true;
    }

    function addUserData(
        string memory email,
        string memory fName,
        string memory lName,
        string memory contact,
        string memory hashPassPhrase
    ) public returns (bool success) {
        requireOwner();

        users[email].fName = fName;
        users[email].lName = lName;
        users[email].contact = contact;
        users[email].hashPassPhrase = hashPassPhrase;

        return true;
    }

    function addTxnHash(
        string memory email,
        string memory txnHash
    ) public returns (bool success) {
        requireOwner();

        users[email].transactionHashes.push(txnHash);
        return true;
    }

    function getAllTxnHashes(
        string memory _email
    ) public view returns (string memory email, string[] memory) {
        return (users[_email].email, users[_email].transactionHashes);
    }

    function getPrivateKey(
        string memory email
    ) public view returns (string memory encPrivateKey) {
        return users[email].encPrivateKey;
    }

    function getPublicKey(
        string memory email
    ) public view returns (string memory publicKey) {
        return users[email].publicKey;
    }

    function getMasterEncKey(
        string memory email
    ) public view returns (string memory masterEncKey) {
        return users[email].masterEncKey;
    }

    function getUserData(
        string memory _email
    )
        public
        view
        returns (
            string memory email,
            string memory fName,
            string memory lName,
            string memory contact
        )
    {
        return (
            users[_email].email,
            users[_email].fName,
            users[_email].lName,
            users[_email].contact
        );
    }

    function removeUser(string memory email) public returns (bool success) {
        requireOwner();
        delete users[email];
        return true;
    }

    function getUserHashPass(
        string memory email
    ) public view returns (string memory hashPassPhrase) {
        return users[email].hashPassPhrase;
    }

    // Vault Functions
    function getVault(uint256 index) public view returns (Vault memory) {
        return vaults[index];
    }

    function getVaults() public view returns (Vault[] memory) {
        return vaults;
    }

    function createVault(
        uint256 index,
        string memory email,
        string memory name,
        string memory note,
        string memory encVaultKey,
        string memory vaultKeyHash
    ) public returns (bool sucess) {
        requireOwner();

        vaults[index].index = index;
        vaults[index].name = name;
        vaults[index].note = note;
        vaults[index].owner = email;
        vaults[index].numLogins = 0;
        vaults[index].vaultKeyHash = vaultKeyHash;

        VaultUser memory user;
        user.email = email;
        user.isOwner = true;
        user.encVaultPass = encVaultKey;
        user.index = vaults[index].numUsers;

        vaults[index].vaultUsers.push(user);
        vaults[index].numUsers++;

        delete user;
        return true;
    }

    function updateVault(
        string memory userEmail,
        uint256 index,
        string memory name,
        string memory note
    ) public returns (bool success) {
        requireOwner();
        if (compareStrings(userEmail, vaults[index].owner)) {
            vaults[index].name = name;
            vaults[index].note = note;
            return true;
        }
        return false;
    }

    function addVaultUser(
        uint256 index,
        string memory userEmail,
        string memory addUserEmail,
        string memory encVaultKey
    ) public returns (bool success) {
        requireOwner();
        if (compareStrings(userEmail, vaults[index].owner)) {
            VaultUser storage user = vaultUsers[addUserEmail];
            user.email = addUserEmail;
            user.isOwner = false;
            user.encVaultPass = encVaultKey;
            user.index =  vaults[index].numUsers;

            vaults[index].vaultUsers.push(user);
            vaults[index].numUsers++;
            return true;
        } else {
            return false;
        }
    }

    function removeUserVault(
        string memory email,
        uint256 index,
        uint256 userIndex

    ) public returns (bool success){
        if (compareStrings(email, vaults[index].owner)){
            delete vaults[index].vaultUsers[userIndex];
        }
        return false;
    }

    function removeVault(
        string memory userEmail,
        uint256 index
    ) public returns (bool success) {
        requireOwner();
        if (compareStrings(userEmail, vaults[index].owner)) {
            delete vaults[index];
            vaultCount--;
            return true;
        }
        return false;
    }

    // Login Functions
    function addVaultLogin(
        string memory email,
        string memory name,
        string memory website,
        string memory userName,
        string memory password,
        string memory loginId,
        uint256 index
    ) public returns (bool success) {
        requireOwner();
        Login storage login = vaultLogins[loginId];

        login.owner = email;
        login.name = name;
        login.website = website;
        login.userName = userName;
        login.password = password;
        login.index = index;

        vaults[index].logins.push(login);
        vaults[index].numLogins++;
        delete vaultLogins[loginId];
        return true;
    }

    function getAllVaultLogins(
        uint256 index
    ) public view returns (Login[] memory) {
        return vaults[index].logins;
    }

    function updateVaultLogin(
        uint256 index,
        uint256 loginId,
        string memory email,
        string memory name,
        string memory website,
        string memory userName,
        string memory password
    ) public returns (bool success) {
        requireOwner();
        if (compareStrings(email, vaults[index].logins[loginId].owner)) {
            vaults[index].logins[loginId].name = name;
            vaults[index].logins[loginId].website = website;
            vaults[index].logins[loginId].userName = userName;
            vaults[index].logins[loginId].password = password;
            return true;
        }
        return false;
    }

    function removeVaultLogin(
        string memory email,
        uint256 index,
        uint256 loginId
    ) public returns (bool success) {
        requireOwner();
        if (compareStrings(email, vaults[index].logins[loginId].owner)) {
            delete vaults[index].logins[loginId];
            vaults[index].numLogins--;

            return true;
        }
        return false;
    }

    function getOwner() public view returns (address ownerAddress) {
        return owner;
    }
}
