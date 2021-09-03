import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";


import {
    Avatar,
    Box,
    Card,
	CardActionArea,
    CardContent,
	makeStyles,
	CardHeader,
	Button,
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



function UmatiCard (props) {
    const classes = useStyles();
    const umatiDat = props.data

	const [joinedUmati, setJoinedUmati] = useState(false);

	useEffect (() => {
        setJoinedUmati(props.joined);
	}, []);

	async function postJson(url, body) {
		let response = await fetch(url, {
			method: "post",
			mode: "cors", 
			body: JSON.stringify(body),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
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
			});
		}
	}

	const toggleJoin = async () => {
		try {
			let body = {
				"join": !joinedUmati
			}
            // console.log(formData);
			await postJson("/api/joinUmati/" + umatiDat.umatiname, body)
			.then(function (data){
				console.log("toggle join " + umatiDat.umatiname);
				setJoinedUmati(!joinedUmati);
				return data;
			})
			.catch(e => {
				
				console.error(e);
				return e;
			});
		}
		catch(e) {
			console.error(e);
			return e;
		}
		finally {
			// setProfileModal(false);
		}
	}
    return (
        <div key={umatiDat.umatiname} className="umatiCardContainer" style={{marginTop: "5px"}}>
			<Link to={"/u/" + umatiDat.umatiname} style={{textDecoration:"none"}}>
                <Card className={classes.root} variant="outlined">
                <CardHeader
                    avatar={
                    <Avatar
                        variant="rounded"
                        alt={umatiDat.displayname ? umatiDat.displayname : umatiDat.umatiname}
                        src={umatiDat.logo}
                        style={{height:64+"px", width:64+"px"}}
                        />
                    }
                    title={
                        (umatiDat.displayname ? umatiDat.displayname : "u/" + umatiDat.umatiname)
                    }
                    subheader={<Fragment>
									{(umatiDat.displayname ? ("u/" + umatiDat.umatiname) : "")}
									<p style={{color:"#ffaa00"}}>{((umatiDat.joinCount || 0) - (umatiDat.joined ? 1 : 0) + (joinedUmati ? 1 : 0)) + (((umatiDat.joinCount || 0) - (umatiDat.joined ? 1 : 0) + (joinedUmati ? 1 : 0)) == 1 ? " member" : " members")}</p>
									</Fragment>
								}
					action= {
						<Fragment>
						{props.loggedIn ? 
							
						<Button onClick={(e) => {
							e.preventDefault();
							toggleJoin();
						}}
						 style={{float:"right", width:"fit-content", marginBottom: "20px"}} variant="contained" type="button" color={joinedUmati ? "" : "primary"}>
						{joinedUmati ? "Leave" : "Join"}
						</Button>
						
						: ""}
						</Fragment>
					}
                />
                <CardContent>
                    <Box
                        sx={{
                        alignItems: 'left',
                        display: 'flex',
                        flexDirection: 'column'
                        }}
                    >
                        <span style={{
                        alignItems: 'left',
                        display: 'flex',
                        flexDirection: 'row',
                        }}> Owner: <UserLink data={umatiDat.ownerData}/></span>
                        <p>{umatiDat.description}</p>
                    </Box>
					
                </CardContent>
				
            </Card>
		</Link>
    </div>

    );
}

export default UmatiCard;