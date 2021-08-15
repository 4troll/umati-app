import React from "react";

import {
    Avatar,
    Box,
    Card,
    CardContent,
	makeStyles,
	CardHeader
} from '@material-ui/core';

import UserLink from "./UserLink.js";
import UmatiLink from "./UmatiLink.js";

import {
    Link
  } from "react-router-dom";

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

function PostCard (props) {
    const classes = useStyles();
    const postData = props.data;

    const authorData = postData.authorData;
    const umatiData = postData.umatiData;
    const hostIndication = props.indicateHost ? umatiData : null;

    const bodySpacing = postData.photo ? "30px" : "0px"
    
    return (
        <div key={postData.postId} className="PostCardContainer" style={{marginTop: "5px"}}>
            <Link to={"/u/" + (props.umatiname || umatiData.umatiname) + "/comments/" + postData.postId} style={{textDecoration:"none"}}>
                <Card className={classes.root}>
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
            </Card>
        </Link>
    </div>

    );
}

export default PostCard;