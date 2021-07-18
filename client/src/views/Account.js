import React, { useEffect,useLayoutEffect, useRef, useState, Component } from "react";

import {useParams} from "react-router-dom";
import Editable from "./components/Editable";

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
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import cookieParser from "cookie-parser";

const useStyles = makeStyles({
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
});


function Account(props) {
	const [userDat, setUserDat] = useState({});
	const [loading, setLoading] = useState(true);
	const [editable, setEditable] = useState(false);
	const { username } = useParams();
	const classes = useStyles();

	const inputRef = useRef();
  	const [desctext, setDescText] = useState("");

	  async function getUserData () {
		let response = await fetch("/api/userData/" + username, {
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
				setUserDat(json);
				if (json.description) {
					setDescText(userDat.description);
				}
				if (username == Cookies.get("username")) {
					setEditable(true);
				}
				return json;
			})
			.catch(e => {
				console.error(e);
			});
		}
	}

	useLayoutEffect (() => {
		setLoading(true);
		getUserData().then(json => {
			setLoading(false);
		}).catch(error => {
			console.error(error);
		});
	}, []);

	async function setDescription() {
		try {
			console.log(desctext);
			var descData = {
				"description": desctext
			}
			let response = await fetch("/api/editDescription/" + username, {
				method: "post",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(descData),
				credentials: "include"
			});
			if (!response.ok) {
				throw new Error("HTTP error, status = " + response.status);
			}
			else {
				await response.json()
				.then(json => {
					console.log(json);
				})
				.catch(e => {
					console.error(e);
				});
			}
		}
		catch(e) {
			console.error(e);
		}
	}
	return (
		<Box
		sx={{
			backgroundColor: 'background.default',
			minHeight: '100%',
			py: 3
		}}
	  	>
			<Container maxWidth="lg">
						<Card className={classes.root}>
							<CardHeader
								avatar={
								loading ? (
									<Skeleton animation="wave" variant="circle" width={80} height={80} />
								) : (
									<Avatar
									alt="Ted talk"
									src=""
									style={{height:80+"px", width:80+"px"}}
									/>
								)
								}
								action={
								loading ? null : (
									<IconButton aria-label="settings">
									<MoreVertIcon />
									</IconButton>
								)
								}
								title={
								loading ? (
									<Skeleton animation="wave" height={10} width={160} style={{ marginBottom: 6 }} />
								) : (
									"Mustafa Abdulameer"
								)
								}
								subheader={loading ? <Skeleton animation="wave" height={10} width={80} /> : ("@" + userDat.username) }
							/>
							<CardContent>
								<Box
									sx={{
									alignItems: 'left',
									display: 'flex',
									flexDirection: 'column'
									}}
								>
									{loading ? (
										<React.Fragment>
											<Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
											<Skeleton animation="wave" height={10} width="80%" />
										</React.Fragment>
										) : (
										<Editable
											text={desctext || userDat.description}
											placeholder={"Write a fancy description"}
											childRef={inputRef}
											finishEdits={() => setDescription()}
											type="input"
											enabled={editable}
											>
											<TextField
												ref={inputRef}
												type="text"
												name="task"
												placeholder={"Write a fancy description"}
												multiline={true}
												fullWidth={true}
												value={desctext || userDat.description}
												onChange={e => setDescText(e.target.value)}
												onFocus={e => setDescText(e.target.value)}
											/>
										</Editable>
									)}				
								</Box>
							</CardContent>
						</Card>
			</Container>
		</Box>
	);
}

export default Account;