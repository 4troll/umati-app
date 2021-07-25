import React, { useEffect,useLayoutEffect, useRef, useState, Fragment } from "react";

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
import { Skeleton } from '@material-ui/lab';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import AddIcon from '@material-ui/icons/Add';

import UmatiCard from "./components/UmatiCard.js";

import { Cookies, useCookies } from 'react-cookie';

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

    const [umatiData, setUmatiData] = useState([]);
    const [loadCards, setLoadCards] = useState([]);

    const [token, setToken] = useCookies(["token"]);
    
    
    function loadCard () {
        return (
            <Card className={classes.root}>
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

    useLayoutEffect (() => {

        async function fetchUmatiData() {
            let response = await fetch("/api/fetchUmatis/" + window.location.search, {
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
                    setUmatiData(json);
                    return json;
                    
                })
                .catch(e => {
                    console.error(e);
                    return error;
                });
            }
        }

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
            { loading ? loadCards : 
            (umatiData.map(function (umati,i) {
                return (
                    <UmatiCard key={i} data={umati}/>
                );
            }))
            }
            </Container>
		</Box>
        {
            (loading || (!token.token)) ? null : 
        
            <Fab color="primary" aria-label="add" href="/umatis/createUmati" 
            style={{margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed'}}>
                <AddIcon />
            </Fab>
        }
        </Fragment>
    );
}

export default Umatis;