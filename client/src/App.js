import React, { Component } from 'react';
import logo from './logo.svg';
import Login from "./views/Login.js";
import Account from "./views/Account.js";
import Register from "./views/Register.js";
import Umatis from "./views/Umatis.js";
import CreateUmati from "./views/CreateUmati.js";
import './App.css';

import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from "@material-ui/core/styles";

import GDSTWoff2 from "./fonts/light-94a07e06a1-v2.woff2";
import GDSTWoff from "./fonts/light-f591b13f7d-v2.woff";
const GDSTransportLight = {
	fontFamily: "GDS Transport",
	fontStyle: "normal",
	fontDisplay: "swap",
	fontWeight: 400,
	src: `
		url(${GDSTWoff2}) format("woff"),
		url(${GDSTWoff}) format("woff")
	`,
	unicodeRange:
	  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF',
};
const theme = createTheme({
	typography: {
	  fontFamily: "GDS Transport",
	  fontSize: 18,
	},
	overrides: {
	  MuiCssBaseline: {
		'@global': {
		  '@font-face': [GDSTransportLight],
		},
	  },
	},
  });

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			username: Cookies.get("username"),
			loggedIn: false,
			tabs: []
		};
	  }

	componentDidMount() {

		this.setState(prevState => ({
			tabs: [...prevState.tabs, <Link key="home" class="navlink" to="/">umati</Link>]
		}));
		if (Cookies.get("loggedIn") == "true") { // if logged in
			this.setState({ loggedIn : true })
			var username = Cookies.get("username"); //username
			this.setState(prevState => ({
				tabs: [...prevState.tabs, <Link class="navlink" key="account" to={"/@" + username}>@{username}</Link>]
			}));
		}
		else {
			this.setState({ loggedIn : false })
			this.setState(prevState => ({
				tabs: [...prevState.tabs, <Link class="navlink" key="login" to="/login">Login</Link>]
			}));
		}
		this.setState(prevState => ({
			tabs: [...prevState.tabs, <Link class="navlink" key="posts" to="/posts">Posts</Link>]
		}));
		this.setState(prevState => ({
			tabs: [...prevState.tabs, <Link class="navlink" key="umatis" to="/umatis">Umatis</Link>]
		}));
	}


	render() {
		return (
			<ThemeProvider theme={theme}>
			<Router>
			<div class="navbar">
				{this.state.tabs}
			</div>
				{/*
				A <Switch> looks through all its children <Route>
				elements and renders the first one whose path
				matches the current URL. Use a <Switch> any time
				you have multiple routes, but you want only one
				of them to render at a time
				*/}
				<Switch>
				<Route exact path="/">
					{/* <Home /> */}
				</Route>
				<Route path="/login">
					<Login />
				</Route>
				<Route path="/register">
					<Register />
				</Route>
				<Route path="/@:username">
					<Account 
					path="/@:username"
					/>
				</Route>
				<Route path="/umatis/createUmati">
					<CreateUmati />
				</Route>
				<Route path="/umatis">
					<Umatis />
				</Route>
				
				<Route path="/dashboard">
					{/* <Dashboard /> */}
				</Route>
				</Switch>
			
			</Router>
			</ThemeProvider>
		);
	}
}


export default App;
