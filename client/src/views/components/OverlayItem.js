import React, {forwardRef} from 'react';

import {
  Box,
  Button,
  IconButton,
  Card,
  CardHeader,
  CardActions,
  CardContent,
  
  } from '@material-ui/core';

const Item = forwardRef(({id, ...props}, ref) => {
    return (
		<Card variant="outlined" {...props}>
				<CardHeader
					title={
						props.data.title
					}
					subheader={
						displayAppliedTo()
				}
					action={
						<IconButton
						// onClick={handleOpenDropdown}
					>
						<MoreVertIcon />
						</IconButton>
					}
				/>
				<CardContent>
				<span>
				{RSRR(mdconfig)(props.data.description)}
				</span>
			</CardContent>
		</Card>
    )
  });

export {Item};