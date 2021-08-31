import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Item} from "./Item";
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
} from '@material-ui/core';

import RSRR from "react-string-replace-recursively";
import { mdconfig } from "../config/markdown";

function SortableItem (props) {
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

return (
	<div ref={setNodeRef} style={style} >
	<Card variant="outlined">
				<CardHeader
					title={
						props.data.title
					}
					subheader={
						displayAppliedTo()
				}
					action={
						<Button
						// onClick={handleOpenDropdown}
					>
						<MoreVertIcon />
						</Button>
					}
				/>
				<CardContent>
				<span>
				{RSRR(mdconfig)(props.data.description)}
				</span>
			</CardContent>
		<IconButton {...attributes} {...listeners} disableRipple>
			<DragHandleIcon/>
		</IconButton>
	</Card>
	</div>
);
}

export default SortableItem;