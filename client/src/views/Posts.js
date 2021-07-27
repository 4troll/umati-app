import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";


import {useParams} from "react-router-dom";

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
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';

import { Cookies, useCookies } from 'react-cookie';
import validator from "validator";
import jwt_decode from "jwt-decode";

import PostCard from "./components/PostCard.js";
import UserLink from "./components/UserLink.js";

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


function Posts(props) {
	const [token, setToken] = useCookies(["token"]);

	const [loading, setLoading] = useState(true);

	const classes = useStyles();

	const [loadCards, setLoadCards] = useState([]);
	const [postsData, setPostsData] = useState([]);



    function loadCard (main) {
        return (
            <Card className={classes.root} style={{marginTop: "5px"}}>
            <CardHeader
                avatar={
				main ? 
				<Skeleton animation="wave" variant="circle" width={64} height={64} />
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


    useLayoutEffect (() => {
		// const cookieDat = token.token ? jwt_decode(token.token) : null ;
		async function getPostsData () {
			console.log("initiating post fetch");
            let response = await fetch("/api/fetchPosts" + window.location.search, {
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
                .then(function (postData) {
                    setPostsData(postData);
                    return postData;
                })
                .catch(e => {
                    console.error(e);
                    return e;
                });
            }
		}

		setLoading(true);
		let loadlist = []
        for (let i = 0; i < 10; i++) {
            loadlist.push(loadCard());
        }
        setLoadCards(loadlist);

		getPostsData().then(a => {
            setLoading(false);
        })
	}, []);

    return (
		<Fragment>
			<Box
			sx={{
				backgroundColor: 'background.default',
				minHeight: '100%',
				py: 3
			}}
			>
				<Container maxWidth="lg">
                    <div key="posts" className="PostsView" style={{marginTop: "30px"}}>
                    { loading ? loadCards : 
                        (postsData.map(function (post,i) {
                            return (
                                <PostCard key={i} data={post} umatiname={post.hostUmatiname} indicateHost={true}/>
                            );
                        }))
                    }
                    </div>

				</Container>
			</Box>
		</Fragment>
    );
}

export default Posts;