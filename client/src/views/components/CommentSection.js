import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";



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

import UserLink from "./UserLink.js";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
  } from "react-router-dom";

import MentionSuggestionStyle from "../styles/MentionSuggestionStyle.js";
import Editable from "./Editable.js";
import {LoadingComment, CommentCard} from "./CommentCard.js";
import { MentionsInput, Mention } from "react-mentions";

const slugify = require('slugify');
const slugSettings = {
    replacement: '_',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: true,     // strip special characters except replacement, defaults to `false`
    locale: 'vi',       // language code of the locale to use
    trim: true         // trim leading and trailing replacement chars, defaults to `true`
  }

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
		margin: theme.spacing(3, 0, 2),
	},
}));



function CommentSection (props) {
    const classes = useStyles();

    const postDat = props.postData;
    const loggedIn = props.loggedIn;
    const [commentData, setCommentData] = useState(postDat.commentData);
    
    
    const inputRef = useRef();
    const portalRef = useRef();
    const [commentDraft, setCommentDraft] = useState("");
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    let match = useRouteMatch();


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
	useEffect (() => {
        console.log(commentData)
	}, []);

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
    const sendComment = async () => {
        let body = {
            content: commentDraft
        }
        try {
            let response = await fetch("/api/createComment/" + postDat.postId, {
                method: "post",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            else {
                await response.json()
                .then(function (json) {
                    console.log(json)
                    window.location.reload();
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

    return (
        <Box
			sx={{
				backgroundColor: 'background.default',
				minHeight: '100%',
                minWidth: '100%',
				py: 3
			}}
            
            style={{minWidth:"350px"}}
			>
                <Container maxWidth={"lg"}>
                    <span>{(props.targetComment && !props.loading) ? <Link 
                    style={{color: "#3f50b5", textDecoration: "none"}}
                    onClick={()=> {props.setLoading()}}
                    to={"/u/" + props.hostUmatiname + "/comments/" + postDat.postId + "/" + slugify(postDat.title,slugSettings)}>View entire discussion
                    </Link> : ""}
                    </span>
                    <span className="right-hold flexbox" style= {{justifyContent:"space-between", width:"100%", margin:"0px 0px", height:"fit-content"}}>
                        <h1>Comments</h1>
                    </span>
                    <div class="submitCommentDiv" ref={portalRef}>
                        <Editable
                                text={commentDraft}
                                placeholder={"Add a comment"}
                                childRef={inputRef}
                                finishEdits={sendComment}
                                type="commentInput"
                                enabled={true}
                                alwaysOn={true}
                                style={{whiteSpace: "pre-wrap"}}
                                
                                >
                                <MentionsInput 
                                value={commentDraft} 
                                placeholder={"Add a comment"}
                                onChange={(e) => {setCommentDraft(e.target.value)}}
                                style={MentionSuggestionStyle}
                                ignoreAccents
                                suggestionsPortalHost={portalRef.current}
                                allowSuggestionsAboveCursor={true}
                                style={{minHeight:"100px", overflow: "auto"}}
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
                            </Editable>
                        </div>
                        <div>
                            {(props.loading == false && props.postData) ? (props.postData.commentData.map(function (comment,i) {
                                return (
                                    <CommentCard key={comment.commentId}
                                    targetComment={props.targetComment} 
                                    postTitle={postDat.title}
                                    hostUmatiname={props.hostUmatiname}
                                    commentData={comment}
                                    loggedIn={loggedIn}
                                    userVote={comment.userVote ? comment.userVote : 0}/>
                                    );
                                
                            })) : 
                            (props.targetComment ? <LoadingComment key={1}/> : <Fragment>
                                <LoadingComment key={1}/>
                                <LoadingComment key={2}/>
                                <LoadingComment key={3}/>
                            </Fragment>)
                            
                        }
                        </div>
                        {/* <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/> */}
                </Container>
            </Box>

    );
}

export default CommentSection;