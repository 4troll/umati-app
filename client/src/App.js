import React, { Component } from 'react';
import logo from './logo.svg';
import Login from "./views/Login.js";
import Register from "./views/Register.js";
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
	state = {
		loggedIn: false,
		tabs: []
	};

	componentDidMount() {
		if (Cookies.get("loggedIn") == "true") { // if logged in
			this.setState({ loggedIn : true })
			this.setState(prevState => ({
				tabs: [...prevState.tabs, <Link class="navlink" to="/">umati</Link>]
			}));
			this.setState(prevState => ({
				tabs: [...prevState.tabs, <Link class="navlink" to="/posts">Posts</Link>]
			}));
		}
		else {
			this.setState({ loggedIn : false })
			this.setState(prevState => ({
				tabs: [...prevState.tabs, <Link class="navlink" to="/">umati</Link>]
			}));
			this.setState(prevState => ({
				tabs: [...prevState.tabs, <Link class="navlink" to="/login">Login</Link>]
			}));
			this.setState(prevState => ({
				tabs: [...prevState.tabs, <Link class="navlink" to="/posts">Posts</Link>]
			}));
		}
	}

	// callApi = async () => {
	//   const response = await fetch('/api/hello');
	//   const body = await response.json();

	//   if (response.status !== 200) throw Error(body.message);

	//   return body;
	// };

	// handleSubmit = async e => {
	//   e.preventDefault();
	//   const response = await fetch('/api/world', {
	//     method: 'POST',
	//     headers: {
	//       'Content-Type': 'application/json',
	//     },
	//     body: JSON.stringify({ post: this.state.post }),
	//   });
	//   const body = await response.text();

	//   this.setState({ responseToPost: body });
	// };

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
