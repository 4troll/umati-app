import React, { useEffect,useLayoutEffect, useRef, useState, Fragment } from "react";

import {
    Avatar,
    Box,
    Card,
    CardContent,
	makeStyles,
	CardHeader,
    Button,
    IconButton,
    ThemeProvider,
    createTheme,
    Tooltip
} from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import FlagIcon from '@material-ui/icons/Flag'; 

import UserLink from "./UserLink.js";
import UmatiLink from "./UmatiLink.js";

import { Skeleton } from '@material-ui/lab';

import RSRR from "react-string-replace-recursively";
import { mdconfig } from "../config/markdown";

import Image from "material-ui-image"
import ReactTimeAgo from 'react-time-ago'

const slugify = require('slugify');
const slugSettings = {
    replacement: '_',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: true,     // strip special characters except replacement, defaults to `false`
    locale: 'vi',       // language code of the locale to use
    trim: true         // trim leading and trailing replacement chars, defaults to `true`
  }

import {
    Link
  } from "react-router-dom";

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
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

// function clickCard(umatiname,postid) {
//     window.location.href = "/u/" + umatiname + "/comments/" + postid;
// }

function createSubHeader (authorData,umatiData, postData) {
    return (
        <span style={{
            alignItems: "left",
            display: 'flex',
            flexDirection: 'row',
        }}>
            <b>{umatiData ? <UmatiLink data={umatiData}/> : ""}</b>
            <span>
            {(umatiData && authorData) ? <span>&nbsp; &#183; &nbsp;</span> : ""}
            {authorData ? " Posted by " : ""}
            {(authorData && authorData.displayname) ? authorData.displayname : ""} 
            {(authorData && authorData.displayname) ? " (" : ""}
            {authorData ? <UserLink data={authorData}/> : ""}
            {(authorData && authorData.displayname) ? ")" : ""}
            </span>
            <span>&nbsp; &#183; &nbsp;</span>
            <ReactTimeAgo date={postData.creationDate} locale="en-US" timeStyle="round"/>
        </span>
    )
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

function LoadPostCard (main) {
    // const classes = useStyles();

    return (
        
            
        <Card style={{display: "flex", marginTop: "5px"}} variant="outlined">

            <Box style={{ alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: "rgba(0, 0, 0, 0.33)"  }}>
            
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


            <IconButton color="secondary" aria-label="flag" component="span" disabled={true}>
                <FlagIcon />
            </IconButton>
            </Box>
            <Box
                    sx={{
                    alignItems: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    width: "100%"
                    }}
                >
            <CardHeader
                // avatar={
                // <Avatar
                //     variant="circle"
                //     alt={authorData.displayname}
                //     src={authorData.avatar}
                //     style={{height:32+"px", width:32+"px"}}
                //     />
                // }
                title={
                    <Skeleton animation="wave" height={10} width={160} style={{ marginBottom: 6 }} />
                }
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
                    {/* {postData.photo ? 
                    
                    <img style={{
                    maxHeight:"720px",
                    objectFit: "contain"
                    }}/>
                    
                    : ""} */}
                    <React.Fragment>
                        <Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
                        <Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
                        <Skeleton animation="wave" height={10} width="80%" />
                    </React.Fragment>
                </Box>
            </CardContent>
            </Box>
        </Card>

    );
}



function PostCard (props) {
    const classes = useStyles();
    const postData = props.data;
    const loggedIn = props.loggedIn;

    const authorData = postData.authorData;
    const umatiData = postData.umatiData;
    const hostIndication = props.indicateHost ? umatiData : null;
    const bodySpacing = postData.photo ? "30px" : "0px"

    const [voteStatus,setVoteStatus] = useState(postData.userVote || 0);
    const [loadingVote,setLoadingVote] = useState(false);

    async function handleVote(originalVote,targetVote) {
		var voteData;
        console.log("sent")
        setLoadingVote(true);
		try {
			voteData = {
				"vote": targetVote
			}
            // console.log(formData);
			await fetch("/api/voteOnPost/" + postData.postId, {
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
    useEffect (() => {
        
    }, []);


    
    return (
        <div key={postData.postId} className="PostCardContainer" style={{marginTop: "5px"}}>
            
                
            <Card className={classes.root} variant="outlined">

                <Box style={{ alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: "rgba(0, 0, 0, 0.33)"}}>
                
                <Tooltip title={loggedIn ? "Like" : "Only Umati accounts can like posts"} placement="left">
                    <IconButton
                    color={determineColor(1,voteStatus)}
                    aria-label="like" component="span"
                    onClick={() => {setVote(1)}}
                    >
                        <ThumbUpIcon />
                    </IconButton>
                </Tooltip>

                <span>{(postData.voteCount || 0) - (postData.userVote || 0) + voteStatus}</span>

                <Tooltip title={loggedIn ? "Dislike" : "Only Umati accounts can dislike posts"} placement="left">
                    <IconButton 
                    color={determineColor(-1,voteStatus)}
                    aria-label="dislike" 
                    component="span"
                    onClick={() => {setVote(-1)}}>
                        <ThumbDownIcon />
                    </IconButton>
                </Tooltip>


                <IconButton color="secondary" aria-label="flag" component="span">
                    <FlagIcon />
                </IconButton>
                </Box>

                <Link to={props.main ? "#" : "/u/" + (props.umatiname || umatiData.umatiname) + "/comments/" + postData.postId + "/" + slugify(postData.title, slugSettings)} style={{textDecoration:"none", color:"inherit", flex: "1", cursor:(props.main ? "default" : "pointer")}}>
                    
                    <CardHeader
                        // avatar={
                        // <Avatar
                        //     variant="circle"
                        //     alt={authorData.displayname}
                        //     src={authorData.avatar}
                        //     style={{height:32+"px", width:32+"px"}}
                        //     />
                        // }
                        title={
                            (postData.title)
                        }
                        subheader={createSubHeader(authorData, hostIndication, postData)}
                    />
                    
                    <CardContent>
                    
                        <Box
                            sx={{
                            alignItems: 'left',
                            display: 'flex',
                            flexDirection: 'column'
                            }}
                        >
                            {postData.photo ? 
                            
                            <Image src={postData.photo} style={{
                            maxHeight:"720px",
                            objectFit: "contain"
                            }}/>
                            
                            : ""}
                            <p style={{marginTop: bodySpacing}}>{postData.body ? RSRR(mdconfig)(postData.body) : "This post has no body."}</p>
                        </Box>
                    </CardContent>
                </Link>
            </Card>
    </div>
    );
}

export {LoadPostCard, PostCard};