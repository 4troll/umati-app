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

function createSubHeader (authorData) {
    if (authorData.username) {
        if (authorData.displayname) {
            return (
                <span style={{
                    alignItems: "left",
                    display: 'flex',
                    flexDirection: 'row',
                }}>
                {"" + authorData.displayname} 
                {" ("}
                <UserLink data={authorData}/>
                {")"}
                </span>
            )
        }
        else {
            <span style={{
                alignItems: "left",
                display: 'flex',
                flexDirection: 'row',
            }}>
            
            <UserLink data={authorData}/>
            
            </span>
        }
    } 
}

function PostCard (props) {
    const classes = useStyles();
    const umatiname = props.umatiname;
    const postData = props.data;
    const authorData = postData.authorData

    const bodySpacing = postData.photo ? "30px" : "0px"
    
    console.log(authorData);
    return (
        <div key={postData.postId} className="PostCardContainer" style={{marginTop: "5px"}}>
            <Link to={"/u/" + umatiname + "/comments/" + postData.postId} style={{textDecoration:"none"}}>
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
                    subheader={createSubHeader(authorData)}
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
                        maxHeight:"1080px",
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