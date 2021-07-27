// Editable.js
import React, { useEffect, useRef, useState, Component } from "react";


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
		const allKeys = [...keys, enterKey]; // All keys array
		
	/* 
		- For textarea, check only Escape and Tab key and set the state to false
		- For everything else, all three keys will set the state to false
	*/
		if (
		(type === "textarea" && keys.indexOf(key) > -1) ||
		(type !== "textarea" && allKeys.indexOf(key) > -1)
		) {
		finishEditing();
		}
	};

	function finishEditing() {
		setEditing(false);
		finishEdits();
	}

	function click() {
		if (enabled) {
			setEditing(true);
		}
	}
	
	return (
		<section {...props}>
		{isEditing ? (
			<div
			onBlur={() => finishEditing()}
			onKeyDown={e => handleKeyDown(e, type)}
			>
			{children}
			</div>
		) : (
			<div
			onClick={click}
			>
			<p>
				{text || placeholder || "Editable content"}
			</p>
			</div>
		)}
		</section>
	);
};

export default Editable;