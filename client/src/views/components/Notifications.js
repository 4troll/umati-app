import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";


import {useParams, useHistory, useLocation, Link} from "react-router-dom";

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

const slugify = require('slugify');
const slugSettings = {
    replacement: '_',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: true,     // strip special characters except replacement, defaults to `false`
    locale: 'vi',       // language code of the locale to use
    trim: true         // trim leading and trailing replacement chars, defaults to `true`
  }

import InfiniteScroll from "react-infinite-scroll-component";

import CheckCircleIcon from '@material-ui/icons/CheckCircle';


import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';

import { Cookies, useCookies } from 'react-cookie';
import validator from "validator";
import jwt_decode from "jwt-decode";

import UserLink from "./UserLink.js";
import UmatiLink from "./UmatiLink.js";

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

function loadCard (props) {
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

function NotifCard (props) {

    return (
        <Card 
        // className={classes.root} 
        style={{backgroundColor: ((props.seen == true) ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 255, 0.05)")}}
        variant="outlined">
        <Link onClick={() => {props.onRead(props.id)}}to={props.link} style={{textDecoration:"none", color:"inherit", flex: "1"}}>
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
                title={props.title}
                subheader={props.subheader}
            />
            <CardContent>
                <Box
                    sx={{
                    alignItems: 'left',
                    display: 'flex',
                    flexDirection: 'column'
                    }}
                >
                <p>{props.description}</p>		
                </Box>
            </CardContent>
        </Link>
    </Card>

    );
}



function Notifications(props) {
	const [token, setToken] = useCookies(["token"]);

	const [loading, setLoading] = useState(true);
    const [allCaughtUp, setAllCaughtUp] = useState(false);

    const [page, setPage] = useState(1);

	const classes = useStyles();

	const [loadCards, setLoadCards] = useState([]);
	const [notifData, setNotifData] = useState([]);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    useEffect (() => {
		const cookieDat = token.token ? jwt_decode(token.token) : null ;
		setLoading(true);
		let loadlist = []
        for (let i = 0; i < 3; i++) {
            loadlist.push(loadCard());
        }
        setLoadCards(loadlist);

		getNotifData().then(a => {
            setLoading(false);
        })
	}, []);

    

    const getNotifData = async () => {
        try {
            console.log("initiating post fetch");
            let response = await fetch("/api/fetchNotifs?page=" + page, {
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
                    window.dispatchEvent(new CustomEvent('resize'));
                    setNotifData(notifData.concat(json));
                    console.log("h");
                    const limit = 25;
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
            var nextPage = page + 1;
            const limit = 25;
            await getNotifData()
            .then(function (json) {
                setPage(nextPage);
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

    const umatilink = (data) => {
        return (
            <UmatiLink data={data}/>
        )
    }
    const postDescription = (title,data) => {
        return (
            <span>
                <span>{"\"" + title + "\"" + " by "}</span>
                <UserLink data={data}/>
            </span>
        )
    }
    const readNotif = async (id) => {
        console.log("getting notif amount")
        let body = {
            readId: id
        }
        console.log(id);
        try {
            let response = await fetch("/api/readNotif", {
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
                    if (json.modifiedCount > 0) {
                        let currentNotifList = [...notifData];
                        for (let i = 0; i < currentNotifList.length; i++) {
                            if (currentNotifList[i].notifId == body.readId) {
                                currentNotifList[i].seen = true;
                                break;
                            }
                    }
                    setNotifData(currentNotifList);
                    props.subNewNotifs();
                    }
                    
                    return currentNotifList;
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

    const dismissNotifs = async (id) => {
        if (notifData.length != 0) {
            console.log("dismissing notifs")
            let body = {
                dismiss: true
            }
            console.log(id);
            try {
                let response = await fetch("/api/dismissNotifs", {
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
                        if (json.modifiedCount > 0) {
                            setNotifData([]);
                            props.dismissNotifs();
                            enqueueSnackbar("Notifcations successfully dismissed!", { 
                                variant: "success"
                            });
                        }
                        
                        return [];
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
            enqueueSnackbar("No notifications to dismiss.", { 
				variant: "error"
			})
        }
        
    }

    return (
		<Fragment>
			<Box
			sx={{
				backgroundColor: 'background.default',
				minHeight: '100%',
                minWidth: '100%',
				py: 3
			}}
            style={{minWidth:"350px"}}
			>
				<Container maxWidth={1/4}>
                    <span className="right-hold flexbox" style= {{justifyContent:"space-between", width:"100%", margin:"-20px 0px"}}>
                        <h3>Notifications</h3>
                        <span>
                        {((!loading) && (notifData.length != 0)) ? <Button 
						onClick={() => {
                            dismissNotifs()
						}}
						variant="outlined" type="button" color="primary">
							Dismiss
						</Button> : ""}
                        </span>
                    </span>
                    <div key="notifications" className="NotifsView" style={{marginTop: "30px"}}>
                    <InfiniteScroll
                    dataLength={notifData.length}
                    next={loadMorePages}
                    hasMore={!allCaughtUp}
                    loader={loadCard}
                    height={400}
                    >
                        { loading ? loadCards :
                            <div >
                            {
                            (notifData.length == 0) ? 
                            
                            <div style={{textAlign:"center", verticalAlign:"middle", height:"100%"}}>
                                <CheckCircleIcon color="primary" style={{ fontSize: 80 }}/> <br/>
                                <span>All caught up!</span>
                            </div>
                            
                            :
                            (notifData.map(function (notification,i) {
                                let content = {
                                    title: "",
                                    subheader: "",
                                    description: "",
                                    onRead: readNotif
                                }
                                let umatiData = notification.umatiData;
                                let postData = notification.postData;
                                let userData = notification.userData;
                                if (notification.type == "newPost") {
                                    content.title = "New post";
                                    content.subheader = umatilink(umatiData);
                                    content.description = postDescription(postData.title,userData);
                                    content.link = "/u/" + (umatiData.umatiname) + "/comments/" + postData.postId + "/" + slugify(postData.title, slugSettings);
                                    content.seen = notification.seen ? true : false;
                                    content.id = notification.notifId;
                                }
                                else if (notification.type == "voteMilestone") {
                                    content.title = "⬆ Post reached " + notification.milestone + " reputation!";
                                    content.subheader = umatilink(umatiData);
                                    content.description = "Your post \"" + postData.title + "\" reached " + notification.milestone + " reputation. Hooray! 🥳";
                                    content.link = "/u/" + (umatiData.umatiname) + "/comments/" + postData.postId + "/" + slugify(postData.title, slugSettings);
                                    content.seen = notification.seen ? true : false;
                                    content.id = notification.notifId;
                                }
                                else if (notification.type == "voteMilestoneComment") {
                                    content.title = "⬆ Comment reached " + notification.milestone + " reputation!";
                                    content.subheader = umatilink(umatiData);
                                    content.description = "Your comment under \"" + postData.title + "\" reached " + notification.milestone + " reputation. Hooray! 🥳";
                                    content.link = "/u/" + (umatiData.umatiname) + "/comments/" + postData.postId + "/" + slugify(postData.title, slugSettings);
                                    content.seen = notification.seen ? true : false;
                                    content.id = notification.notifId;
                                }
                                else if (notification.type == "newComment") {
                                    content.title = "💬 @" + userData.username + " replied to your post";
                                    content.subheader = umatilink(umatiData);
                                    content.description = notification.commentData.content;
                                    content.link = "/u/" + (umatiData.umatiname) + "/comments/" + postData.postId + "/" + slugify(postData.title, slugSettings);
                                    content.seen = notification.seen ? true : false;
                                    content.id = notification.notifId;
                                }
                                return (
                                    NotifCard(content)
                                );
                            }))
                            }
                            </div>
                        }
                    </InfiniteScroll>
                    </div>
				</Container>
			</Box>
		</Fragment>
    );
}

export default Notifications;