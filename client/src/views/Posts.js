import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";


import {useParams, useHistory, useLocation} from "react-router-dom";

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

import InfiniteScroll from "react-infinite-scroll-component";


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

import { useSnackbar } from 'notistack';


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
    const [allCaughtUp, setAllCaughtUp] = useState(false);

	const classes = useStyles();

	const [loadCards, setLoadCards] = useState([]);
	const [postsData, setPostsData] = useState([]);

    const location = useLocation();
  	const history = useHistory();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();


    useEffect (() => {
		const cookieDat = token.token ? jwt_decode(token.token) : null ;
        var searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has("welcome") && cookieDat) {
            searchParams.delete("welcome");
            history.replace({
                search: searchParams.toString(),
            });
            enqueueSnackbar("Welcome, @" + cookieDat.username + "!", { 
                variant: "success"
            });
        }
		
        

		setLoading(true);
		let loadlist = []
        for (let i = 0; i < 10; i++) {
            loadlist.push(LoadPostCard());
        }
        setLoadCards(loadlist);

		getPostsData().then(a => {
            setLoading(false);
        })
	}, []);
    const getPostsData = async () => {
        try {
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
                .then(function (json) {
                    setPostsData(postsData.concat(json));
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
                if (json.length < 1) {
                    setAllCaughtUp(true);
                }
                return json;
            })
            .catch(function (e) {
                setAllCaughtUp(true);
                return e;
            });
        }
        catch(e) {
            console.error(e);
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
			>
				<Container maxWidth="lg">
                    <span className="right-hold flexbox" style= {{justifyContent:"space-between", width:"100%", marginBottom:"-20px"}}>
                        <h1>Posts</h1>
                        <SortDropdown/>
                    </span>
                    <div key="posts" className="PostsView" style={{marginTop: "30px"}}>
                    <InfiniteScroll
                    dataLength={postsData.length}
                    next={loadMorePages}
                    hasMore={!allCaughtUp}
                    loader={<LoadPostCard/>}
                    >
                        { loading ? loadCards : 
                            (postsData.map(function (post,i) {
                                return (
                                    <PostCard key={i} data={post} umatiData={post.umatiData} indicateHost={true} loggedIn = {token.token ? true : false}/>
                                );
                            }))
                        }
                    </InfiniteScroll>
                    </div>
				</Container>
			</Box>
		</Fragment>
    );
}

export default Posts;