import React from "react";

import {
    Avatar,
    Box,
    Card,
    CardContent,
	makeStyles,
	CardHeader
} from '@material-ui/core';

import UserLink from "./UserLink.js";

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

function clickCard(name) {
    window.location.href = "/u/" + name;
}

function umatiCard (props) {
    const classes = useStyles();
    const umatiDat = props.data
    return (
        <div key={umatiDat.umatiname} className="umatiCardContainer" style={{marginTop: "5px"}} onClick={() => clickCard(umatiDat.umatiname)}>
            <Card className={classes.root}>
            <CardHeader
                avatar={
                <Avatar
                    alt={umatiDat.displayname}
                    src={umatiDat.logo}
                    style={{height:64+"px", width:64+"px"}}
                    />
                }
                title={
                    (umatiDat.displayname ? umatiDat.displayname : "u/" + umatiDat.umatiname)
                }
                subheader={(umatiDat.displayname ? ("u/" + umatiDat.umatiname) : "")}
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
    </div>

    );
}

export default umatiCard;