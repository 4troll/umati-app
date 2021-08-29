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
	Fab,
	Tooltip
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import FlagIcon from '@material-ui/icons/Flag'; 

import { Cookies, useCookies } from 'react-cookie';
import validator from "validator";
import jwt_decode from "jwt-decode";

import {LoadPostCard, PostCard} from "./components/PostCard.js";
import UserLink from "./components/UserLink.js";
import SortDropdown from "./components/SortDropdown";

import { MentionsInput, Mention } from "react-mentions";

import MentionSuggestionStyle from "./styles/MentionSuggestionStyle.js";




const useStyles = makeStyles(theme => ({
    root: {
        minWidth: 275,
        display: 'flex',
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
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
    },
    cover: {
        width: 151,
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    playIcon: {
        height: 38,
        width: 38,
    },
}));


function PostView(props) {
	const [token, setToken] = useCookies(["token"]);

    const [postDat, setPostDat] = useState({});
	const [loading, setLoading] = useState(true);
	const [editable, setEditable] = useState(false);
	const [anchor, setAnchor] = useState(null);

	const [umatinameField,setUmatinameField] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [taken,setTaken] = useState(false);

	const inputFile = useRef(null);
	const [selectedLogoFile,setSelectedLogoFile] = useState("");

    const { umatiname, postId } = useParams();
	const classes = useStyles();

	const inputRef = useRef();
	const cardRef = useRef();
  	const [desctext, setDescText] = useState("");

	const [loadCards, setLoadCards] = useState([]);
	const [postsData, setPostsData] = useState([]);
	
	const [loadingSuggestions, setLoadingSuggestions] = useState(false);



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

    useEffect (() => {
		const cookieDat = token.token ? jwt_decode(token.token) : null ;
		async function getPostData () {
			
			let response = await fetch("/api/postData/" + postId, {
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
					setPostDat(json);
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
            loadlist.push(LoadPostCard());
        }
        setLoadCards(loadlist);

		getPostData().then(a => {
            setLoading(false);
        });

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
		if (!targetUmatiname) {
			return false;
		}
		if (targetUmatiname.length < 3) {
			return false;
		}
		if (targetUmatiname.length > 25) {
			return false;
		}
		if (!validator.isAlphanumeric(targetUmatiname)) {
			return false;
		}
		return true;
	}

	async function updateDescription() {
		try {
			console.log(desctext);
			var descData = {
				"description": desctext
			}
			let response = await fetch("/api/editDescription/umati/" + umatiname, {
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

	const setDesc = e => {
		setDescText(e.target.value);
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
    return (
		<Fragment>
			<Box
			sx={{
				backgroundColor: 'background.default',
				minHeight: '100%',
				py: 3
			}}
			ref={cardRef}
			>
				<Container maxWidth="lg">
					{loading ? LoadPostCard(true) :
					
                        (<PostCard data={postDat} loggedIn={token.token ? true : false}/>)
			        }
				</Container>
			</Box>
		</Fragment>
    );
}

export default PostView;