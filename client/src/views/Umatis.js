import React, { useEffect,useLayoutEffect, useRef, useState, Fragment } from "react";

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
    Fab,
    Tooltip
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import AddIcon from '@material-ui/icons/Add';

import UmatiCard from "./components/UmatiCard.js";

import { Cookies, useCookies } from 'react-cookie';

import InfiniteScroll from "react-infinite-scroll-component";


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



function Umatis(props) {
    const classes = useStyles();

    const [loading, setLoading] = useState(true);
    const [allCaughtUp, setAllCaughtUp] = useState(false);

    const [umatiData, setUmatiData] = useState([]);
    const [loadCards, setLoadCards] = useState([]);

    const [token, setToken] = useCookies(["token"]);
    
    const location = useLocation();
  	const history = useHistory();
    
    function loadCard () {
        return (
            <Card className={classes.root} variant="outlined">
            <CardHeader
                avatar={<Skeleton animation="wave" variant="rounded" width={64} height={64} />}
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

    const fetchUmatiData = async() => {
        let response = await fetch("/api/fetchUmatis" + window.location.search, {
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
                setUmatiData(umatiData.concat(json));
                var searchParams = new URLSearchParams(window.location.search);
                const limit = parseInt(searchParams.get("limit")) || 25;
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
            await fetchUmatiData()
            .then(function (json) {
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

    useEffect (() => {
        document.title = "Umatis";
		setLoading(true);
        let loadlist = []
        for (let i = 0; i < 10; i++) {
            loadlist.push(loadCard());
        }
        setLoadCards(loadlist);

        async function fetchUmatis() {
            let json = await fetchUmatiData();
            if (json) {
                return json;
            }
        }
        fetchUmatis().then(a => {
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
            }}>
			<Container maxWidth="lg">
            <h1>Umatis</h1> 
            { loading ? loadCards :
            <InfiniteScroll
            dataLength={umatiData.length}
            next={loadMorePages}
            hasMore={!allCaughtUp}
            loader={loadCard()}
            >
            {
            umatiData.map(function (umati,i) {
                return (
                    <UmatiCard key={i} data={umati} loggedIn={token.token ? true : false} joined={umati.joined}/>
                );
            })
            }
            </InfiniteScroll>
            }
            </Container>
		</Box>
        {
            (loading) ? null : 
            <Tooltip title={token.token ? "Create umati" : "Only Umati accounts can create umatis"} placement="left">
            <Fab color="primary" aria-label="add" href="/umatis/createUmati" 
            style={{margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed'}}>
                <AddIcon />
            </Fab>
            </Tooltip>
        }
        </Fragment>
    );
}

export default Umatis;