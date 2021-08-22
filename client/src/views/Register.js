import React, { useEffect, useState } from "react";

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
import PeopleOutlineOutlinedIcon from '@material-ui/icons/PeopleOutlineOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import validator from "validator";
import { FormHelperText } from '@material-ui/core';

import ScrollLock, { TouchScrollable } from 'react-scrolllock';

import { useSnackbar } from 'notistack';

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

export default function Register() {
    const classes = useStyles();
	const [email,setEmail] = useState("");
    const [username,setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [passwordCon, setPasswordCon] = useState("");
	const [taken,setTaken] = useState(false);
	const [checkingUsername,setCheckingUsername] = useState(false);
	const [showPassword,setShow] = useState("");

	const [registerMessage,setRegisterMessage] = useState("");

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	// window.onscroll = function () { window.scrollTo(0, 0); }; // prevent scroll

  
	function validateForm() {
		if (username.length == 0) {
			return false;
		}
		if (password.length == 0) {
			return false;
		}
		if (email.length == 0) {
			return false;
		}
		if (passwordCon != password) {
			return false;
		}
		if (usernameValidation()) {
			return false;
		}
		if (checkingUsername) {
			return false;
		}
		return true;
	}


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
				return json;
			})
			.catch(error => {
				return error;
			});
		}
	}

	async function handleSubmit(event) {
		event.preventDefault();
		
		var newAccount = {
			"username": username,
			"email": email,
			"password": password
		}
		await postJson("/api/registerAccount", newAccount)
		.then(function (data) {
			window.location.href = "/login";
			return data;
		})
		.catch((error) => {
			return error;
		});
	}
	

	async function usernameUpdate(username) {
		setUsername(username);
		setTaken(false);
		setCheckingUsername(true);
		var lookup = {
			"username": username
		}
		await postJson("/api/usernameLookup", lookup)
		.then(function (response) {
			setTaken(true);
			return response;
		})
		.catch((error) => {
			return error;
		});
		setCheckingUsername(false);
	}

	function handleClickShowPassword() {
		setShow(!showPassword);
	};
	
	function handleMouseDownPassword (event) {
		event.preventDefault();
	};
	const validatorSettings = { minLength: 4, minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 0, returnScore: true, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 };
	const strengthThreshold = 40;

	function checkPassword() {
		var strength = validator.isStrongPassword(password, validatorSettings);
		if (!(password == passwordCon) && passwordCon.length > 0) {
			return [true, "Passwords don't match"];
		}
		if (strength < strengthThreshold) {
			return [true, "Password not strong enough! Strength: " + strength + "/" + strengthThreshold + ". Try adding numbers, symbols, and uppercase characters!"];
		}
		if (password.length > 100) {
			return [true, "Password too long (>100 char)"];
		}
		return [false, "Strength: " + strength + "/" + strengthThreshold];
	}
	function passwordValidation() {
		var variable = checkPassword()
		return variable[0];
	}
	function checkUsername() {
		if (username.length < 3) {
			return [true, "Username must be at least 3 characters long"];
		}
		if (username.length > 25) {
			return [true, "Username must be less than 25 characters long"];
		}
		if (!validator.isAlphanumeric(username)) {
			return [true, "Username must be alphanumeric (no spaces, only numbers and letters)"];
		}
		if (taken) {
			return [true, "Username is taken"];
		}
		return [false,""];
	}
	function usernameValidation() {
		var variable = checkUsername()
		return variable[0];
	}
	useEffect (() => {
		var searchParams = new URLSearchParams(window.location.search);
		var reason = searchParams.get("to");
		if (reason == "vote") {
			let action = searchParams.get("vote");
			enqueueSnackbar("Could not " + action +" post. To vote on content, you must register an Umati account.", { 
                variant: 'warning',
            });
			setRegisterMessage("Join Umati to vote on content");
		}
		else if (reason == "post") {
			enqueueSnackbar("Could not create post. To create posts, you must register an Umati account.", { 
                variant: 'warning',
            });
			setRegisterMessage("Join Umati to make insightful posts");
		}
		else if (reason == "umati") {
			enqueueSnackbar("Could not create Umati. To create Umatis, you must register an Umati account.", { 
                variant: 'warning',
            });
			setRegisterMessage("Join Umati to assemble your own community");
		}
        
    }, []);
	

return (
	<Grid container component="main" className={classes.root}>
	<CssBaseline />
	<ScrollLock isActive={true} />
	<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
		<div className={classes.paper}>
		<Avatar className={classes.avatar}>
			<PeopleOutlineOutlinedIcon />
		</Avatar>
		<Typography component="h1" variant="h5">
			{registerMessage || "Register"}
		</Typography>
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
		onChange={(e) => usernameUpdate(e.target.value)}
		error={username.length > 0 ?usernameValidation():""}
		helperText = {username.length > 0 ?checkUsername():""}
		autoFocus
		/>
		<TextField
		variant="outlined"
		margin="normal"
		required
		fullWidth
		id="email"
		label="Email Address"
		name="email"
		autoComplete="email"
		onChange={(e) => setEmail(e.target.value)}
		helperText = {function () {
			if (email.length == 0) {
				return "";
			}
			if (!validator.isEmail(email)) {
				return "Invalid email address";
			}
		}
		}
		error = {!validator.isEmail(email) && email.length > 0}
		/>
		<TextField
		variant="outlined"
		margin="normal"
		required
		fullWidth
		name="password"
		label="Password"
		//id="password"
		//autoComplete="current-password"
		autoComplete="off"
		error={password.length > 0 ?passwordValidation():""}
		helperText = {password.length > 0 ?checkPassword():""}
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
		<TextField
		variant="outlined"
		margin="normal"
		required
		fullWidth
		name="confirm-password"
		label="Confirm password"
		type={showPassword ? 'text' : 'password'}
		id="confirm-password"
		//autoComplete="confirm-password"
		autoComplete="off"
		error={(!(password == passwordCon) && passwordCon.length > 0)}
		helperText = {(!(password == passwordCon) && passwordCon.length > 0)? 'Passwords do not match' : ''}
		onChange={(e) => setPasswordCon(e.target.value)}
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
		<Button
		type="submit"
		fullWidth
		variant="contained"
		color="primary"
		className={classes.submit}
		disabled={!validateForm()}
		>
		Register
		</Button>
		<Grid container>
		<Grid item>
			<Link href="/login" variant="body2">
			{"Already have an account? Login"}
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