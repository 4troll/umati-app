import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

function Copyright() {
return (
	<Typography variant="body2" color="textSecondary">
	{'Copyright © '}
	<Link color="inherit" href="">
		umati
	</Link>{' '}
	{new Date().getFullYear()}
	{'.'}
	</Typography>
);
}

const useStyles = makeStyles((theme) => ({
footer: {
	padding: theme.spacing(3, 2),
	marginTop: 'auto',
	backgroundColor:
	theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
},
}));

export default function StickyFooter() {
const classes = useStyles();

return (
	<footer className={classes.footer}>
		<Container maxWidth="lg">
		<h2 style={{margin:"0px"}}>umati</h2>
		<p>Umati (<em>oo•mah•tee</em>) is a social news website that places emphasis on small communities and the individuals within them. 
		Communities in Umati are called Umatis.
		Content moderators are free to moderate their Umatis however they wish provided that all users follow Umati's Terms of Service.</p>
		<Copyright />
		</Container>
	</footer>
);
}