import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";

import {useParams, useHistory, useLocation} from "react-router-dom";
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

import PostCard from "./components/PostCard.js";

import SortDropdown from "./components/SortDropdown";

import { MentionsInput, Mention } from "react-mentions";

import MentionSuggestionStyle from "./styles/MentionSuggestionStyle.js";

 
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
	
	const [ownsAccount,setOwnsAccount] = useState(false);

	const { username } = useParams();
	const classes = useStyles();

	const inputRef = useRef();
  	const [descText, setDescText] = useState("");

	const [loadCards, setLoadCards] = useState([]);
	const [postsData, setPostsData] = useState([]);

	const urlCreator = window.URL || window.webkitURL;

	const location = useLocation();
  	const history = useHistory();

	const [loadingSuggestions, setLoadingSuggestions] = useState(false);
	
	function loadCard (main) {
		return (
			<Card className={classes.root} style={{marginTop: "5px"}}>
			<CardHeader
				avatar={
				main ? 
				<Skeleton animation="wave" variant="circle" width={64} height={64} />
				: ""
			}
				// action={
				// loading ? null : (
				//     <IconButton aria-label="settings" 
				//     // onClick={handleOpenDropdown}
				//     >
				//     <MoreVertIcon />
				//     </IconButton>
				// )
				// }
				title={<Skeleton animation="wave" height={10} width={160} style={{ marginBottom: 6 }} />}
				subheader={<Skeleton animation="wave" height={10} width={80} />}
			/>
			<CardContent>
				<Box
					sx={{
					alignItems: 'left',
					display: 'flex',
					flexDirection: 'column'
					}}
				>
				<React.Fragment>
					<Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
					<Skeleton animation="wave" height={10} width="80%" />
				</React.Fragment>
				</Box>
			</CardContent>
		</Card>
	
		);
	}

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


	function onLogout() {
		cookies.remove("token",{ sameSite: "lax", secure: true, path: "/"});
		cookies.remove("refreshToken",  { sameSite: "lax", secure: true, path: "/"});
		window.location.href = "/login";
	}

	useEffect (() => {
		window.scrollTo(0, 0);
		
		const queryParams = new URLSearchParams(location.search)
		if (queryParams.has("self")) {
			setOwnsAccount(true);
			queryParams.delete("self");
			history.replace({
				search: queryParams.toString(),
			});
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
				.then(async (json) => {
					// console.log(json);
					await getPostsData(json.userId);
					setUserDat(json);
					
					if (json.avatar) {
						console.log(json.avatar);
						setSelectedAvatarFile(json.avatar);
					}
	
					setUsernameField(json.username);
					setDisplayName(json.displayname);
					
					console.log(json.description);
					if (json.description) {
						setDescText(json.description);
					}
					console.log(descText);
					if (cookieDat) {
						if (username == cookieDat.username || cookieDat.isAdmin) {
							setEditable(true);
						}
					}
					
					return json;
				})
				.catch(e => {
					console.error(e);
					return e;
				});
			}
		}

		async function getPostsData(userId) {
            try {
                console.log("initiating post fetch");
                let response = await fetch("/api/fetchPosts/" + ("?userId=" + userId + "&") + window.location.search.slice(1), {
                    method: "get",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    credentials: "include"
                });
                if (!response.ok) {
                    throw new Error("HTTP error, status = " + response.status);
                }
                else {
                    await response.json()
                    .then(function (postData) {
                        setPostsData(postData);
                        return postData;
                    })
                    .catch(e => {
                        console.error(e);
                        return e;
                    });
                }
            }
            catch(e) {
                console.error(e);
            }
			
		}
		findMentionableUmatis();
		findMentionableUsers();

		setLoading(true);
		let loadlist = []
        for (let i = 0; i < 10; i++) {
            loadlist.push(loadCard());
        }
        setLoadCards(loadlist);

		
		getUserData().then(json => {
			console.log(userDat);
			setLoading(false);
		});
		
	}, []);

	async function setDescription() {
		try {
			console.log(descText);
			var descData = {
				"description": descText
			}
			let response = await fetch("/api/editDescription/user/" + username, {
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
					return json;
				})
				.catch(e => {
					console.error(e);
					return e;
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
		if (!targetUsername) {
			return false;
		}
		if (targetUsername.length < 3) {
			return false;
		}
		if (targetUsername.length > 25) {
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

	const findMentionableUmatis = async (query, callback) => {
		setLoadingSuggestions(true);
		let urlquery = "";
		if (query && query.length > 0) {
			urlquery = "?search=" + query
		}
		let response = await fetch("/api/fetchUmatis" + urlquery, {
			method: "get",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			credentials: "include"
		});
		if (!response.ok) {
			throw new Error("HTTP error, status = " + response.status);
		}
		else {
			await response.json()
			.then(function (json) {
				// await json.forEach(async function(currentUmati, index){
				//     await getUserDataFromId(currentUmati.owner)
				//     .then(response => {
				//         currentUmati.ownerData = response;
				//         umatiDataList.push(currentUmati);
				//     })
				//     .catch (e => {
				//         console.error(e);
				//     });
				// });
				let importantstuff = []
				for (let i = 0; i < json.length; i++) {
					importantstuff.push({
						display: json[i].umatiname,
						id: json[i].umatiId
					})
				}
				return callback(importantstuff);
				
			})
			.catch(e => {
				console.error(e);
				return e;
			});
		}
		setLoadingSuggestions(false);
	}

	const findMentionableUsers = async (query, callback) => {
		setLoadingSuggestions(true);
		let urlquery = "";
		if (query && query.length > 0) {
			urlquery = "?search=" + query
		}
		let response = await fetch("/api/fetchUsers" + urlquery, {
			method: "get",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			credentials: "include"
		});
		if (!response.ok) {
			throw new Error("HTTP error, status = " + response.status);
		}
		else {
			await response.json()
			.then(function (json) {
				// await json.forEach(async function(currentUmati, index){
				//     await getUserDataFromId(currentUmati.owner)
				//     .then(response => {
				//         currentUmati.ownerData = response;
				//         umatiDataList.push(currentUmati);
				//     })
				//     .catch (e => {
				//         console.error(e);
				//     });
				// });
				let importantstuff = []
				for (let i = 0; i < json.length; i++) {
					importantstuff.push({
						display: json[i].username,
						id: json[i].userId
					})
				}
				return callback(importantstuff);
				
			})
			.catch(e => {
				console.error(e);
				return e;
			});
		}
		setLoadingSuggestions(false);
	}
	const setDesc = e => {
		setDescText(e.target.value);
	}
	let container;
	return (
		<Fragment>
		<Box
		sx={{
			backgroundColor: 'background.default',
			minHeight: '100%',
			py: 3
		}}
		ref={el => {
			container = el
		  }}
	  	>
			<Container maxWidth="lg">
						{(ownsAccount || editable)? <h1>Your account</h1> : ""}
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
								subheader={loading ? 
								<Fragment>
								<Skeleton animation="wave" height={10} width={80} /> 
								</Fragment>
								: 
								<Fragment>
								{(userDat.displayname ? ("@" + userDat.username) : "")}
								<p style={{color:"#ffaa00"}}>{(userDat.rep || 0) + " reputation"}</p>
								</Fragment>
							}
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
											// <span/>
											<Editable
											text={descText}
											placeholder={editable ? "Click me to add a fancy description" : "Welcome to u/" + userDat.username + ", one of many Umatis on the social media platform Umati!"}
											childRef={inputRef}
											finishEdits={() => setDescription()}
											type="input"
											enabled={editable}
											style={{whiteSpace: "pre-wrap"}}
											
											>
											<MentionsInput 
											value={descText} 
											onChange={setDesc}
											style={MentionSuggestionStyle}
											multiline
											ignoreAccents
											suggestionsPortalHost={container}
											allowSuggestionsAboveCursor={true}
											
											>
												<Mention
												trigger="u/"
												data={findMentionableUmatis}
												renderSuggestion={(
													suggestion,
													search,
													highlightedDisplay,
													index,
													focused
												  ) => (
													<div className={`user ${focused ? "focused" : ""}`}>
														u/
													  {highlightedDisplay}
													</div>
												  )}
												markup="u/[__display__](__id__)"
												style={{ backgroundColor: "#3F50B5", opacity: 0.2}}
												appendSpaceOnAdd={true}
												displayTransform={(_, display) => {
													return `u/${display}`;
													// return (<a href={"/u/" + display}>{"u/" + display}</a>);
												}}
												isLoading={loadingSuggestions}
												
												/>

												<Mention
												trigger="@"
												data={findMentionableUsers}
												renderSuggestion={(
													suggestion,
													search,
													highlightedDisplay,
													index,
													focused
												  ) => (
													<div className={`user ${focused ? "focused" : ""}`}>
														<div className="right-hold flexbox">
															<Avatar style={{height:24+"px", width:24+"px"}} 
															src={"/assets/profilePicture/" + suggestion.id} />
															{"@"}
															{highlightedDisplay}
														</div>
													</div>
												  )}
												markup="@[__display__](__id__)"
												style={{ backgroundColor: "#3F50B5", opacity: 0.2}}
												appendSpaceOnAdd={true}
												displayTransform={(_, display) => {
													return `@${display}`;
													// return (<a href={"/u/" + display}>{"u/" + display}</a>);
												}}
												isLoading={loadingSuggestions}
												/>
											</MentionsInput>
											{/* <TextField
												ref={inputRef}
												type="text"
												name="task"
												placeholder={"Write a fancy description"}
												multiline={true}
												fullWidth={true}
												value={desctext || umatiDat.description}
												onChange={e => setDescText(e.target.value)}
												onFocus={e => setDescText(e.target.value)}
												focused
												
												
											/> */}
										</Editable>
									)}				
								</Box>
							</CardContent>
						</Card>
						<span className="right-hold flexbox" style= {{justifyContent:"space-between", width:"100%", marginBottom:"-20px"}}>
							<h1>Posts</h1>
							<SortDropdown newdefault={true}/>
                   	 	</span>

						<div key="posts" className="PostsView" style={{marginTop: "30px"}}>
						{ loading ? loadCards : 
							(postsData.map(function (post,i) {
								return (
									<PostCard key={i} data={post} umatiname={post.hostUmatiname} indicateHost={true} loggedIn = {token.token ? true : false}/>
								);
							}))
						}
						</div>
			</Container>
			
		</Box>
		
		<Grid
		container
		spacing={0}
		direction="column"
		alignItems="center"
		justify="center"
		// style={{ minHeight: '100vh' }}
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