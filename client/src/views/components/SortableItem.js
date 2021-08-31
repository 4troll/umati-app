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

function SortableItem (props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} >
      <Card variant="outlined">
							<CardHeader
								title={
									"Rule " + props.id
								}
								subheader={"Rule"}
								action={
									<IconButton aria-label="settings" 
                  // onClick={handleOpenDropdown}
                  >
									<MoreVertIcon />
									</IconButton>
                }
							/>
							<CardContent></CardContent>
          <IconButton {...attributes} {...listeners} disableRipple>
            <DragHandleIcon/>
          </IconButton>
      </Card>
    </div>
  );
}

export default SortableItem;