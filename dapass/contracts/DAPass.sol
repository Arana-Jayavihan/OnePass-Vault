// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract DAPass {
    address private owner;
    string private testPhrase;

    struct User {
        string fName;
        string lName;
        string contact;
        string email;
        uint256 numLogins;
        string hashPassPhrase;
        Login[] logins;
    }

    struct Login {
        string name;
        string website;
        string userName;
        string password;
    }

    mapping(uint256 => Login) private userLogins;
    mapping(string => User) private users;

    uint256 private totLoginCount = 0;

    //Constructor
    function BlockchainPassword(string memory encTestPhrase) public {
        owner = msg.sender;
        testPhrase = encTestPhrase;
    }

    function addUser(
        string memory email,
        string memory fName,
        string memory lName,
        string memory contact,
        string memory hashPassPhrase
    ) public returns (bool success) {
        if (msg.sender != owner) return false;
        User storage user = users[email];

        user.fName = fName;
        user.lName = lName;
        user.contact = contact;
        user.email = email;
        user.hashPassPhrase = hashPassPhrase;
        user.numLogins = 0;
        return true;
    }

    function getUser(
        string memory _email
    ) public view returns (
        string memory email,
        string memory fName,
        string memory lName,
        string memory contact
    ) {
        User storage user = users[_email];

        return (user.email, user.fName, user.lName, user.contact);
    }

    function addUserLogin(
        string memory email,
        string memory name,
        string memory website,
        string memory userName,
        string memory password
    ) public returns (bool success) {
        if (msg.sender != owner) return false;
        User storage user = users[email];

        Login storage login = userLogins[totLoginCount];

        login.name = name;
        login.website = website;
        login.userName = userName;
        login.password = password;

        user.logins.push(login);
        user.numLogins++;
        return true;
    }

    function updateUserLogin(
        uint256 index,
        string memory email,
        string memory name,
        string memory website,
        string memory userName,
        string memory password
    ) public returns (bool success) {
        if (msg.sender != owner) return false;
        User storage user = users[email];

        user.logins[index].name = name;
        user.logins[index].website = website;
        user.logins[index].userName = userName;
        user.logins[index].password = password;
        return true;
    }

    function removeUserLogin(
        uint256 index,
        string memory email
    ) public returns (bool success) {
        if (msg.sender != owner) return false;
        User storage user = users[email];

        delete user.logins[index];
        return true;
    }

    function removeUser(string memory email) public returns (bool success) {
        if (msg.sender != owner) return false;
        delete users[email];
        return true;
    }

    function getUserLogin(
        string memory email,
        uint256 id
    )
        public
        view
        returns (
            string memory name,
            string memory website,
            string memory userName,
            string memory password
        )
    {
        User storage user = users[email];

        name = user.logins[id].name;
        website = user.logins[id].website;
        userName = user.logins[id].userName;
        password = user.logins[id].password;
    }

    function getAllUserLogins(
        string memory _email
    ) public view returns (string memory email, Login[] memory) {
        User storage user = users[_email];

        email = user.email;
        return (email, user.logins);
    }

    function getUserHashPass(
        string memory email
    ) public view returns (string memory hashPassPhrase) {
        User storage user = users[email];

        return user.hashPassPhrase;
    }

    function getTestPhrase() public view returns (string memory phrase) {
        return testPhrase;
    }

    function getOwner() public view returns (address ownerAddress) {
        return owner;
    }

    function kill() public {
        if (msg.sender == owner) selfdestruct(payable(owner));
    }
}
