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
    return (
        <Link to={"/u/" + data.umatiname} class="umati-link">
            <div className="right-hold flexbox">
                <Avatar variant="rounded" style={{height:24+"px", width:24+"px"}} alt={data.displayname ? data.displayname : data.umatiname} src={data.logo} />
                <span>&nbsp;</span>
                <p>{"u/" + data.umatiname}</p>
            </div>
        </Link>
    );
}

export default UmatiLink;