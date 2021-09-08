import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";


import {useParams, Link} from "react-router-dom";

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

import SortDropdown from "./SortDropdown";

import MentionSuggestionStyle from "../styles/MentionSuggestionStyle.js";
import Editable from "./Editable.js";
import { MentionsInput, Mention } from "react-mentions";

import UserLink from "./UserLink.js";
import UmatiLink from "./UmatiLink.js";

import RSRR from "react-string-replace-recursively";
import { mdconfig } from "../config/markdown";


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


const slugify = require('slugify');
const slugSettings = {
    replacement: '_',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: true,     // strip special characters except replacement, defaults to `false`
    locale: 'vi',       // language code of the locale to use
    trim: true         // trim leading and trailing replacement chars, defaults to `true`
  }


function determineColor(current,num) {
    if (current != num) {
        return "default";
    }
    else if (num == 1) {
        return "primary";
    }
    else if (num == -1) {
        return "secondary";
    }
    return "default";
}

function LoadingComment (props) {
    const classes = useStyles();
    return (
        <Card 
        style={{marginTop: "5px"}}
        className={classes.root} 
        variant="outlined">
            <CardHeader
                // action={
                // loading ? null : (
                //     <IconButton aria-label="settings" 
                //     // onClick={handleOpenDropdown}
                //     >
                //     <MoreVertIcon />
                //     </IconButton>
                // )
                // }
                avatar={
                    <Skeleton animation="wave" variant="circle" width={32} height={32} />
                    }
                title={
                    <Skeleton animation="wave" height={10} width={160} style={{ marginBottom: 6 }} />
                }
                // subheader={props.subheader}
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
                        <Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
                        <Skeleton animation="wave" height={10} width="80%" />
                </React.Fragment>		
                </Box>
            </CardContent>
            <Box style={{ alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: "rgba(0, 0, 0, 0.12)"}}>
            
            <Tooltip title={"Like"} placement="left">
                <IconButton
                aria-label="like" 
                component="span"
                disabled={true}
                >
                    <ThumbUpIcon />
                </IconButton>
            </Tooltip>

            <span>{"-"}</span>

            <Tooltip title={"Dislike"} placement="left">
                <IconButton 
                aria-label="dislike" 
                component="span"
                disabled={true}>
                    <ThumbDownIcon />
                </IconButton>
            </Tooltip>
            <Button variant="outlined" color="primary" disabled={true}>
                Reply
            </Button>
            
            <Button variant="outlined" color="primary" disabled={true}>
                Permalink
            </Button>

            <IconButton color="secondary" aria-label="flag" component="span" disabled={true}>
                <FlagIcon />
            </IconButton>
            
            </Box>
    </Card>
    );
}


function CommentCard(props) {
    const comment = props.commentData;
    const postDat = props.postData;
    const commenterData = comment.commenterData;
    const loggedIn = props.loggedIn;
    const userVote = props.userVote;

    const [voteStatus,setVoteStatus] = useState(comment.userVote || 0);
    const [loadingVote,setLoadingVote] = useState(false);

    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const [replying,setReplying] = useState(false);

    const [commentDraft, setCommentDraft] = useState("");

    const cardRef = useRef();
    const portalRef = useRef();
    const inputRef = useRef();

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

    const sendComment = async () => {
        if (replying) {
            let body = {
                content: commentDraft,
                commentParent: comment.commentId
            }
            try {
                let response = await fetch("/api/createComment/" + comment.postId, {
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
                        console.log(json);
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
        else {
            console.log("error: not replying, can't send");
        }
    }

    async function handleVote(originalVote,targetVote) {
		var voteData;
        console.log("sent")
        setLoadingVote(true);
		try {
			voteData = {
				"vote": targetVote
			}
            // console.log(formData);
			await fetch("/api/voteOnComment/" + comment.commentId, {
				method: "post",
                mode: "cors", 
				body: JSON.stringify(voteData),
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: "include"
			})
			.then(function (data){
				return data;
			})
			.catch(e => {
                setVoteStatus(originalVote);
				console.error(e);
			});
		}
		catch(e) {
			console.error(e);
		}
		finally {
            setLoadingVote(false);
		}
	}

    async function setVote(buttonClicked) {
        if (!loadingVote && loggedIn) {
            if (buttonClicked == voteStatus) { // if toggling
                setVoteStatus(0);
                await handleVote(voteStatus,0);
            }
            else {
                setVoteStatus(buttonClicked);
                await handleVote(voteStatus,buttonClicked);
            }
        }
        if (!loggedIn) {
            window.location.href = "/register?to=vote&vote=like";
        }
    }

    const useScroll = () => {
        const elRef = useRef(null);
        const executeScroll = () => elRef.current.scrollIntoView();
      
        return [executeScroll, elRef];
    };
    const [executeScroll, elRef] = useScroll();
    useEffect(() => {
        if (props.targetComment == comment.commentId) {
            executeScroll();
        }
        
    }, []);
    
    return (
        <Fragment>
        {props.commentData ? <Card 
            style={{marginTop: "5px", width: "100%", backgroundColor: (props.targetComment == comment.commentId) ? "rgba(255, 255, 0, 0.05)":  "rgba(255, 255, 255, 1)" }}
            // className={classes.root}
            
            variant="outlined">
                <div ref={(props.targetComment == comment.commentId) ? elRef : null} id="anchor-name" style={{position: "absolute", marginTop: "-50px", Left: 0}}></div>
                <CardHeader
                    // action={
                    // loading ? null : (
                    //     <IconButton aria-label="settings" 
                    //     // onClick={handleOpenDropdown}
                    //     >
                    //     <MoreVertIcon />
                    //     </IconButton>
                    // )
                    // }
                    avatar={
                        <Avatar
                        alt={commenterData.username}
                        src={commenterData.avatar}
                        style={{height:32+"px", width:32+"px", marginRight: "-15px"}}
                        />
                        }
                    title={<UserLink data={commenterData} noIcon={true}/>}
                    // subheader={props.subheader}
                />
                <CardContent>
                    <Box
                        sx={{
                        alignItems: 'left',
                        display: 'flex',
                        flexDirection: 'column'
                        }}
                    >
                    <span style={{whiteSpace: "pre-wrap"}}>{RSRR(mdconfig)(comment.content)}</span>		
                    </Box>
                </CardContent>
                <Box style={{ alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundColor: "rgba(0, 0, 0, 0.12)"}}>
                
                <Tooltip title={loggedIn ? "Like" : "Only Umati accounts can like comments"} placement="left">
                    <IconButton
                    color={determineColor(1,voteStatus)}
                    aria-label="like" component="span"
                    onClick={() => {setVote(1)}}
                    >
                        <ThumbUpIcon />
                    </IconButton>
                </Tooltip>
    
                <span>{(comment.voteCount || 0) - (comment.userVote || 0) + voteStatus}</span>
    
                <Tooltip title={loggedIn ? "Dislike" : "Only Umati accounts can dislike comments"} placement="left">
                    <IconButton 
                    color={determineColor(-1,voteStatus)}
                    aria-label="dislike" 
                    component="span"
                    onClick={() => {setVote(-1)}}>
                        <ThumbDownIcon />
                    </IconButton>
                </Tooltip>
                <Button onClick={()=> {setReplying(!replying)}} variant="outlined" color="primary">
                    Reply
                </Button>
                <Link 
                style ={{textDecoration:"none"}}
                to={"/u/" + props.hostUmatiname + "/comments/" + comment.postId + "/" + slugify(props.postTitle,slugSettings) + "/" + comment.commentId}>
                <Button variant="outlined" color="primary">
                    Permalink
                </Button>
                </Link>
    
                <IconButton color="secondary" aria-label="flag" component="span">
                    <FlagIcon />
                </IconButton>
                
                </Box>
    
                {comment.children ?
                comment.children.map(function (comment,i) {
                    return (
                        <span className="right-hold flexbox" style= {{width:"100%"}}>
                        <div style={{width:"10px"}}/>
                        <CommentCard style={{width: "100%"}} key={comment.commentId} targetComment={props.targetComment} postTitle={props.postTitle} hostUmatiname={props.hostUmatiname} commentData={comment} loggedIn={loggedIn} userVote={comment.userVote ? comment.userVote : 0}/>
                        </span>
                    );
                }) : ""}
    
                {replying ? <div class="submitCommentDiv" ref={portalRef}>
                            <Editable
                                    text={commentDraft}
                                    placeholder={"Add a reply"}
                                    childRef={inputRef}
                                    finishEdits={sendComment}
                                    type="commentInput"
                                    enabled={true}
                                    alwaysOn={true}
                                    style={{whiteSpace: "pre-wrap"}}
                                    
                                    >
                                    <MentionsInput 
                                    value={commentDraft} 
                                    placeholder={"Add a reply"}
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
                            </div> : ""}
        </Card> : ""}
        </Fragment>
    );
}
export {LoadingComment, CommentCard};