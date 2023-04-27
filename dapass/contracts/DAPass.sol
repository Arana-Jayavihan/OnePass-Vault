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
        uint256 numVaults;
        UserVault[] vaults;
        string[] transactionHashes;
    }

    struct UserVault {
        string id;
        string ownership;
        string encVaultKey;
    }

    struct Vault {
        string id;
        string name;
        string note;
        uint256 numLogins;
        string vaultKeyHash;
        Login[] logins;
    }

    struct Login {
        uint256 index;
        string name;
        string website;
        string userName;
        string password;
    }

    struct TxnHash {
        string tHash;
    }

    mapping(uint256 => TxnHash) private txnHashes;
    uint256 private numTxnHashes = 0;
    mapping(string => Login) private vaultLogins;
    mapping(string => User) private users;
    mapping(string => Vault) private vaults;
    mapping(string => UserVault) private userVaults;

    //Constructor
    function InitiateContract(string memory contHash) public {
        owner = msg.sender;
        contractHash = contHash;
    }

    // Require Owner
    function requireOwner() private view {
        require(msg.sender == owner, "You are not the user");
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
        users[email].numVaults = 0;
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

    function getMasterEncKEy(
        string memory email
    ) public view returns (string memory masterEncKey) {

        return users[email].masterEncKey;
    }

    function getUserData(
        string memory _email
    ) public view returns (
            string memory email,
            string memory fName,
            string memory lName,
            string memory contact
        )
    {
        return (users[_email].email, users[_email].fName, users[_email].lName, users[_email].contact);
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
    function createVault(
        string memory id,
        string memory email,
        string memory name,
        string memory note,
        string memory encVaultKey,
        string memory vaultKeyHash
    ) public returns (bool sucess) {
        requireOwner();

        userVaults[id].id = id;
        userVaults[id].ownership = 'owner';
        userVaults[id].encVaultKey = encVaultKey;

        vaults[id].id = id;
        vaults[id].name = name;
        vaults[id].note = note;
        vaults[id].numLogins = 0;
        vaults[id].vaultKeyHash = vaultKeyHash;

        users[email].vaults.push(userVaults[id]);
        delete userVaults[id];

        users[email].numVaults++;
        return true;
    }

    function getVaults(
        string memory email
    ) public view returns (Vault[] memory) {
        requireOwner();
        
        return();
    }

    // function updateVault(
    //     string memory email,
    //     uint256 index,
    //     string memory name,
    //     string memory note
    // ) public returns (bool success) {
    //     requireOwner();

    //     User storage user = users[email];

    //     user.vaults[index].name = name;
    //     user.vaults[index].note = note;
    //     return true;
    // }

    // function addVaultKeyHash(
    //     string memory email,
    //     string memory vaultKeyHash,
    //     uint256 index
    // ) public returns (bool success) {
    //     requireOwner();

    //     User storage user = users[email];

    //     user.vaults[index].vaultKeyHashes.push(vaultKeyHash);
    //     return true;
    // }

    // function removeVault(
    //     string memory email,
    //     uint256 index
    // ) public returns (bool success) {
    //     requireOwner();

    //     User storage user = users[email];
    //     delete user.vaults[index];
    //     user.numVaults--;
    //     return true;
    // }

    // Login Functions
    // function addVaultLogin(
    //     string memory email,
    //     string memory name,
    //     string memory website,
    //     string memory userName,
    //     string memory password,
    //     uint256 index
    // ) public returns (bool success) {
    //     requireOwner();
    //     User storage user = users[email];

    //     Login storage login = vaultLogins[0];

    //     login.name = name;
    //     login.website = website;
    //     login.userName = userName;
    //     login.password = password;

    //     user.vaults[index].logins.push(login);
    //     user.vaults[index].numLogins++;

    //     delete vaultLogins[0];
    //     return true;
    // }

    // function getAllVaultLogins(
    //     string memory _email,
    //     uint256 index
    // ) public view returns (string memory email, Login[] memory) {
    //     User storage user = users[_email];

    //     email = user.email;
    //     return (email, user.vaults[index].logins);
    // }

    // function updateVaultLogin(
    //     uint256 vaultIndex,
    //     uint256 loginIndex,
    //     string memory email,
    //     string memory name,
    //     string memory website,
    //     string memory userName,
    //     string memory password
    // ) public returns (bool success) {
    //     requireOwner();

    //     User storage user = users[email];

    //     user.vaults[vaultIndex].logins[loginIndex].name = name;
    //     user.vaults[vaultIndex].logins[loginIndex].website = website;
    //     user.vaults[vaultIndex].logins[loginIndex].userName = userName;
    //     user.vaults[vaultIndex].logins[loginIndex].password = password;
    //     return true;
    // }

    // function removeUserLogin(
    //     uint256 vaultIndex,
    //     uint256 loginIndex,
    //     string memory email
    // ) public returns (bool success) {
    //     requireOwner();
    //     User storage user = users[email];

    //     delete user.vaults[vaultIndex].logins[loginIndex];
    //     user.vaults[vaultIndex].numLogins--;

    //     return true;
    // }

    function getOwner() public view returns (address ownerAddress) {
        return owner;
    }
}
