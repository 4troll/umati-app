import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";

import {useParams} from "react-router-dom";
import Editable from "./components/Editable";

import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    Typography,
	makeStyles,
	Container,
	Grid,
	TextField,
	CardHeader,
	IconButton,
	Menu,
	MenuItem,
	Modal
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import validator from "validator";
import jwt_decode from "jwt-decode";
import { useCookies } from 'react-cookie';

import Cookies from 'universal-cookie';
 
const cookies = new Cookies();

const useStyles = makeStyles(theme => ({
	root: {
	  minWidth: 275,
	},
	bullet: {
	  display: 'inline-block',
	  margin: '0 2px',
	  transform: 'scale(0.8)',
	},
	title: {
	  fontSize: 14,
	},
	pos: {
	  marginBottom: 12,
	},
	paper: {
		position: 'absolute',
		width: 400,
		backgroundColor: theme.palette.background.paper,
		border: '2px solid #000',
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3),
		transform: "translate(-$50%, -$50%)"
	  },
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		// margin: theme.spacing(3, 0, 2),
	},
}));


function Account(props) {
	const [token, setToken] = useCookies(["token"]);
	

	const [userDat, setUserDat] = useState({});
	const [loading, setLoading] = useState(true);
	const [editable, setEditable] = useState(false);
	const [anchor, setAnchor] = useState(null);

	
	const [usernameField,setUsernameField] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [taken,setTaken] = useState(false);

	const inputFile = useRef(null);
	const [selectedAvatarFile,setSelectedAvatarFile] = useState("");


	const { username } = useParams();
	const classes = useStyles();

	const inputRef = useRef();
  	const [desctext, setDescText] = useState("");

	const urlCreator = window.URL || window.webkitURL;

	async function postJson(url, body) {
		let response = await fetch(url, {
			method: "post",
			mode: "cors", 
			body: JSON.stringify(body),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			credentials: "include"
		});
		if (!response.ok) {
			throw new Error("HTTP error, status = " + response.status);
		}
		else {
			await response.json()
			.then(json => {
				console.log(json);
				return json;
			})
			.catch(e => {
				return e;
			})
		}
	}

	async function getUserData () {
		const cookieDat = token.token ? jwt_decode(token.token) : null;
		console.log(cookieDat);
		let response = await fetch("/api/userData/" + username, {
			method: "get",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			credentials: "include"
		});
		if (!response.ok) {
			throw new Error("HTTP error, status = " + response.status);
		}
		else {
			await response.json()
			.then(json => {
				console.log(json);
				setUserDat(json);
				
				if (json.avatar) {
					console.log(json.avatar);
					setSelectedAvatarFile(json.avatar);
				}

				setUsernameField(json.username);
				setDisplayName(json.displayname);

				if (json.description) {
					setDescText(userDat.description);
				}
				if (cookieDat) {
					if (username == cookieDat.username || cookieDat.isAdmin) {
						setEditable(true);
					}
				}
				
				return json;
			})
			.catch(e => {
				console.error(e);
			});
		}
	}

	function onLogout() {
		cookies.remove("token",{ sameSite: 'strict', secure: true});
		cookies.remove("refreshToken",  { sameSite: 'strict', secure: true});
		window.location.href = "/login";
	}

	useLayoutEffect (() => {
		window.scrollTo(0, 0);
		setLoading(true);
		getUserData().then(json => {
			setLoading(false);
		}).catch(error => {
			console.error(error);
		});
	}, []);

	async function setDescription() {
		try {
			console.log(desctext);
			var descData = {
				"description": desctext
			}
			let response = await fetch("/api/editDescription/" + username, {
				method: "post",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(descData),
				credentials: "include"
			});
			if (!response.ok) {
				throw new Error("HTTP error, status = " + response.status);
			}
			else {
				await response.json()
				.then(json => {
					console.log(json);
				})
				.catch(e => {
					console.error(e);
				});
			}
		}
		catch(e) {
			console.error(e);
		}
	}

	const handleOpenDropdown = event => {
		setAnchor(event.currentTarget);
	};
	
	const handleCloseDropdown = () => {
		setAnchor(null);
	};

	const [profileModal, setProfileModal] = React.useState(false);
	const handleOpenProfileModal = () => {
		handleCloseDropdown();
		setProfileModal(true);
	};

	const handleCloseProfileModal = () => {
		setProfileModal(false);
	};

	
	

	async function saveNameAvatarData(event) {
		event.preventDefault()
		try {
			var formData = {
				"username": usernameField,
				"displayname": displayName,
				"avatar": selectedAvatarFile
			}
			let response = await fetch("/api/updateNameAvatar/" + username, {
				method: "post",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
				credentials: "include"
			});
			if (!response.ok) {
				throw new Error("HTTP error, status = " + response.status);
			}
			else {
				await response.json()
				.then(json => {
					if (json.token) { // check if token returned
						Cookies.set("token",json.token); // update token
					}
					// Cookies.set("username", formData.username, { expires: 30 });
					window.location.href = "/@" + formData.username;
				})
				.catch(e => {
					console.error(e);
				});
			}
		}
		catch(e) {
			console.error(e);
		}
		finally {
			setProfileModal(false);
		}
	}




	function checkUsername(targetUsername) {
		if (targetUsername.length < 3) {
			return false;
		}
		if (!validator.isAlphanumeric(targetUsername)) {
			return false;
		}
		return true;
	}

	function validUsernameAvatarForm() {
		console.log(checkUsername(usernameField));
		if (!checkUsername(usernameField)) {
			return false;
		}
		return true;
	}

	async function usernameUpdate(usernameQuery) {
		setUsernameField(usernameQuery);
		setTaken(false);
		if (username != usernameQuery) {
			var lookup = {
				"username": usernameQuery
			}
			await postJson("/api/usernameLookup", lookup)
			.then(function (response) {
				setTaken(true);
				return response;
			})
			.catch((error) => {
				return error;
			});
		}
	}
	 

	async function handleUploadClick (event){
		console.log("image upload clicked");
		var file = event.target.files[0];
		// var blob = URL.createObjectURL(file);
		// console.log(blob);
		// setSelectedAvatarFile(blob);
		// blobToDataURL(file, function(dataurl){
		// 	console.log(dataurl);
		// });
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
		  	setSelectedAvatarFile(reader.result);
		};
		reader.onerror = function (error) {
		  console.log('Error: ', error);
		};
	};

	function onChangeAvatarClick () {
		// `current` points to the mounted file input element
	   inputFile.current.click();
	};

	function createUserTitle() {
		let title = userDat.displayname ? userDat.displayname : "@" + userDat.username;
		return (
			<span>{title}{userDat.admin ? <span style={{color:"#ffaa00", marginLeft:"10px"}}>Umati Administrator</span> : ""}</span>
		)
	}

	return (
		<Fragment>
		<Box
		sx={{
			backgroundColor: 'background.default',
			minHeight: '100%',
			py: 3
		}}
	  	>
			<Container maxWidth="lg">
						<Card className={classes.root}>
							<CardHeader
								avatar={
								loading ? (
									<Skeleton animation="wave" variant="circle" width={64} height={64} />
								) : (
									<Avatar
									alt={userDat.displayname}
									src={selectedAvatarFile}
									style={{height:64+"px", width:64+"px"}}
									/>
								)
								}
								action={
									(loading || (!token.token)) ? null : (
									<IconButton aria-label="settings" onClick={handleOpenDropdown}>
									<MoreVertIcon />
									</IconButton>
								)
								}
								title={
								loading ? (
									<Skeleton animation="wave" height={10} width={160} style={{ marginBottom: 6 }} />
								) : (
									createUserTitle()
								)
								}
								subheader={loading ? <Skeleton animation="wave" height={10} width={80} /> : (userDat.displayname ? ("@" + userDat.username) : "")}
							/>
							<Menu
							id="simple-menu"
							anchorEl={anchor}
							open={anchor}
							onClose={handleCloseDropdown}
							>
							{editable ? 
							<Fragment>
							<MenuItem onClick={handleOpenProfileModal}>Edit name/avatar</MenuItem>
							<MenuItem onClick={onLogout}>Logout</MenuItem> 
							</Fragment>
							: 
							<MenuItem onClick={handleCloseDropdown}>Message</MenuItem>
							}
							</Menu>
							<CardContent>
								<Box
									sx={{
									alignItems: 'left',
									display: 'flex',
									flexDirection: 'column'
									}}
								>
									{loading ? (
										<React.Fragment>
											<Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
											<Skeleton animation="wave" height={10} width="80%" />
										</React.Fragment>
										) : (
										<Editable
											text={desctext || userDat.description}
											placeholder={editable ? "Click me to add a fancy description" : "Hello. I am @" + userDat.username + ", an Umati user."}
											childRef={inputRef}
											finishEdits={() => setDescription()}
											type="input"
											enabled={editable}
											>
											<TextField
												ref={inputRef}
												type="text"
												name="task"
												placeholder={"Write a fancy description"}
												multiline={true}
												fullWidth={true}
												value={desctext || userDat.description}
												onChange={e => setDescText(e.target.value)}
												onFocus={e => setDescText(e.target.value)}
											/>
										</Editable>
									)}				
								</Box>
							</CardContent>
						</Card>
			</Container>
		</Box>
		<Grid
		container
		spacing={0}
		direction="column"
		alignItems="center"
		justify="center"
		style={{ minHeight: '100vh' }}
		>
			<Grid item xs={3}>
				<Modal
				open={profileModal}
				onClose={handleCloseProfileModal}
				aria-labelledby="simple-modal-title"
				aria-describedby="simple-modal-description"
				style={{
					// top: `50%`,
    				margin:'auto',
					display:'flex',
					alignItems:'center',
					justifyContent:'center'
				}}
				>
				<div className={classes.paper}>
				<h2 id="simple-modal-title">Edit name and avatar</h2>
				<p id="simple-modal-description">
					Update name/avatar settings. Usernames are unique and cannot contain spaces and special characters.
				</p>
				<form id="usernameAvatarForm" className={classes.form} onSubmit={saveNameAvatarData} noValidate>
					<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							id="username"
							label="Username"
							name="username"
							autoComplete="username"
							onChange={(e) => usernameUpdate(e.target.value)}
							value={usernameField}
							error={taken == true}
							helperText = {taken == true? 'Username already taken' : ''}
					/>
					<TextField
							variant="outlined"
							margin="normal"
							fullWidth
							id="displayname"
							label="Display name"
							name="displayname"
							autoComplete="displayname"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							autoFocus
					/>
					<input
					accept="image/*"
					className={classes.input}
					id="contained-button-file"
					type="file"
					onChange={(e) => handleUploadClick(e)}
					style={{display: "none"}}
					ref={inputFile}
					/>

					<div>
						<Button onClick={onChangeAvatarClick} key="addAvatar" variant="contained" type="button">
						Change avatar
						</Button>
						<Button 
						onClick={() => setSelectedAvatarFile("")}
						 key="clearAvatar" variant="contained" type="button">
						Remove avatar
						</Button>
						<Button form="usernameAvatarForm" key="submit" variant="contained" color="primary" type="submit" isPrimary className={classes.submit} disabled={!validUsernameAvatarForm()} >
						Save
						</Button>
					</div>
				</form>
				</div>
				</Modal>
			</Grid>
		</Grid>
		</Fragment>
	);
}

export default Account;