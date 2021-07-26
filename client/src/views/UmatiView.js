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
	Modal,
	Fab
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';

import { Cookies, useCookies } from 'react-cookie';
import validator from "validator";
import jwt_decode from "jwt-decode";

import PostCard from "./components/PostCard.js";
import UserLink from "./components/UserLink.js";

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


function UmatiView(props) {
	const [token, setToken] = useCookies(["token"]);

    const [umatiDat, setUmatiDat] = useState({});
	const [loading, setLoading] = useState(true);
	const [editable, setEditable] = useState(false);
	const [anchor, setAnchor] = useState(null);

	const [umatinameField,setUmatinameField] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [taken,setTaken] = useState(false);

	const inputFile = useRef(null);
	const [selectedLogoFile,setSelectedLogoFile] = useState("");

    const { umatiname } = useParams();
	const classes = useStyles();

	const inputRef = useRef();
  	const [desctext, setDescText] = useState("");

	const [loadCards, setLoadCards] = useState([]);
	const [postsData, setPostsData] = useState([]);



    function loadCard () {
        return (
            <Card className={classes.root}>
            <CardHeader
                avatar={<Skeleton animation="wave" variant="rounded" width={64} height={64} />}
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

	const handleOpenDropdown = event => {
		setAnchor(event.currentTarget);
	};
	
	const handleCloseDropdown = () => {
		setAnchor(null);
	};

	const [umatiModal, setUmatiModal] = React.useState(false);
	const handleOpenUmatiModal = () => {
		handleCloseDropdown();
		setUmatiModal(true);
	};

	const handleCloseUmatiModal = () => {
		setUmatiModal(false);
	};

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
			});
		}
	}

    useLayoutEffect (() => {
		const cookieDat = token.token ? jwt_decode(token.token) : null ;
		async function getUmatiData () {
			
			let response = await fetch("/api/umatiData/" + umatiname, {
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
				.then(async function (json) {
					setUmatiDat(json);
					if (json.logo) {
						console.log(json.logo);
						setSelectedLogoFile(json.logo);
					}
	
					setUmatinameField(json.umatiname);
					setDisplayName(json.displayname);
	
					if (json.description) {
						setDescText(userDat.description);
					}
					if (cookieDat && (json.ownerData.username == cookieDat.username || cookieDat.isAdmin)) {
						setEditable(true);
					}



					if (json.umatiId) {
						console.log("initiating post fetch");
						let response = await fetch("/api/fetchPosts/umati/" + json.umatiId + window.location.search, {
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
							})
							.catch(e => {
								console.error(e);
							});
						}
					}

					return json;
				})
				.catch(e => {
					console.error(e);
				});
			}
		}

		setLoading(true);
		let loadlist = []
        for (let i = 0; i < 10; i++) {
            loadlist.push(loadCard());
        }
        setLoadCards(loadlist);

		getUmatiData().then(a => {
            setLoading(false);
        })
	}, []);

	function onChangeLogoClick () {
		// `current` points to the mounted file input element
	   inputFile.current.click();
	};
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
		  	setSelectedLogoFile(reader.result);
		};
		reader.onerror = function (error) {
		  console.log('Error: ', error);
		};
	};

	async function saveUmatiData(event) {
		event.preventDefault();
		try {
			var formData = {
				"umatiname": umatinameField,
				"displayname": displayName,
				"logo": selectedLogoFile
			}
			let response = await fetch("/api/updateUmati/" + umatiname, {
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
					window.location.href = "/u/" + formData.umatiname;
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
		finally {
			setUmatiModal(false);
		}
	}

	function checkUmatiname(targetUmatiname) {
		if (targetUmatiname.length < 3) {
			return false;
		}
		if (!validator.isAlphanumeric(targetUmatiname)) {
			return false;
		}
		return true;
	}

	function validUmatinameAvatarForm() {
		console.log(checkUmatiname(umatinameField));
		if (!checkUmatiname(umatinameField)) {
			return false;
		}
		return true;
	}

	async function umatinameUpdate(umatinameQuery) {
		setUmatinameField(umatinameQuery);
		setTaken(false);
		if (umatiname != umatinameQuery) {
			var lookup = {
				"umatiname": umatinameQuery
			}
			await postJson("/api/umatiLookup", lookup)
			.then(function (response) {
				setTaken(true);
				return response;
			})
			.catch((error) => {
				return error;
			});
		}
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
					{loading ? loadCard() : 
					
					<div key={umatiDat.umatiname} className="umatiView" style={{marginTop: "5px"}}>
						<Card className={classes.root}>
							<CardHeader
								avatar={
								<Avatar
									variant="rounded"
									alt={umatiDat.displayname}
									src={selectedLogoFile}
									style={{height:64+"px", width:64+"px"}}
									/>
								}
								title={
									(umatiDat.displayname ? umatiDat.displayname : "u/" + umatiDat.umatiname)
								}
								subheader={(umatiDat.displayname ? ("u/" + umatiDat.umatiname) : "")}
								action={
								(loading || (!token.token)) ? null : (
									<IconButton aria-label="settings" onClick={handleOpenDropdown}>
									<MoreVertIcon />
									</IconButton>
								)
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
							<MenuItem onClick={handleOpenUmatiModal}>Edit name/logo</MenuItem>
							</Fragment>
							: 
							<MenuItem onClick={handleCloseDropdown}>Join</MenuItem>
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
									<span style={{
									alignItems: 'left',
									display: 'flex',
									flexDirection: 'row',
									}}> Owner: <UserLink data={umatiDat.ownerData}/></span>
									<p>{umatiDat.description}</p>
								</Box>
							</CardContent>
						</Card>
						
					</div>
			}

			<div key="posts" className="PostsView" style={{marginTop: "30px"}}>
			{ loading ? loadCards : 
				(postsData.map(function (post,i) {
					return (
						<PostCard key={i} data={post} umatiname={umatiname}/>
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
			style={{ minHeight: '100vh' }}
			>
				<Grid item xs={3}>
					<Modal
					open={umatiModal}
					onClose={handleCloseUmatiModal}
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
					<h2 id="simple-modal-title">Edit Umati Name and logo</h2>
					<p id="simple-modal-description">
						Update Umati settings. Umati Names are unique, alphanumerical, and do not include spaces.
					</p>
					<form id="umatiEditForm" className={classes.form} onSubmit={saveUmatiData} noValidate>
						<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								id="umatiname"
								label="Umati Name"
								name="umatiname"
								autoComplete="umatiname"
								onChange={(e) => umatinameUpdate(e.target.value)}
								value={umatinameField}
								error={taken == true}
								helperText = {taken == true? 'Umati Name already taken' : ''}
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
						<Button onClick={onChangeLogoClick} variant="contained" type="button">
						Change logo
						</Button>
						<Button form="umatiEditForm" variant="contained" color="primary" type="submit" isPrimary className={classes.submit} disabled={!validUmatinameAvatarForm()} >
						Save
						</Button>
					</form>
					</div>
					</Modal>
				</Grid>
			</Grid>
			{
            (loading || (!token.token)) ? null : 
        
            <Fab color="secondary" aria-label="add" href={"/u/" + umatiDat.umatiname + "/submit"} 
            style={{margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed'}}>
                <CreateIcon />
            </Fab>
        }
		</Fragment>
    );
}

export default UmatiView;