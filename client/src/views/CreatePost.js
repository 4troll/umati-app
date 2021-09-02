import React, { useEffect,useLayoutEffect, useRef, useState, Fragment } from "react";

import {useParams} from "react-router-dom";

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

import validator from "validator";
import { Cookies, useCookies } from 'react-cookie';

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
	helperText: {
		position: 'absolute',
		bottom: '-50%',
		right: '0%',
	}
}));


function CreatePost(props) {
    const classes = useStyles();

    const [postTitle,setPostTitle] = useState("");
    const [postBody, setPostBody] = useState("");

    const inputFile = useRef(null);
	const [selectedPhotoFile,setSelectedPhotoFile] = useState("");

	const { umatiname } = useParams();

	useEffect (() => {
        document.title = "Create post";
	}, []);

    async function sendPostCreationForm(event) {
		event.preventDefault()
		var formData;
		try {
			formData = {
				"title": postTitle,
				"body": postBody,
				"photo": selectedPhotoFile
			}
            // console.log(formData);
			let response = await fetch("/api/createPost/" + umatiname, {
				method: "post",
				body: JSON.stringify(formData),
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: "include"
			})
			if (!response.ok) {
				throw new Error("HTTP error, status = " + response.status);
			}
			else {
				await response.json()
				.then(function (postData) {
					console.log(postData);
					window.location.href = "/u/" + umatiname + "/comments/" + postData.postId;
					return postData;
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
			// setProfileModal(false);
		}
	}

	function checkTitle() {
		if (postTitle.length < 1) {
			return [true, ""];
		}
		if (postTitle.length > 100) {
			return [true, "Title cannot be more than 100 characters long"];
		}
		return [false,""];
	}
	function titleValidation() {
		var variable = checkTitle()
		return variable[0];
	}

	function checkBody() {
		if (postBody.length > 5000) {
			return [true, (5000 - postBody.length)];
		}
		return [false,(5000 - postBody.length)];
	}
	function bodyValidation() {
		var variable = checkBody()
		return variable[0];
	}

	function validSubmitForm() {
		if (titleValidation()) {
			return false;
		}
		return true;
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
		  	setSelectedPhotoFile(reader.result);
		};
		reader.onerror = function (error) {
		  console.log('Error: ', error);
		};
	};

	function onChangePhotoClick () {
		// `current` points to the mounted file input element
	   inputFile.current.click();
	};

    return (
        <Fragment>
            <Box
            sx={{
                backgroundColor: 'background.default',
                minHeight: '100%',
                py: 3,
				margin: "16px"
            }}
	  	    >
                <Container maxWidth="lg">
                    <Card className={classes.root} variant="outlined">
                    <CardHeader
								// avatar={}
								title={<b>Create post</b>}
							/>
                        <CardContent>
                            <div>
                                <p>
                                    You are posting to u/{umatiname}
                                </p>
                            </div>
                            <form id="postCreationForm" className={classes.form}
                            onSubmit={sendPostCreationForm} 
                            noValidate>
                                <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="title"
                                        label="Title"
                                        name="title"
                                        onChange={(e) => setPostTitle(e.target.value)}
                                        value={postTitle}
                                        error={postTitle.length > 0 ? titleValidation() : false}
                                        helperText = {checkTitle()}
                                        autoFocus
                                />
                                <TextField
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        id="body"
                                        label="Body (optional)"
                                        name="body"
                                        value={postBody}
                                        onChange={(e) => setPostBody(e.target.value)}
										error={bodyValidation()}
                                        helperText = {checkBody()}
										FormHelperTextProps={{ classes: { root: classes.helperText } }}
										style={{marginBottom:"30px"}}
										multiline
                                />
								<img style={{height:"auto", width:"auto"}} src={selectedPhotoFile} />
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
                                <Button 
                                onClick={onChangePhotoClick}
                                variant="contained" type="button">
                                Select post image (optional)
                                </Button>
                                <Button form="postCreationForm" variant="contained" color="primary" type="submit" isPrimary className={classes.submit} 
                                disabled={!validSubmitForm()} 
                                >
                                Submit
                                </Button>
								</div>
                            </form>
                         </CardContent>
                    </Card>
                </Container>
		    </Box>
        </Fragment>
    );
}

export default CreatePost;