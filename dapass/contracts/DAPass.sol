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
        string encPublicKey;
        uint256 numVaults;
        Vault[] vaults;
    }

    struct Vault {
        string name;
        string note;
        uint256 index;
        uint256 numLogins;
        string[] vaultKeyHashes;
        Login[] logins;
    }

    struct Login {
        uint256 index;
        string name;
        string website;
        string userName;
        string password;
    }
    mapping(uint256 => Vault) private userVaults;
    mapping(uint256 => Login) private vaultLogins;
    mapping(string => User) private users;

    //Constructor
    function InitiateContract(string memory contHash) public {
        owner = msg.sender;
        contractHash = contHash;
    }

    // Require Owner
    function requireOwner() view private {
        require(msg.sender == owner, "You are not the user");
    }

    // User Functions
    function addUser(
        string memory email,
        string memory fName,
        string memory lName,
        string memory contact,
        string memory hashPassPhrase,
        string memory encPrivateKey,
        string memory encPublicKey
    ) public returns (bool success) {
        requireOwner();
        User storage user = users[email];

        user.fName = fName;
        user.lName = lName;
        user.email = email;
        user.numVaults = 0;
        user.contact = contact;
        user.encPublicKey = encPublicKey;
        user.encPrivateKey = encPrivateKey;
        user.hashPassPhrase = hashPassPhrase;

        return true;
    }

    function getPrivateKey(
        string memory email
    ) public view returns (string memory encPrivateKey) {
        User storage user = users[email];

        return user.encPrivateKey;
    }

    function getPublicKey(
        string memory email
    ) public view returns (string memory encPublicKey) {
        User storage user = users[email];

        return user.encPublicKey;
    }

    function getUser(
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
        User storage user = users[_email];

        return (user.email, user.fName, user.lName, user.contact);
    }

    function removeUser(string memory email) public returns (bool success) {
        requireOwner();
        delete users[email];
        return true;
    }

    function getUserHashPass(
        string memory email
    ) public view returns (string memory hashPassPhrase) {
        User storage user = users[email];

        return user.hashPassPhrase;
    }

    // Vault Functions
    function createVault(
        string memory email,
        string memory name,
        string memory note,
        string memory vaultKeyHash
    ) public returns (bool sucess) {
        requireOwner();

        User storage user = users[email];
        Vault storage vault = userVaults[0];

        vault.index = user.numVaults;
        vault.name = name;
        vault.note = note;
        vault.numLogins = 0;
        vault.vaultKeyHashes.push(vaultKeyHash);

        user.vaults.push(vault);

        user.numVaults++;
        delete userVaults[0];
        return true;
    }

    function getVaults(
        string memory _email
    ) public view returns (string memory email, Vault[] memory) {
        User storage user = users[_email];
        email = user.email;
        return (email, user.vaults);
    }

    function updateVault(
        string memory email,
        uint256 index,
        string memory name,
        string memory note
    ) public returns (bool success) {
        requireOwner();

        User storage user = users[email];

        user.vaults[index].name = name;
        user.vaults[index].note = note;
        return true;
    }

    function addVaultKeyHash(
        string memory email,
        string memory vaultKeyHash,
        uint256 index
    ) public returns (bool success) {
        requireOwner();

        User storage user = users[email];

        user.vaults[index].vaultKeyHashes.push(vaultKeyHash);
        return true;
    }

    function removeVault(
        string memory email,
        uint256 index
    ) public returns (bool success) {
        requireOwner();

        User storage user = users[email];
        delete user.vaults[index];
        user.numVaults--;
        return true;
    }

    // Login Functions
    function addVaultLogin(
        string memory email,
        string memory name,
        string memory website,
        string memory userName,
        string memory password,
        uint256 index
    ) public returns (bool success) {
        requireOwner();
        User storage user = users[email];

        Login storage login = vaultLogins[0];

        login.name = name;
        login.website = website;
        login.userName = userName;
        login.password = password;

        user.vaults[index].logins.push(login);
        user.vaults[index].numLogins++;

        delete vaultLogins[0];
        return true;
    }

    function getAllVaultLogins(
        string memory _email,
        uint256 index
    ) public view returns (string memory email, Login[] memory) {
        User storage user = users[_email];

        email = user.email;
        return (email, user.vaults[index].logins);
    }

    function updateVaultLogin(
        uint256 vaultIndex,
        uint256 loginIndex,
        string memory email,
        string memory name,
        string memory website,
        string memory userName,
        string memory password
    ) public returns (bool success) {
        requireOwner();

        User storage user = users[email];

        user.vaults[vaultIndex].logins[loginIndex].name = name;
        user.vaults[vaultIndex].logins[loginIndex].website = website;
        user.vaults[vaultIndex].logins[loginIndex].userName = userName;
        user.vaults[vaultIndex].logins[loginIndex].password = password;
        return true;
    }

    function removeUserLogin(
        uint256 vaultIndex,
        uint256 loginIndex,
        string memory email
    ) public returns (bool success) {
        requireOwner();
        User storage user = users[email];

        delete user.vaults[vaultIndex].logins[loginIndex];
        user.vaults[vaultIndex].numLogins--;

        return true;
    }

    function getOwner() public view returns (address ownerAddress) {
        return owner;
    }
}
