import React, { useEffect,useLayoutEffect, useRef, useState, Fragment } from "react";

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


function CreatePost(props) {
    const classes = useStyles();

    const [umatiTitleField,setUmatiTitleField] = useState("");
    const [postBody, setPostBody] = useState("");
	const [displayName, setDisplayName] = useState("");

    const inputFile = useRef(null);
	const [selectedPhotoFile,setSelectedPhotoFile] = useState("");

    async function postJson(url, body) {
		let response = await fetch(url, {
			method: "post",
			body: JSON.stringify(body),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			credentials: "include"
		});
		if (!response.ok) {
			console.log("error");
			throw new Error("HTTP error, status = " + response.status);
		}
		else {
			await response.json()
			.then(json => {
				console.log(json);
			});
		}
	}

    async function sendUmatiCreationForm(event) {
		event.preventDefault()
		var formData;
		try {
			formData = {
				"title": umatiTitleField,
				"body": postBody,
				"photo": selectedPhotoFile
			}
            // console.log(formData);
			await postJson("/api/createUmati", formData)
			.then(function (data){
				console.log(data);
				// window.location.href = "/u/" + formData.umatiname;
				return data;
			})
			.catch(e => {
				console.error(e);
			});
		}
		catch(e) {
			console.error(e);
		}
		finally {
			// setProfileModal(false);
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

	function validUmatiForm() {
		console.log(checkUmatiname(umatiTitleField));
		if (!checkUmatiname(umatiTitleField)) {
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

	function onChangeLogoClick () {
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
                    <Card className={classes.root}>
                    <CardHeader
								// avatar={}
								title={"Create Umati"}
							/>
                        <CardContent>
                            <div>
                                <p>
                                    Umati (<em>oo•mah•tee</em>) is a social news website that places emphasis on small communities and the individuals within them. Communities in Umati are called Umatis. Each Umati has a unique Umati Name. Users can also assign Titles to their Umatis.
                                </p>
                            </div>
                            <form id="umatiCreationForm" className={classes.form}
                            onSubmit={sendUmatiCreationForm} 
                            noValidate>
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
                                        value={umatiTitleField}
                                        error={taken == true}
                                        helperText = {taken == true? "Umati Name already taken" : ""}
                                        autoFocus
                                />
                                <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="displayname"
                                        label="Title"
                                        name="displayname"
                                        autoComplete="displayname"
                                        value={postBody}
                                        onChange={(e) => setPostBody(e.target.value)}
                                />
								<Avatar style={{height:200+"px", width:200+"px"}} src={selectedPhotoFile} />
                                <input
                                accept="image/*"
                                className={classes.input}
                                id="contained-button-file"
                                type="file"
                                onChange={(e) => handleUploadClick(e)}
                                style={{display: "none"}}
                                ref={inputFile}
                                />
                                <Button 
                                onClick={onChangeLogoClick}
                                variant="contained" type="button">
                                Select umati image
                                </Button>
                                <Button form="umatiCreationForm" variant="contained" color="primary" type="submit" isPrimary className={classes.submit} 
                                disabled={!validUmatiForm()} 
                                >
                                Save
                                </Button>
                            </form>
                         </CardContent>
                    </Card>
                </Container>
		    </Box>
        </Fragment>
    );
}

export default CreatePost;