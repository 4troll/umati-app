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
  
	function validateForm() {
	  return username.length > 0 && password.length > 0;
	}

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
			.then(json => {
				console.log(json);
                window.location.href = "/login";
			});
		}
	}

	async function handleSubmit(event) {
		event.preventDefault();
		var newAccount = {
			"username": username,
			"email": email,
			"password": password,
			"passwordCon": passwordCon
		}
		await postJson("/api/registerAccount", newAccount)
		.then(function (data) {
			return data;
		})
		.catch((error) => {
			return error;
		});
	}

return (
	<Grid container component="main" className={classes.root}>
	<CssBaseline />
	<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
		<div className={classes.paper}>
		<Avatar className={classes.avatar}>
			<PeopleOutlineOutlinedIcon />
		</Avatar>
		<Typography component="h1" variant="h5">
			Register
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
		onChange={(e) => setUsername(e.target.value)}
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
		/>
		<TextField
		variant="outlined"
		margin="normal"
		required
		fullWidth
		name="password"
		label="Password"
		type="password"
		id="password"
		autoComplete="current-password"
		onChange={(e) => setPassword(e.target.value)}
		/>
		<TextField
		variant="outlined"
		margin="normal"
		required
		fullWidth
		name="confirm-password"
		label="Confirm password"
		type="confirm-password"
		id="confirm-password"
		autoComplete="confirm-password"
		onChange={(e) => setPasswordCon(e.target.value)}
		/>
		<Button
		type="submit"
		fullWidth
		variant="contained"
		color="primary"
		className={classes.submit}
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