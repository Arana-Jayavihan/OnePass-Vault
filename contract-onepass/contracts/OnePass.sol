// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract OnePass {
    address private owner;
    bytes32 private contractHash;
    bool private isInitiated;
    uint64 private vaultCount = 0;
    uint64 private loginCount = 0;

    struct User {
        string fName;
        string lName;
        string contact;
        string email;
        string encPrivateKey;
        string publicKey;
        string masterEncKey;
        string[] transactionHashes;
        uint16 numVaults;
        bytes32 hashPassPhrase;
        AssignedVault[] assignedVaults;
    }

    struct AssignedVault {
        uint64 vaultIndex;
        string vaultName;
        string note;
        bool isOwner;
    }

    struct VaultUser {
        bool isOwner;
        uint64 index;
        string email;
        string encVaultPass;
    }

    struct Vault {
        uint64 index;
        string name;
        string note;
        string owner;
        uint64 numLogins;
        uint64 numUsers;
        string vaultKeyHash;
        VaultUser[] vaultUsers;
        Login[] logins;
        CustomFields[] vaultCustomFields;
    }

    struct Login {
        uint64 index;
        string owner;
        string name;
        string website;
        string userName;
        string password;
        CustomFields[] loginCustomFields;
    }

    struct CustomFields {
        string id;
        string name;
        string value;
    }

    struct TxnHash {
        string tHash;
    }

    mapping(uint64 => Vault) private vaults;
    mapping(uint64 => Login) private vaultLogins;
    mapping(string => CustomFields) private customFields;
    mapping (string => AssignedVault) private assignedVaults;
    mapping(string => User) private users;
    mapping(string => VaultUser) private vaultUsers;

    //Constructor
    function InitiateContract(string memory contPass) public {
        require(isInitiated == false, "Contract is Initiated");
        owner = msg.sender;
        isInitiated == true;
        contractHash = keccak256(abi.encodePacked(contPass));
    }

    // Require Owner
    function requireOwner() private view {
        require(msg.sender == owner, "You are not the user");
    }

    // Contract Authentication
    function authenticate(string memory contPass) private view {
        require(contractHash == keccak256(abi.encodePacked(contPass)), "Invalid Contract Password");
    }

    // Compare Strings
    function compareStrings(
        string memory str1,
        string memory str2
    ) private pure returns (bool success) {
        if (bytes(str1).length != bytes(str2).length) {
            return false;
        }
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }

    // Find Vault User
    function findVaultUser(
        string memory email,
        uint64 vaultIndex
    ) private view returns (bool success){
        for(uint64 i = 0; i < vaults[vaultIndex].numUsers; i++ ){
            if(compareStrings(email, vaults[vaultIndex].vaultUsers[i].email) == true){
                return true;
            }
            else {
                continue;
            }
        }
        return false;
    }

    // Require object owner
    function requireObjOwner(
        string memory str1,
        string memory str2
    ) private pure {
        require(bytes(str1).length == bytes(str2).length, "You are not the owner of the object");
        require(keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2)), "You are not the owner of the object");
    }

    // Authenticate User
    function authenticateUser(
        string memory email,
        string memory hashPass
    ) private view {
        require((users[email].hashPassPhrase == keccak256(abi.encodePacked(hashPass))), "Invalid Password");
    }

    // User Functions
    function validateHashPass (
        string memory email,
        string memory hashPass,
        string memory contPass
    ) public view returns (bool success) {
        authenticate(contPass);
        authenticateUser(email, hashPass);
        return true;
    }

    function addUserKeys(
        string memory email,
        string memory encPrivateKey,
        string memory publicKey,
        string memory masterEncKey,
        string memory hashPass,
        string memory contPass
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        users[email].email = email;
        users[email].encPrivateKey = encPrivateKey;
        users[email].publicKey = publicKey;
        users[email].masterEncKey = masterEncKey;
        users[email].hashPassPhrase = keccak256(abi.encodePacked(hashPass));
        return true;
    }

    function addUserData(
        string memory email,
        string memory fName,
        string memory lName,
        string memory contact,
        string memory hashPass,
        string memory contPass
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(email, hashPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        requireObjOwner(email, users[email].email);
        users[email].fName = fName;
        users[email].lName = lName;
        users[email].contact = contact;

        return true;
    }

    function addTxnHash(
        string memory email,
        string memory txnHash,
        string memory contPass
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        users[email].transactionHashes.push(txnHash);
        return true;
    }

    function getAllTxnHashes(
        string memory _email,
        string memory contPass
    ) public view returns (string memory email, string[] memory) {
        authenticate(contPass);
        require(compareStrings(users[_email].email, "") == false, "User Not Found");
        return (users[_email].email, users[_email].transactionHashes);
    }

    function getPrivateKey(
        string memory email,
        string memory hashPass,
        string memory contPass
    ) public view returns (string memory encPrivateKey) {
        authenticate(contPass);
        authenticateUser(email, hashPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        return users[email].encPrivateKey;
    }

    function getPublicKey(
        string memory email,
        string memory contPass
    ) public view returns (string memory publicKey) {
        authenticate(contPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        return users[email].publicKey;
    }

    function getMasterEncKey(
        string memory email,
        string memory hashPass,
        string memory contPass
    ) public view returns (string memory masterEncKey) {
        authenticate(contPass);
        authenticateUser(email, hashPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        return users[email].masterEncKey;
    }

    function getUserData(
        string memory _email,
        string memory contPass
    )
        public
        view
        returns (
            string memory email,
            string memory fName,
            string memory lName,
            string memory contact,
            AssignedVault[] memory
        )
    {
        authenticate(contPass);
        return (
            users[_email].email,
            users[_email].fName,
            users[_email].lName,
            users[_email].contact,
            users[_email].assignedVaults
        );
    }

    function removeUser(
        string memory email,
        string memory hashPass,
        string memory contPass
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(email, hashPass);
        delete users[email];
        return true;
    }

    // Vault Functions
    function createVault(
        string memory email,
        string memory name,
        string memory note,
        string memory encVaultKey,
        string memory vaultKeyHash,
        string memory hashPass,
        string memory contPass,
        CustomFields[] memory tempCustomFields,
        uint8 size
    ) public returns (bool sucess) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(email, hashPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        User storage tempUser = users[email];
        Vault storage tempVault = vaults[vaultCount];

        if (size > 0){
            for(uint8 i = 0; i < size; i++){
                CustomFields storage tempCustomField = customFields[vaultKeyHash];
                tempCustomField.id = tempCustomFields[i].id;
                tempCustomField.name = tempCustomFields[i].name;
                tempCustomField.value = tempCustomFields[i].value;
                tempVault.vaultCustomFields.push(tempCustomField);
                delete customFields[vaultKeyHash];
            }
        }
    
        tempVault.index = vaultCount;
        tempVault.name = name;
        tempVault.note = note;
        tempVault.owner = email;
        tempVault.numLogins = 0;
        tempVault.numUsers = 0;
        tempVault.vaultKeyHash = vaultKeyHash;

        VaultUser storage user = vaultUsers[email];
        user.email = email;
        user.isOwner = true;
        user.encVaultPass = encVaultKey;
        user.index = tempVault.numUsers;

        AssignedVault storage asVault = assignedVaults[vaultKeyHash];
        asVault.vaultName = name;
        asVault.vaultIndex = vaultCount;
        asVault.note = note;
        asVault.isOwner = true;

        tempUser.assignedVaults.push(asVault);
        tempUser.numVaults++;

        tempVault.vaultUsers.push(user);
        tempVault.numUsers++;
        vaultCount++;

        delete assignedVaults[vaultKeyHash];
        delete vaultUsers[email];
        return true;
    }

    function getVault(
        uint64 index,
        string memory contPass
    ) public view returns (Vault memory) {
        authenticate(contPass);
        return vaults[index];
    }

    function getAssignVaults(
        string memory email,
        string memory contPass
    ) public view returns(AssignedVault[] memory){
        authenticate(contPass);
        return users[email].assignedVaults;
    }

    function getUserEncVaultKey(
        string memory email,
        string memory hashPass,
        string memory contPass,
        uint64 vaultIndex
        ) public view returns(string memory encVaultKey){
            authenticate(contPass);
            authenticateUser(email, hashPass);
            for(uint64 i; i < vaults[vaultIndex].numUsers; i++){
                if(compareStrings(vaults[vaultIndex].vaultUsers[i].email, email) == true){
                    return vaults[vaultIndex].vaultUsers[i].encVaultPass;
                }
            }
        }

    // function getUserVaults(
    //     string memory email
    // ) public view returns(
    //     Vault[] memory
    // ){
    //     Vault[] memory userVaults = new Vault[](vaultCount);
    //     uint64 counter = 0;
    //     for(uint64 i = 0; i  < vaultCount; i++){
    //         for(uint64 j = 0; j < vaults[i].numUsers; j++){
    //             if(compareStrings(email, vaults[i].vaultUsers[j].email) == true){
    //                 userVaults[counter] = vaults[i];
    //                 counter++;
    //             }
    //         }
    //     }
    //     return userVaults;
    // }

    function addVaultUser(
        uint64 vaultIndex,
        string memory userEmail,
        string memory addUserEmail,
        string memory encVaultKey,
        string memory hashPass,
        string memory contPass
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(userEmail, hashPass);
        require(compareStrings(users[addUserEmail].email, "") == false, "User Not Found");
        require(findVaultUser(addUserEmail, vaultIndex) == false, "User Already Assigned");
        requireObjOwner(userEmail, vaults[vaultIndex].owner);
        User storage tempUser = users[addUserEmail];

        AssignedVault storage tempVault = assignedVaults[encVaultKey];
        tempVault.vaultIndex = vaultIndex;
        tempVault.vaultName = vaults[vaultIndex].name;
        tempVault.note = vaults[vaultIndex].note;
        tempVault.isOwner = false;

        tempUser.assignedVaults.push(tempVault);
        tempUser.numVaults++;
        
        VaultUser storage user = vaultUsers[addUserEmail];
        user.email = addUserEmail;
        user.isOwner = false;
        user.encVaultPass = encVaultKey;
        user.index = vaults[vaultIndex].numUsers;

        vaults[vaultIndex].vaultUsers.push(user);
        vaults[vaultIndex].numUsers++;
        delete vaultUsers[addUserEmail];
        delete assignedVaults[encVaultKey];
        return true;
    }

    function removeVaultUser(
        string memory email,
        string memory hashPass,
        string memory contPass,
        uint64 vaultIndex,
        uint64 userIndex
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(email, hashPass);
        requireObjOwner(email, vaults[vaultIndex].owner);
        require(compareStrings(users[email].email, "") == false, "User Not Found");

        Vault storage tempVault = vaults[vaultIndex];
        User storage tempUser = users[email];
        
        for(uint64 i = 0; i < tempUser.numVaults; i++){
            if(compareStrings(tempUser.assignedVaults[i].vaultName, tempVault.name) == true){
                tempUser.assignedVaults[i].vaultName = '';
                tempUser.assignedVaults[i].note = '';
                break;
            }
        }
        
        for(uint64 i = 0; i < tempVault.numUsers; i++){
            if(compareStrings(tempVault.vaultUsers[i].email, vaults[vaultIndex].vaultUsers[userIndex].email) == true){
                tempVault.vaultUsers[i].isOwner = false;
                tempVault.vaultUsers[i].encVaultPass = "";
                tempVault.vaultUsers[i].email = "";
            }
        }
        delete vaults[vaultIndex].vaultUsers[userIndex];
        return true;
    }

    function removeVault(
        string memory email,
        string memory hashPass,
        string memory contPass,
        uint64 vaultIndex
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(email, hashPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        requireObjOwner(email, vaults[vaultIndex].owner);
        Vault storage tempVault = vaults[vaultIndex];
        for(uint64 i = 0; i < tempVault.numUsers; i++){
            if(compareStrings(tempVault.vaultUsers[i].email, "") == false){
                User storage tempUser = users[tempVault.vaultUsers[i].email];
                for(uint64 j = 0; j < tempUser.numVaults; j++){
                    if(compareStrings(tempUser.assignedVaults[j].vaultName, tempVault.name) == true){
                        tempUser.assignedVaults[j].vaultName = "";
                        tempUser.assignedVaults[j].note = "";
                        break;
                    }
                }
                break;
            }
        }

        delete vaults[vaultIndex];
        return true;
    }

    // // Login Functions
    function addVaultLogin(
        string memory email,
        string memory name,
        string memory website,
        string memory userName,
        string memory password,
        string memory hashPass,
        string memory contPass,
        uint64 vaultIndex,
        CustomFields[] memory tempCustomFields,
        uint8 size
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(email, hashPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        require(findVaultUser(email, vaultIndex) == true, "User not authorized");
        Login storage login = vaultLogins[loginCount];

        if (size > 0){
            for(uint8 i = 0; i < size; i++){
                CustomFields storage tempCustomField = customFields[name];
                tempCustomField.id = tempCustomFields[i].id;
                tempCustomField.name = tempCustomFields[i].name;
                tempCustomField.value = tempCustomFields[i].value;
                login.loginCustomFields.push(tempCustomField);
                delete customFields[name];
            }
        }

        login.owner = email;
        login.name = name;
        login.website = website;
        login.userName = userName;
        login.password = password;
        login.index = vaults[vaultIndex].numLogins;

        vaults[vaultIndex].logins.push(login);
        vaults[vaultIndex].numLogins++;
        loginCount++;
        delete vaultLogins[loginCount];
        return true;
    }

    function getAllVaultLogins(
        uint64 vaultIndex,
        string memory contPass
    ) public view returns (Login[] memory) {
        authenticate(contPass);
        return vaults[vaultIndex].logins;
    }

    function removeVaultLogin(
        string memory email,
        string memory hashPass,
        uint64 vaultIndex,
        uint64 loginIndex,
        string memory contPass
    ) public returns (bool success) {
        requireOwner();
        authenticate(contPass);
        authenticateUser(email, hashPass);
        require(compareStrings(users[email].email, "") == false, "User Not Found");
        requireObjOwner(email, vaults[vaultIndex].logins[loginIndex].owner);
        delete vaults[vaultIndex].logins[loginIndex];
        return true;
    }

    function getOwner(string memory contPass) public view returns (address ownerAddress) {
        authenticate(contPass);
        return owner;
    }

    // function updateVault(
    //     uint256 vaultIndex,
    //     string memory userEmail,
    //     string memory hashPass,
    //     string memory name,
    //     string memory note
    // ) public returns (bool success) {
    //     requireOwner();
    //     require(compareStrings(users[userEmail].email, "") == false, "User Not Found");
    //     require(compareStrings(users[userEmail].hashPassPhrase, hashPass) == true, "Invalid Password");
    //     requireObjOwner(userEmail, vaults[vaultIndex].owner);
    //     vaults[vaultIndex].name = name;
    //     vaults[vaultIndex].note = note;
    //     return true;
    // }


    // function updateVaultLogin(
    //     uint256 loginIndex,
    //     uint256 vaultIndex,
    //     string memory email,
    //     string memory hashPass,
    //     string memory name,
    //     string memory website,
    //     string memory userName,
    //     string memory password
    // ) public returns (bool success) {
    //     requireOwner();
    //     require(compareStrings(users[email].email, "") == false, "User Not Found");
    //     require(compareStrings(users[email].hashPassPhrase, hashPass) == true, "Invalid Password");
    //     requireObjOwner(email, vaults[vaultIndex].logins[loginIndex].owner);

    //     vaults[vaultIndex].logins[loginIndex].name = name;
    //     vaults[vaultIndex].logins[loginIndex].website = website;
    //     vaults[vaultIndex].logins[loginIndex].userName = userName;
    //     vaults[vaultIndex].logins[loginIndex].password = password;
    //     return true;
    // }
}
