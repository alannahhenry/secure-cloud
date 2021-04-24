import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

class LoginForm extends React.Component{
	constructor (props){
		super(props);
		this.state = {	
			value: '', 
			loggedin: 'null', 
			files: [],
			uploadFile: null,
			addedUser: null,
			removedUser: null
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
		alert(this.state.value + " logged in!");
		console.log(this.state.value)
		this.setState({loggedin: this.state.value});
		event.preventDefault();

		fetch('http://localhost:3010/api/files/'+this.state.value)
		.then(response => response.json())
		.then(data => this.setState({files: data.files}));
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
		if(this.state.loggedin == 'null'){
			return(
				<div>
					<form onSubmit = {this.handleLogin}>
						<label>
							Username: 
							<input type="text" value={this.state.value} 
								onChange={this.handleChange}/>
						</label>
						<input type="submit" value="Login"/>
					</form>
				</div>
			);
		}
		else{
			return(
				<div>
					<div> {this.state.files.map((item) => 
						<li>
							<a download href={"http://localhost:3010/"+item}>{item}</a>
						</li>)} 
					</div>
					<div class="container">
						<div class="row">
							<div class="col-md-6">
								<form method="post" action="#" id="#">
									<div class="form-group files">
										<label>Upload Your File </label>
										<input type="file" name="file" class="form-control" multiple="" onChange={this.onChangeHandler}/>
									</div>
								</form>
							</div>
						</div>
						<div class="row">
							<button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
						</div>
					</div>
					<div>
						<form onSubmit={this.handleUserUpload}>
							<label>
								Add user to group:
								<input type="text" value ={this.state.addedUser}  onChange={this.handleUser}/>
							</label>
							<input type="submit" value="Add User"/>
						</form>
						<form onSubmit={this.handleRemoveUser}>
							<label>
								Remove user from group:
								<input type="text" value={this.state.removedUser} onChange={this.handleRemovedUser} />
							</label>
							<input type="submit" value="Remover User"/>
						</form>
					</div>
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
