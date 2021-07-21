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

    const [umatiCards, setUmatiCards] = useState([]);
    const [loadCards, setLoadCards] = useState([]);

    function umatiCard (props) {
        const data = props.data
        return (
            <div key={data.umatiname} className="cardContainer" onClick={() => clickCard(data.umatiname)}>
                <Card className={classes.root}>
                <CardHeader
                    avatar={
                    <Avatar
                        alt={data.displayname}
                        // src={selectedAvatarFile}
                        // style={{height:64+"px", width:64+"px"}}
                        />
                    }
                    title={
                        (data.displayname ? data.displayname : "u/" + data.umatiname)
                    }
                    subheader={(data.displayname ? ("u/" + data.umatiname) : "")}
                />
                <CardContent>
                    <Box
                        sx={{
                        alignItems: 'left',
                        display: 'flex',
                        flexDirection: 'column'
                        }}
                    >
                        <h3>{data.ownerData ? data.ownerData.username : ""}</h3>
                    </Box>
                </CardContent>
            </Card>
        </div>
    
        );
    }
    
    
    function loadCard () {
        return (
            <Card className={classes.root}>
            <CardHeader
                avatar={<Skeleton animation="wave" variant="circle" width={64} height={64} />}
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

    
    async function getUserDataFromId (id) {
        let returnData;
        let response = await fetch("/api/user/id=" + id, {
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
            .then(json => {
                console.log(json);
                returnData = json;
            })
            .catch(e => {
                console.error(e);
                return e;
            });
        }
        return returnData;
    }

    async function returnTest(stuff) {
        return "test id: " + stuff;
    }

    async function fetchUmatiData() {
        var umatiCardList = [];
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
            .then(async function (json) {
                
                await json.forEach(async function(currentUmati, index){
                    await getUserDataFromId(currentUmati.umatiId)
                    .then(response => {
                        currentUmati.ownerData = response;
                        console.log(currentUmati);
                        umatiCardList.push(
                            <umatiCard data={currentUmati}/>
                        );
                    })
                    .catch (e => {
                        console.error(e);
                    });
                });
                
            })
            .catch(e => {
                console.error(e);
                return error;
            });
        }
        return umatiCardList;
    }

    

    useEffect (() => {
        

		setLoading(true);
        let loadlist = []
        for (let i = 0; i < 10; i++) {
            loadlist.push(loadCard());
        }
        setLoadCards(loadlist);

		fetchUmatiData().then(json => {
            setUmatiCards(json);
			
		})
        .catch(error => {
			console.error(error);
		});
        setLoading(false);
	}, []);

    function clickCard(name) {
        window.location.href = "/u/" + name;
    }

    

    
    return (
        <Fragment>
            <Box
            sx={{
                backgroundColor: 'background.default',
                minHeight: '100%',
                py: 3
            }}>
			<Container maxWidth="lg">
            { loading ? loadCards : umatiCards}
            </Container>
		</Box>
            <Fab color="primary" aria-label="add" href="/umatis/createUmati" 
            style={{margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed'}}>
                <AddIcon />
            </Fab>
        </Fragment>
    );
}

export default Umatis;