import React, { Component } from 'react';
import logo from './logo.svg';
import Login from "./views/Login.js";
import Account from "./views/Account.js";
import Register from "./views/Register.js";
import Umatis from "./views/Umatis.js";
import CreateUmati from "./views/CreateUmati.js";
import UmatiView from "./views/UmatiView.js";
import CreatePost from "./views/CreatePost.js";
import Posts from "./views/Posts.js";
import PostView from "./views/PostView.js";
import './App.css';

import StickyFooter from "./views/components/StickyFooter.js";


import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from "@material-ui/core/styles";

import GDSTWoff2 from "./fonts/light-94a07e06a1-v2.woff2";
import GDSTWoff from "./fonts/light-f591b13f7d-v2.woff";

import jwt_decode from "jwt-decode";
import { useCookies } from 'react-cookie';

import { SnackbarProvider } from 'notistack';



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
  Link,
  Redirect
} from "react-router-dom";

import Cookies from 'universal-cookie';
 
const cookies = new Cookies();



class App extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			token: cookies.get("token"),
			cookieDat: {},
			tabs: []
		};

		// var thirtymins = new Date(new Date().getTime() + 30 * 60 * 1000);
		// axios.interceptors.request.use(async (config) => {
		// 	// const expireAt = localStorage.getItem('expiresAt');
		// 	// let token = localStorage.getItem('authToken');
		// 	// if (dayjs(expireAt).diff(dayjs()) < 1) {
		// 	//   const data = onGetForcedToken();
		// 	//   token = typeof data === 'string' ? data : await data();
		// 	// }
		// 	// // setting updated token
		// 	// localStorage.setItem('authToken', token);
		// 	let token = Cookies.get("token");
		// 	if (!token) {
		// 		let data = getAccessToken();
		// 		if (data) {
		// 			token = data.token;
		// 		}
		// 	}
		// 	Cookies.set("token", token, { sameSite: 'lax', expires: thirtymins, path: '/'  });
		// 	return config;
		// 	}, (err) => {
		// 		console.log("error in getting ",err)
		// });

		// axios.interceptors.response.use(response => {

		// 	if (response.status === 401) {

		// 		// destroy authentication keys
		// 		Cookies.remove("token", {});
		// 		Cookies.remove("refreshToken", {});
		// 	}
		// 	return response;
		// });
	}
	

	componentDidMount() {
		
	}

	async checkAuth() {
		const token = cookies.get("token");
		const refreshToken = cookies.get("refreshToken");
		if (!token || !refreshToken) {
			return false;
		}
	  
		try {
			const { exp } = jwt_decode(refreshToken);
	  
			if (exp < new Date().getTime() / 1000) {
				return false;
			}
		} 
		catch (e) {
			return false;
		}

		await fetch("/api/getAccessToken", {
			method: "get",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
			}
		})
		.then(function (json) {
			if (json.token) {
				console.log(json);
				token = json.token;
				cookies.set("token", token, { sameSite: "lax", secure: true, expires: thirtymins, path: "/" });
			}
		})
		.catch(e => {   
			console.error(e);
			return false;
		});
	  
		return true;
	};

	reload = ()=>{
		const current = props.location.pathname;
		this.props.history.replace(`/reload`);
			setTimeout(() => {
				this.props.history.replace(current);
		});
		const cookieDat = this.state.token ? jwt_decode(this.state.token) : null ;
		if (cookieDat) { // if logged in
			this.setState({ cookieDat : cookieDat})
		}
	}
	
	render() {
		const cookieDat = this.state.token ? jwt_decode(this.state.token) : null ;
		let username;
		if (cookieDat) {
			username = cookieDat.username;
		}
		
		
		return (
			<ThemeProvider theme={theme}>
			<SnackbarProvider maxSnack={3}>
			<Router>
			<div className="navbar">
				<Link key="home" className="navlink home" to="/">
					<div className="right-hold flexbox" >
						<img style={{width:"32px",height:"32px", marginRight:"8px"}} src="/umatiAbstractNavbar.svg"/>
						umati
					</div>
				</Link>
				{username ? 
				(<Link className="navlink"   key={username} to={"/@" + username + "?self"}>@{username}</Link>)
				: 
				<Link className="navlink" key="login" to="/login">Login</Link>
				}
				<Link className="navlink" key="posts" to="/posts">Posts</Link>
				<Link className="navlink" key="umatis" to="/umatis">Umatis</Link>
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
					{
						function() {
							if (!cookieDat) {
								return (<Redirect to="/login" />);
							}
							else {
								return (<Redirect to={"/posts"} />);
							}
						}
					}
					{/* <Home /> */}
				</Route>
				<Route path="/login">
					
					<Login />
				</Route>
				<Route path="/register">
					<Register />
				</Route>

				<Route exact path="/@:username" component={(props) => (<Account 
					path={"/@" + props.match.params.username}
					key={props.match.params.username}
				/>)}/>
				
				<Route exact path="/umatis">
					<Umatis />
				</Route>
				
				<Route exact path="/umatis/createUmati">
						{function() {
							if (!cookieDat) {
								return (<Redirect to="/register?to=umati" />);
							}
							else {
								return (<CreateUmati />);
							}
						}}
				</Route>
				<Route exact path="/u/:umatiname/comments/:postId">
					<PostView/>
				</Route>
				<Route path="/u/:umatiname/submit">
					{function() {
							if (!cookieDat) {
								return (<Redirect to="/register?to=post" />);
							}
							else {
								return (<CreatePost path="/u/:umatiname/submit"/>);
							}
						}}
					
				</Route>

				<Route path="/u/:umatiname" render={(props) => (<UmatiView
					path={"/u/" + props.match.params.umatiname}
					key={props.match.params.umatiname}
				/>)}/>
				

				<Route exact path="/posts">
					<Posts
					path="/posts"
				/>
				</Route>
				
				
				</Switch>
			{/* <div className="footer" style={{backgroundColor:"#808080"}}>
				
			</div> */}
			<StickyFooter/>
			</Router>
			</SnackbarProvider>
			</ThemeProvider>
			
		);
	}
}


export default App;
