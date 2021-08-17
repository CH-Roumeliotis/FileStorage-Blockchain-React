import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import {StyledDropZone} from 'react-drop-zone';
import "bootstrap/dist/css/bootstrap.css";
import {Table} from 'reactstrap';
import FileIcon, { defaultStyles } from 'react-file-icon';
import "react-drop-zone/dist/styles.css";
import fileReaderPullStream from 'pull-file-reader';
import "./App.css";
import ipfs from './ipfs';

class App extends Component {
  state = { SimpleStorage: [], web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.getFiles);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getFiles = async () => {
    try {
      const {accounts, contract} = this.state;
      //get files by address
      let fileslength = await contract.methods.getLength().call({from: accounts[0]});
      let files = []
      for(let i = 0; i < fileslength; i++){
        let file = await contract.methods.getFile(i).call({from: accounts[0]});
        files.push(file);
      }
    this.setState({SimpleStorage: files});
    } catch (error){
      console.log(error);
    }
    
  }

  onDrop = async (file) => {
    try {
      //upload the file to ipfs
      const {contract, accounts} = this.state;
      const stream = fileReaderPullStream(file);
      const result = await ipfs.addNewFile(stream);
      const timestamp = Math.round(+new Date() / 1000);
      const type = file.name.substr(file.name.lastIndexOf(".")+1);
      let uploaded = await contract.methods.addNewFile(result[0].hash, file.name, type, timestamp).send({from: accounts[0], gas: 300000});
      console.log(uploaded);
      this.getFiles();
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="container pt-3">
          <StyledDropZone onDrop={this.onDrop}/>
          <Table>
            <thead>
              <tr>
                <th width="6%" scope="row">Type</th>
                <th className="text-left">Name</th>
                <th className="text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th><FileIcon size={30} extension="pdf" {...defaultStyles.pdf}/></th>
                <th className="text-left">ChrisR.docx</th>
                <th className="text-right">17/08/2021</th>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default App;
