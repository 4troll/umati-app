import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Item} from "./OverlayItem";
import DragHandleIcon from '@material-ui/icons/DragHandle';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {
Box,
Button,
IconButton,
Card,
CardHeader,
CardActions,
CardContent,
Menu,
MenuItem,

} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import RSRR from "react-string-replace-recursively";
import { mdconfig } from "../config/markdown";

function RuleCard (props) {
const {
	attributes,
	listeners,
	setNodeRef,
	transform,
	transition,
} = useSortable({id: props.data.id});

const style = {
	transform: CSS.Transform.toString(transform),
	transition,
};
const displayAppliedTo = () => {
	if (props.data.appliedTo == 0) {
		return ("Posts and comments");
	}
	else if (props.data.appliedTo == 1) {
		return ("Posts");
	}
	else {
		return ("Comments");
	}
}

const [anchor, setAnchor] = useState(null);
const handleOpenDropdown = event => {
	setAnchor(event.currentTarget);
};

const handleCloseDropdown = () => {
	setAnchor(null);
};

return (
	<div ref={setNodeRef} style={style} key={props.index} >
	<Card variant="outlined" style={{display: 'flex'}}>
		<div style={{width: "100%"}}>
				<CardHeader
					title={
						(props.index + 1) + ". "+ props.data.title
					}
					subheader={
						displayAppliedTo()
				}
				action={
					<IconButton aria-label="settings" onClick={handleOpenDropdown}>
					<MoreVertIcon />
					</IconButton>
				}
				/>
				<CardContent>
				<span>
				{RSRR(mdconfig)(props.data.description)}
				</span>
			</CardContent>
			</div>
		<IconButton style= {{cursor: "grab", height:"fit-content", marginTop: "8px", marginRight:"12px"}}{...attributes} {...listeners} disableRipple>
			<DragHandleIcon/>
		</IconButton>
		<Menu
		id="rule-menu"
		anchorEl={anchor}
		open={anchor}
		onClose={handleCloseDropdown}
		>
		<MenuItem 
		onClick={() => {
			setAnchor(null);
			props.edit(props.data.id);
		}}
		>
			Edit
		</MenuItem>
		<MenuItem 
		onClick={() => {
			setAnchor(null);
			props.delete(props.data.id);
		}}
		>
			Delete
		</MenuItem>
		</Menu>
	</Card>
	</div>
);
}

function LoadingRuleCard (props) {
	return (
		<Card variant="outlined" style={{ marginTop: "5px"}}>
				<CardHeader
					title={
						<Skeleton animation="wave" height={10} width={160} style={{ marginBottom: 6 }} />
					}
					subheader={
						<Skeleton animation="wave" height={10} width={80} />
					}
					
				/>
				<CardContent>
				<span>
					<Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
					<Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} width="80%" />
					<Skeleton animation="wave" height={10} width="80%" />
				</span>
			</CardContent>
	</Card>
	);
}

export {RuleCard, LoadingRuleCard};