// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract SimpleStorage {
    struct File {
        string hash;
        string fileName;
        string fileType;
        uint date;
    }

    //Mapping address to an array with files
    mapping(address => File[]) files;

    function addNewFile(string memory _hash, string memory _fileName, string memory _fileType, uint _date) public {
        files[msg.sender].push(File({hash: _hash, fileName: _fileName, fileType: _fileType, date: _date}));
    }

    function getFile(uint n) public view returns(string memory, string memory, string memory, uint) {
        File memory file = files[msg.sender][n];
        return (file.hash, file.fileName, file.fileType, file.date);
    }

    //In order to iterate with the files of a given address we need this extra function with the current legth of File array
    //So in the Frond end we would need to get the length and iterate for each file that we want to list in our app 
    //and get the index for that file
    function getLength() public view returns(uint) {
        return files[msg.sender].length;
    }
}
