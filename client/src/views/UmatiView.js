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
	Modal,
	Fab,
	Tooltip,
	Tab,
	Tabs,
	RadioGroup,
	Radio,
	FormControlLabel,
	FormLabel
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';

import { Cookies, useCookies } from 'react-cookie';
import validator from "validator";
import jwt_decode from "jwt-decode";

import {LoadPostCard, PostCard} from "./components/PostCard.js";
import UserLink from "./components/UserLink.js";
import SortDropdown from "./components/SortDropdown";

import { MentionsInput, Mention } from "react-mentions";

import MentionSuggestionStyle from "./styles/MentionSuggestionStyle.js";


import InfiniteScroll from "react-infinite-scroll-component";

import {
	DndContext, 
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
  } from "@dnd-kit/core";
  import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
  } from '@dnd-kit/sortable';
  import {
	restrictToVerticalAxis,
	restrictToParentElement
  } from '@dnd-kit/modifiers';

import {RuleCard, LoadingRuleCard} from './components/RuleCard';

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
	const [rules, setRules] = useState([]);
	const [originalRules, setOriginalRules] = useState([]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
		  coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const [loading, setLoading] = useState(true);
	const [allCaughtUp, setAllCaughtUp] = useState(false);

	const [editable, setEditable] = useState(false);
	const [anchor, setAnchor] = useState(null);

	const [currentTab,setCurrentTab] = useState(0);

	const [umatinameField,setUmatinameField] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [taken,setTaken] = useState(false);

	const inputFile = useRef(null);
	const [selectedLogoFile,setSelectedLogoFile] = useState("");

    const { umatiname } = useParams();
	const classes = useStyles();
	const location = useLocation();
  	const history = useHistory();

	const inputRef = useRef();
	const cardRef = useRef();
  	const [desctext, setDescText] = useState("");

	const [loadCards, setLoadCards] = useState([]);
	const [postsData, setPostsData] = useState([]);
	
	const [loadingSuggestions, setLoadingSuggestions] = useState(false);

	const [targetRule,setTargetRule] = useState("");


    function loadCard (main) {
        return (
            <Card className={classes.root} style={{marginTop: "5px"}} variant="outlined">
            <CardHeader
                avatar={
				main ? 
				<Skeleton animation="wave" variant="rounded" width={64} height={64} />
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
	function PostCardLoading (main) {
        return (
            <LoadPostCard/>
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
	const getPostsData = async (umatiId) => {
		const targetUmatiId = umatiId || umatiDat.umatiId;
        try {
            console.log("initiating post fetch");
            let response = await fetch("/api/fetchPosts" + ("?umatiId=" + targetUmatiId + "&") + (window.location.search.slice(1)), {
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
                    setPostsData(postsData.concat(json));
                    var searchParams = new URLSearchParams(window.location.search);
                    const limit = parseInt(searchParams.get("limit")) || 25;
                    if (json && json.length < limit) {
                        setAllCaughtUp(true);
                    }
                    return json;
                })
                .catch(e => {
                    console.error(e);
                    setAllCaughtUp(true);
                    return e;
                });
            }
        }
        catch(e) {
            console.error(e);
        }
        
    }
    const loadMorePages = async () => {
        try {
            var nextPage = 2;
            var searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has("page")) {
                nextPage = parseInt(searchParams.get("page")) + 1;
            }
            searchParams.set("page",nextPage);
            history.replace({
				search: searchParams.toString(),
			});
            await getPostsData()
            .then(function (json) {
                return json;
            })
            .catch(function (e) {
                
                return e;
            });
        }
        catch(e) {
            console.error(e);
        }
        
    }

    useEffect (() => {
		const cookieDat = token.token ? jwt_decode(token.token) : null ;
		var url = window.location.href;
		var final = url.substr(url.lastIndexOf('/') + 1);

		

		if (final == "rules") {
			setCurrentTab(1);
		}
		else if (final == "members") {
			setCurrentTab(2);
		}
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
						setDescText(json.description);
					}
					if (cookieDat && (json.ownerData.username == cookieDat.username || cookieDat.isAdmin)) {
						setEditable(true);
					}



					if (json.umatiId) {
						console.log("initiating post fetch");
						await getPostsData(json.umatiId);
					}

					if (json.rules) {
						console.log("setting original rules");
						setOriginalRules(json.rules);
						setRules(json.rules);
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
            loadlist.push(PostCardLoading());
        }
        setLoadCards(loadlist);

		getUmatiData().then(a => {
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
	const handleDragEnd = (event) => {
		console.log(event);
		const {active, over} = event;
		
		if (active.id !== over.id) {
		  setRules((rules) => {
			// const oldIndex = rules.indexOf(active.id);
			// const newIndex = rules.indexOf(over.id);
			var oldIndex;
			var newIndex;
			for (let i = 0; i < rules.length; i++) {
				if (rules[i].id == active.id) {
					
					oldIndex = i;
					console.log("old index: " + oldIndex);
					break;
				}
			}
			for (let i = 0; i < rules.length; i++) {
				if (rules[i].id == over.id) {
					newIndex = i;
					console.log("new index: " + newIndex);
					break;
				}
			}
			
			console.log("rule moving from " + oldIndex + " to " + newIndex);
			
			return arrayMove(rules, oldIndex, newIndex);
		  });
		}
	
	}
	const loadRuleCards = () => {
		let loadingcards = [];
		for (let i = 0; i < 3; i++) {
			loadingcards.push(<LoadingRuleCard/>);
		}
		console.log("loading")
		return(loadingcards);
	}
	const [changingSettings, setChangingSettings] = useState(false);

	const [removeRuleConfirm, setRemoveRuleConfirm] = useState(false);

	const handleOpenRuleRemoveConfirm = () => {
		setRemoveRuleConfirm(true);
	};

	const handleCloseRuleRemoveConfirm = (e) => {
		if (targetRule) {
			// for (let i = 0; i < rules.length; i++) {
			// 	if (rules[i] && rules[i].id == targetRule) {
			// 		console.log("FOUND!")
			// 		rules.splice(i,1);
			// 	}
			// }
		setRules(rules.filter(rule => rule.id !== targetRule));
		}
		setRemoveRuleConfirm(false);
	};

	const [ruleEditModal, setRuleEditModal] = useState(false);

	const handleOpenRuleEditModal = () => {
		setRuleEditModal(true);
	};

	const handleCloseRuleEditModal = (e) => {
		setRuleEditModal(false);
	};

	
	const [ruleTitle, setRuleTitle] = useState("");
	const [ruleDescription, setRuleDescription] = useState("");
	const [ruleAppliedTo, setRuleAppliedTo] = useState(0);
	const [newRuleIndexCount, setNewRuleIndexCount] = useState(0);

	const lookUpRule = (ruleId) => {
		if (ruleId) {
			for (let i = 0; i < rules.length; i++) {
				if (rules[i] && rules[i].id == ruleId) {
					setTargetRule(ruleId);
					setRuleTitle(rules[i].title);
					setRuleDescription(rules[i].description);
					setRuleAppliedTo(rules[i].appliedTo);
				}
			}
		}
	};

	async function finishRuleEdits() {
		setChangingSettings(true);
		var body;
		try {
			body = {
				"rules": rules
			}
            // console.log(formData);
			await postJson("/api/editRules/" + umatiname, body)
			.then(function (data){
				console.log("setting original rules");
				setOriginalRules(rules);
				return data;
			})
			.catch(e => {
				setRules(originalRules);
				console.error(e);
				return e;
			});
		}
		catch(e) {
			console.error(e);
			return e;
		}
		finally {
			setChangingSettings(false);
			// setProfileModal(false);
		}
	}

	const umatiDetails = () => {
		

		if (currentTab == 1) { // rules
			return (
				<div style={{marginTop: "30px", height:"fit-content"}}>
					<span className="right-hold flexbox" style= {{justifyContent:"space-between", width:"100%"}}>
						<h1>Rules</h1>
						<Button 
						onClick={() => {
							setTargetRule("");
							setRuleTitle("");
							setRuleDescription("");
							setRuleAppliedTo(0);
							handleOpenRuleEditModal();
						}}
						variant="outlined" type="button" color="primary">
							Add Rule
						</Button>
					</span>
					<div>
					{loading ? (loadRuleCards()) :
					<DndContext 
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={(e) => handleDragEnd(e)}
					modifiers={[restrictToVerticalAxis, restrictToParentElement]}
					>
					<SortableContext 
						items={rules}
						strategy={verticalListSortingStrategy}
					>
						{
						rules.map((data, index) => <RuleCard key={index} data={data} index={index} 
						delete={(id) => {
							lookUpRule(id);
							handleOpenRuleRemoveConfirm();
						}}
						edit={(id) => {
							lookUpRule(id);
							handleOpenRuleEditModal();
						}}
						/>)
						}
					</SortableContext>
					</DndContext>
					}
					</div>
					{!loading && !changingSettings && originalRules != rules ? 
					<div>
						<Button
						onClick={() => finishRuleEdits()}
						style={{ float:"right", marginTop: "20px", marginBottom: "20px", marginLeft:"24px"}} variant="contained" type="button" color="primary">
						Save
						</Button>
						<Button 
						onClick={

							() => {
								
								setRules(originalRules)
							}
						}
						style={{float:"right", marginTop: "20px", marginBottom: "20px"}} variant="contained" type="button">
						Cancel
						</Button> 
					</div> : ""}
					
					
				</div>
			);
			
		}
		else if (currentTab == 2) { // members
			
		}
		else {
			return (
				<div style={{marginTop: "30px"}}>
					<span className="right-hold flexbox" style= {{justifyContent:"space-between", width:"100%", marginBottom:"-20px"}}>
						<h1>Posts</h1>
						<SortDropdown/>
					</span>
					{ loading ? loadCards :
						<InfiniteScroll
						dataLength={postsData.length}
						next={loadMorePages}
						hasMore={!allCaughtUp}
						loader={<LoadPostCard/>}
						>
						{
							postsData.map(function (post,i) {
								return (
									<PostCard key={i} data={post} umatiname={umatiname} loggedIn = {token.token ? true : false}/>
								);
							})
						}
						</InfiniteScroll>
					}
				</div>
			);
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
			ref={cardRef}

			>
				<Container maxWidth="lg">
					{loading ? loadCard(true) : 
					
					<div key={umatiDat.umatiname} className="umatiView" style={{marginTop: "5px"}} 
					
					
					  
					  >
						<Card className={classes.root} variant="outlined">
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
									{loading ? (
										<React.Fragment>
											<Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
											<Skeleton animation="wave" height={10} width="80%" />
										</React.Fragment>
										) : (
										<Fragment>
										<Editable
											text={desctext || umatiDat.description}
											placeholder={editable ? "Click me to add a fancy description" : "Welcome to u/" + umatiDat.umatiname + ", one of many Umatis on the social media platform Umati!"}
											childRef={inputRef}
											finishEdits={() => updateDescription()}
											type="input"
											enabled={editable}
											style={{whiteSpace: "pre-wrap"}}
											
											>
											<MentionsInput 
											value={desctext} 
											onChange={setDesc}
											style={MentionSuggestionStyle}
											multiline
											ignoreAccents
											suggestionsPortalHost={cardRef.current}
											allowSuggestionsAboveCursor={true}
											
											>
												<Mention
												trigger={/(u\/([a-zA-Z0-9]+))/}
												data={findMentionableUmatis}
												renderSuggestion={(
													suggestion,
													search,
													highlightedDisplay,
													index,
													focused
												  ) => (
													<div className={`user ${focused ? "focused" : ""}`}>
														<div className="right-hold flexbox">
															<Avatar variant="rounded" style={{height:24+"px", width:24+"px", marginRight: "10px"}} 
															src={"/assets/umatiLogo/" + suggestion.id} />
															{"u/"}
															{highlightedDisplay}
														</div>
													</div>
												  )}
												markup="u/[__display__][__id__]"
												style={{ backgroundColor: "#3F50B5", opacity: 0.2}}
												appendSpaceOnAdd={true}
												displayTransform={(_, display) => {
													return `u/${display}`;
													// return (<a href={"/u/" + display}>{"u/" + display}</a>);
												}}
												
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
															<Avatar style={{height:24+"px", width:24+"px", marginRight: "10px"}} 
															src={"/assets/profilePicture/" + suggestion.id} />
															{"@"}
															{highlightedDisplay}
														</div>
													</div>
												  )}
												markup="@[__display__][__id__]"
												style={{ backgroundColor: "#3F50B5", opacity: 0.2}}
												appendSpaceOnAdd={true}
												displayTransform={(_, display) => {
													return `@${display}`;
													// return (<a href={"/u/" + display}>{"u/" + display}</a>);
												}}
												
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
										{token.token ? <div>
										<Button style={{float:"right", width:"fit-content"}} variant="contained" type="button" color="primary">
										Join
										</Button>
										</div> 
										: ""}
										
										</Fragment>
									)}
									
								</Box>
							</CardContent>
						</Card>
						
					</div>
			}
			<Tabs
			value={currentTab}
			onChange={(event, newValue) => {
				setCurrentTab(newValue);
				
				if (newValue == 0) {
					history.push({
						pathname: "/u/" + umatiDat.umatiname + "/posts"
					});
				}
				else if (newValue == 1) {
					history.push({
						pathname: "/u/" + umatiDat.umatiname + "/rules"
					});
				}
				else if (newValue == 2) {
					history.push({
						pathname: "/u/" + umatiDat.umatiname + "/members"
					});
				}
				}}
			indicatorColor="primary"
			textColor="primary"
			variant="fullWidth"
		>
			<Tab label="Posts" index={0}/>
			<Tab label="Rules" index={1}/>
			<Tab label="Members" index={2}/>
		</Tabs>
			{umatiDetails()}
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
            (loading) ? null : 

			<Tooltip title={token.token ? "Create post" : "Only Umati accounts can create posts"} placement="left">
            <Fab color="secondary" aria-label="add" href={"/u/" + umatiDat.umatiname + "/submit"} 
            style={{margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed'}}>
                <CreateIcon />
            </Fab>
			</Tooltip>
        }


		
		<Modal // Confirm Delete Rule Modal
		open={removeRuleConfirm}
		onClose={() => {setRemoveRuleConfirm(false)}}
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
		<h2 id="simple-modal-title">{"Delete rule \"" + ruleTitle +"\""}</h2>
		<p id="simple-modal-description">
			{"Are you sure you want to delete rule \"" + ruleTitle +"\" ? Clicking \"Save\" after confirming this change will permanently remove this rule."}
		</p>
		<Button
				onClick={(e) => handleCloseRuleRemoveConfirm(e)}
				style={{float: "right", marginTop: "20px"}} variant="contained" type="button" color="secondary">
				Delete
		</Button>
		</div>
		</Modal>

		<Modal // Add/Edit Modal
					open={ruleEditModal}
					onClose={handleCloseRuleEditModal}
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
					<h2 id="simple-modal-title">{targetRule ? "Edit rule" : "Add rule"}</h2>
					<p id="simple-modal-description">
						A strong Umati is a well-governed Umati. Customize this Umati's rules depending on its needs.
					</p>
					<form id="umatiEditRulesForm" className={classes.form} 
					onSubmit={(e) => {
							e.preventDefault();
							let editedArray = [...rules];
							if (targetRule) { // edit rule
								for (let i = 0; i < editedArray.length; i++) {
									if (editedArray[i] && editedArray[i].id == targetRule) {
										editedArray[i].title = ruleTitle;
										editedArray[i].description = ruleDescription;
										editedArray[i].appliedTo = ruleAppliedTo;
									}
								}
							}
							else { // new rule
								setNewRuleIndexCount(newRuleIndexCount + 1); // increment newruleindexcount
								let newRule = {
									id: newRuleIndexCount.toString(),
									title: ruleTitle,
									description: ruleDescription,
									appliedTo: ruleAppliedTo
								}
								editedArray.push(newRule);
							}
							console.log(editedArray);
							setRules(editedArray);
							handleCloseRuleEditModal();
					}} 
					noValidate>
						<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								id="rule-title"
								label="Title"
								name="rule-title"
								autoComplete="rule-title"
								onChange={(e) => setRuleTitle(e.target.value)}
								value={ruleTitle}
								autoFocus
								// error={taken == true}
								// helperText = {taken == true? 'Umati Name already taken' : ''}
						/>
						<TextField
								variant="outlined"
								margin="normal"
								fullWidth
								id="rule-description"
								label="Description"
								name="rule-description"
								autoComplete="rule-description"
								value={ruleDescription}
								onChange={(e) => setRuleDescription(e.target.value)}
								multiline
						/>
						<div style={{marginTop:	"20px"}}>
						<RadioGroup aria-label="This rule applies to:" name="gender1" value={ruleAppliedTo} onChange={(e) => {setRuleAppliedTo(parseInt(e.target.value))}}>
							<FormLabel component="legend">This rule applies to:</FormLabel>
							<FormControlLabel value={0} control={<Radio />} label="Posts and comments" />
							<FormControlLabel value={1} control={<Radio />} label="Posts" />
							<FormControlLabel value={2} control={<Radio />} label="Comments" />
						</RadioGroup>
						</div>
						
						<Button form="umatiEditRulesForm" variant="contained" color="primary" type="submit" isPrimary className={classes.submit} 
						// disabled={!validUmatinameAvatarForm()}
						 >
						Save
						</Button>
						<br/>
						<br/>
						<FormLabel>{function() {
							if (targetRule.length > 4) { // arbritary number, no one will ever make 1000+ rules in one go
								return ("ruleid: " + targetRule);
							}
							else if (targetRule) { 
								return ("This is an unsaved new rule. Its unique ID will be determined after it is saved.");
							}
							else {
								return ("This action will add a new rule to the Umati.");
							}
						}
						}</FormLabel>
					</form>
					</div>
					</Modal>



		</Fragment>
    );
}

export default UmatiView;