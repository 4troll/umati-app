import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import ScrollLock, { TouchScrollable } from 'react-scrolllock';

import { useSnackbar } from 'notistack';

import Cookies from 'universal-cookie';

import Editable from "./components/Editable";

 
const cookies = new Cookies();

function Copyright() {
return (
	<Typography variant="body2" color="textSecondary" align="center">
	{'Copyright © '}
	<Link color="inherit" href="/">
		umati
	</Link>{' '}
	{new Date().getFullYear()}
	{'.'}
	</Typography>
);
}

const useStyles = makeStyles((theme) => ({
root: {
	height: '100vh',
},
image: {
	backgroundImage: 'url(https://source.unsplash.com/random?africa)',
	backgroundRepeat: 'no-repeat',
	backgroundColor:
	theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
	backgroundSize: 'cover',
	backgroundPosition: 'left',
},
paper: {
	margin: theme.spacing(8, 4),
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center'
},
avatar: {
	margin: theme.spacing(1),
	backgroundColor: theme.palette.secondary.main,
},
form: {
	width: '100%', // Fix IE 11 issue.
	marginTop: theme.spacing(1),
},
submit: {
	margin: theme.spacing(3, 0, 2),
},
}));

export default function Login() {
	const classes = useStyles();
	const [username,setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRemember] = useState("");
	const [showPassword,setShow] = useState("");

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const [loggingIn, setLoggingIn] = useState(false);


	const inputRef = useRef();
	const [textText, setTextText] = useState("");

	// window.onscroll = function () { window.scrollTo(0, 0); }; // prevent scroll
	function validateForm() {
		return username.length > 0 && password.length > 0;
	}

	var thirtymins = new Date(new Date().getTime() + 30 * 60 * 1000);
	var hundreddays = new Date(new Date().getTime() + 100 * 24 * 60 * 60 * 1000);
	async function postJson(url, body) {
		let response = await fetch(url, {
			method: "post",
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
			.then(function (json) {
				let accessToken = json.token;
				let refreshToken = json.refreshToken;
				window.location.href = "/posts?welcome";
				cookies.set("token", accessToken, { sameSite: "lax", secure: true, expires: thirtymins, path: "/" });
				cookies.set("refreshToken", refreshToken, { sameSite: "lax", secure: true, expires: hundreddays, path: "/"});
				
				return json;
			});
		}
	}
	
	async function handleSubmit(event) {
		event.preventDefault();
		var loggedAccount = {
			"username": username,
			"password": password
		}
		setLoggingIn(true);
		const key = enqueueSnackbar("Logging in...", { 
			variant: "info",
			persist: true,
		});
		await postJson("/api/loginAccount", loggedAccount)
		.then(function (json) {
			// enqueueSnackbar("Logged in!", { 
			// 	variant: "success"
			// });
			return json;
		})
		.catch((error) => {
			enqueueSnackbar("Something went wrong.", { 
				variant: "error"
			});
			return error;
		});
		closeSnackbar(key);
		setLoggingIn(false);
	}

	function handleClickShowPassword() {
		setShow(!showPassword);
	};
	
	function handleMouseDownPassword (event) {
		event.preventDefault();
	};
	
	return (
		<Grid container component="main" style={{height:"100vh"}}>
		<CssBaseline />
		<ScrollLock isActive={true} />
		<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
			<div className={classes.paper}>
			<Avatar className={classes.avatar}>
				<LockOutlinedIcon />
			</Avatar>
			<Typography component="h1" variant="h5">
				Login
			</Typography>
			{/* <Editable
			text={textText}
			placeholder={"Test"}
			childRef={inputRef}
			finishEdits={function(){}}
			type="input"
			enabled={true}
			style={{whiteSpace: "pre-wrap"}}
			>
			<TextField
			variant="outlined"
			margin="normal"
			required
			fullWidth
			id="test"
			label="Test"
			name="test"
			autoComplete="test"
			value={textText}
			onChange={(e) => setTextText(e.target.value)}
			autoFocus
			multiline
			/>
			</Editable> */}
			<form className={classes.form} onSubmit={handleSubmit} noValidate>
				<TextField
				variant="outlined"
				margin="normal"
				required
				fullWidth
				id="username"
				label="Username"
				name="username"
				autoComplete="username"
				onChange={(e) => setUsername(e.target.value)}
				autoFocus
				/>
				<TextField
				variant="outlined"
				margin="normal"
				required
				fullWidth
				name="password"
				label="Password"
				id="password"
				autoComplete="current-password"
				onChange={(e) => setPassword(e.target.value)}
				type={showPassword ? 'text' : 'password'}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
						  <IconButton
							aria-label="toggle password visibility"
							onClick={handleClickShowPassword}
							onMouseDown={handleMouseDownPassword}
							edge="end"
							
						  >
							{showPassword ? <Visibility /> : <VisibilityOff />}
						  </IconButton>
						</InputAdornment>
					)
				}}
				/>
				<FormControlLabel
				control={
				<Checkbox value="remember"
				color="primary" 
				onClick={(e) => setRemember(e.target.checked)}
				/>}
				label="Remember me"
				/>
				<Button
				type="submit"
				fullWidth
				variant="contained"
				color="primary"
				className={classes.submit}
				disabled={!validateForm()}
				onSubmit={handleSubmit}
				>
				Login
				</Button>
				<Grid container>
				<Grid item xs>
					<Link href="#" variant="body2">
					Forgot password?
					</Link>
				</Grid>
				<Grid item>
					<Link href="/register" variant="body2">
					{"Don't have an account? Sign Up"}
					</Link>
				</Grid>
				</Grid>
				<Box mt={5}>
				<Copyright />
				</Box>
			</form>
			</div>
		</Grid>
		<Grid item xs={false} sm={4} md={7} className={classes.image} />
		</Grid>
	);
}