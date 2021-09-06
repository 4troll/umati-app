import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";


import {useParams} from "react-router-dom";
import Editable from "./Editable";

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

import { MentionsInput, Mention } from "react-mentions";

import MentionSuggestionStyle from "../styles/MentionSuggestionStyle.js";

import UserLink from "./UserLink.js";
import UmatiLink from "./UmatiLink.js";

import RSRR from "react-string-replace-recursively";
import { mdconfig } from "../config/markdown";


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


function CommentCard(props) {
    const comment = props.commentData;
    const commenterData = comment.commenterData;
    const loggedIn = props.loggedIn;
    const userVote = props.userVote;

    const [voteStatus,setVoteStatus] = useState(comment.userVote || 0);
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
    
    return (
        <Card 
        // className={classes.root} 
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
                <p>{RSRR(mdconfig)(comment.content)}</p>		
                </Box>
            </CardContent>
            <Box style={{ alignItems: 'center',
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: "rgba(0, 0, 0, 0.12)"}}>
            
            <Tooltip title={loggedIn ? "Like" : "Only Umati accounts can like posts"} placement="left">
                <IconButton
                color={determineColor(1,voteStatus)}
                aria-label="like" component="span"
                onClick={() => {setVote(1)}}
                >
                    <ThumbUpIcon />
                </IconButton>
            </Tooltip>

            <span>{(comment.voteCount || 0) - (comment.userVote || 0) + voteStatus}</span>

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
    </Card>
    );
}
export default CommentCard;