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

function createSubHeader (authorData,umatiData) {
    return (
        <span style={{
            alignItems: "left",
            display: 'flex',
            flexDirection: 'row',
        }}>
            <b>{umatiData ? <UmatiLink data={umatiData}/> : ""}</b>
            {(umatiData && authorData) ? <span>&nbsp; &#183; &nbsp;</span> : ""}
            {authorData ? " Posted by " : ""}
            {(authorData && authorData.displayname) ? authorData.displayname : ""} 
            {(authorData && authorData.displayname) ? " (" : ""}
            {authorData ? <UserLink data={authorData}/> : ""}
            {(authorData && authorData.displayname) ? ")" : ""}
        </span>
    )
}

function determineColor(current,num) {
    if (current != num) {
        return "aaa";
    }
    else if (num == 1) {
        return "primary";
    }
    else if (num == -1) {
        return "secondary";
    }
    return "aaa";
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
            
                
            <Card className={classes.root}>

                <Box style={{ alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column'  }}>
                
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

                <Link to={"/u/" + (props.umatiname || umatiData.umatiname) + "/comments/" + postData.postId} style={{textDecoration:"none", color:"inherit", flex: "1"}}>
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
                    subheader={createSubHeader(authorData, hostIndication)}
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
                        
                        <img src={postData.photo} style={{
                        maxHeight:"720px",
                        objectFit: "contain"
                        }}/>
                        
                        : ""}
                        <p style={{marginTop: bodySpacing}}>{postData.body ? postData.body : "This post has no body."}</p>
                    </Box>
                </CardContent>
                </Link>
            </Card>
    </div>
    );
}

export default PostCard;