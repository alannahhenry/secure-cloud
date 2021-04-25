import React from 'react';

import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// react bootstrap stuff
import ListGroup from 'react-bootstrap/ListGroup';

class LoginForm extends React.Component{
	constructor (props){
		super(props);
		this.state = {	
			value: '', 
			loggedin: 'null', 
			files: [],
			uploadFile: null,
			addedUser: null,
			removedUser: null,
			authorised:false,
			users:[]
		};
		
		
		this.handleChange = this.handleChange.bind(this);
		this.handleLogin = this.handleLogin.bind(this);
		this.handleUser = this.handleUser.bind(this);
		this.handleRemovedUser = this.handleRemovedUser.bind(this);
		
	}
	
	// handles change in logged in text box
	handleChange(event){
		this.setState({value: event.target.value});
	}
	
	// handles change in added user text box
	handleUser(event){
		this.setState({addedUser: event.target.value});
	}

	//handles change in remived user text box
	handleRemovedUser(event){
		this.setState({removedUser: event.target.value })
	}
	
	// handles when the login button is pressed
	handleLogin(event) {
		console.log(this.state.value)
		this.setState({loggedin: this.state.value});
		event.preventDefault();

		fetch('http://localhost:3010/api/files/'+this.state.value)
		.then(response => response.json())
		.then(data => this.setState({files: data.files}));

		this.isAuthorised();
		this.getSecureUsers();
	}
	
	isAuthorised(){
		fetch('http://localhost:3010/authorised/'+this.state.value)
		.then(response => response.json())
		.then(data => this.setState({authorised: data.authorised}));
	}

	getSecureUsers(){
		fetch('http://localhost:3010/api/users/')
		.then(response => response.json())
		.then(data => this.setState({users: data.users}));
	}
	// handles change in file to be uploaded
	onChangeHandler=event=>{
		console.log(event.target.files[0])
		this.setState({
			uploadFile: event.target.files[0],
			loaded: 0
		})
	}

	// sends file to be uploaded
	onClickHandler = () => {
		const data = new FormData()
		data.append('file', this.state.uploadFile)
		data.append('user', this.state.value)
		axios.post("http://localhost:3010/upload/files", data, {})
		.then(response => {
			fetch('http://localhost:3010/api')
			.then(response => response.json())
			.then(data => this.setState({files: data.files}));
		})
	}

	//add user to secure group
	handleUserUpload = (event) => {
		axios.post("http://localhost:3010/upload/user",  {
			"user": this.state.addedUser
		})
		.then(response => console.log(response))
		event.preventDefault();
	}

	//remove user from secure group
	handleRemoveUser = (event) => {
		axios.post("http://localhost:3010/remove/user",  {
			"user": this.state.removedUser
		})
		.then(response => console.log(response))
		event.preventDefault();
	}
	

	
	
	
	render(){
		var upload;
		if(this.state.authorised){
			upload=<div class="container">
			<div class="row">
				<div class="col-md-6">
					<form method="post" action="#" id="#">
						<div class="form-group files">
							<label> &nbsp;Upload File</label>
							<input type="file" name="file" class="form-control" multiple="" onChange={this.onChangeHandler}/>
						</div>
					</form>
				</div>
			</div>
			<div id="upload" class="row">
				<button class= "upload-button" type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
			</div>
			<div id="user-interface"> 
						<form onSubmit={this.handleUserUpload}>
							<label>
								Add user to group: &nbsp;
								<input type="text" value ={this.state.addedUser}  onChange={this.handleUser}/>
								&nbsp;
							</label>
							<input type="submit" value="Add User"/>
						</form>
						<form onSubmit={this.handleRemoveUser}>
							<label>
								Remove user from group: &nbsp;
								<input type="text" value={this.state.removedUser} onChange={this.handleRemovedUser} />
								&nbsp;
							</label>
							<input type="submit" value="Remove User"/>
						</form>
					</div>
		</div>
		}else{
			upload=<div>
				<p>Because you are not part of the secure group, the upload and secure group administration sections have been disabled.</p>
			</div>
		}

		if(this.state.loggedin == 'null'){
			return(
				<div id="login-parent">
					<form id="login" onSubmit = {this.handleLogin}>
						<div class="row">
							<label>
								Username: &nbsp;
								<input type="text" value={this.state.value} 
									onChange={this.handleChange}/>
							</label>
							<label>
								Password: &nbsp;
								<input type="password"/>
							</label>
						</div>
						<div class="row">
							<input type="submit" value="Login"/>
						</div>
						
					</form>
				</div>
			);
		}
		else{
			return(
				<div id="login-page">
					<h1>Welcome, {this.state.value}</h1>
					<p>Part of secure group: {String(this.state.authorised)} </p>
					<h2>Encrypted files list: </h2>
					<p>If you are not a part of the secure group, the file will not be decrypted.</p>
					<div id="list-files"> {this.state.files.map((item) => 
						<ListGroup>
							<ListGroup.Item variant="dark" id ="item">
								<a download href={"http://localhost:3010/file/"+item.filename+"/"+item.username}> {item.filename} </a>
							</ListGroup.Item>
							
						</ListGroup>
					)}
						
					</div>
					<h2>Upload new files:</h2>
						<p>You can only upload a file if you are part of the secure group.</p>
					{upload}
					
				</div>
			);	
		}	
	}
}

ReactDOM.render(
  //<React.StrictMode>
    //<App />
  //</React.StrictMode>,
  <LoginForm />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
