// Editable.js
import React, { useEffect, useRef, useState, Component } from "react";
import RSR from "react-string-replace";
import UmatiLink from "./UmatiLink";
import UserLink from "./UserLink";

import {
    Button,
} from '@material-ui/core';

// Component accept text, placeholder values and also pass what type of Input - input, textarea so that we can use it for styling accordingly
const Editable = ({
  text,
  type,
  placeholder,
  children,
  childRef,
  finishEdits,
  enabled,
  ...props
}) => {
  // Manage the state whether to show the label or the input box. By default, label will be shown.
  const [isEditing, setEditing] = useState(false);
  const [initialText, setInitialText] = useState(text);

  useEffect(() => {
	console.log(enabled);
	if (childRef && childRef.current && isEditing === true) {
	  childRef.current.focus();
	}
  }, [isEditing, childRef]);

// Event handler while pressing any key while editing
	const handleKeyDown = (event, type) => {
		const { key } = event;
		const keys = ["Escape", "Tab"];
		const enterKey = "Enter";
		
	/* 
		- For textarea, check only Escape and Tab key and set the state to false
		- For everything else, all three keys will set the state to false
	*/
		if (
		(keys.indexOf(key) > -1)
		) {
		finishEditing();
		}
	};

	function finishEditing() {
		setEditing(false);
		setInitialText(text);
		finishEdits();
	}
	function noSubmitFinishEditing() {
		setEditing(false);
		text = initialText;
		console.log(text);
	}

	function click() {
		if (enabled) {
			setEditing(true);
		}
	}

	function buildBody(textInput) {
		var returned;
		if (textInput) {

			// Umati Mention Replace
			returned = RSR(textInput, /[u]\/\[([^\[]+\]\([0-9]*)\)/g, function (match, i) {
				const nameId = match.split("](");
				const umatiname = nameId[0];
				const umatiId = nameId[1];
				return (
					<UmatiLink
					umatiname={umatiname}
					umatiId={umatiId}/>
				);
			});

			// User Mention Replace
			returned = RSR(returned, /\@\[([^\[]+\]\([0-9]*)\)/g, function (match, i) {
				const nameId = match.split("](");
				const username = nameId[0];
				const userId = nameId[1];
				return (

					<UserLink
					username={username}
					userId={userId}/>
				);
			});
		}
		else if (placeholder) {
			const returned = placeholder;
		}
		else {
			const returned = "Editable content";
		}
		return returned;
	}
	return (
		<section {...props}>
		{isEditing ? (
			<div
			// onBlur={() => finishEditing()}
			onKeyDown={e => handleKeyDown(e, type)}
			>
			{children}
			</div>
		) : (
			<div
			onClick={click}
			>
			<span style={{display: "inline-block"}}>
				{buildBody(initialText)}
			</span>
			</div>
		)}
		
		<Button onClick={() => finishEditing()} style={{display: !isEditing ? "none" : "block", float:"right", marginTop: "20px"}} key="addAvatar" variant="contained" type="button" color="primary">
		Submit
		</Button>
		<Button onClick={() => noSubmitFinishEditing()} style={{display: !isEditing ? "none" : "block", float:"right", marginTop: "20px"}} key="addAvatar" variant="contained" type="button">
		Cancel
		</Button>
		</section>
		
	);
};

export default Editable;