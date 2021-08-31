import React from "react";


import {
    Avatar,
    makeStyles
} from '@material-ui/core';

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
		// margin: theme.spacing(3, 0, 2),
	},
}));

function UmatiLink (props) {
    const classes = useStyles();
    const data = props.data
	const umatiname = props.umatiname || data.umatiname;
	const umatiId = props.umatiId || data.umatiId;
	const logo = umatiId ? "/assets/umatiLogo/" + umatiId : "";
    return (
        <Link to={"/u/" + umatiname} className="umati-link">
            <span className="right-hold flexbox">
                <Avatar variant="rounded" style={{height:24+"px", width:24+"px"}} 
				// alt={data.displayname ? data.displayname : umatiname} 
				src={logo} />
                <span>&nbsp;</span>
                <span>{"u/" + umatiname}</span>
            </span>
        </Link>
    );
}

export default UmatiLink;