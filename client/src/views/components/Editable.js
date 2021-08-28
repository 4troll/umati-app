// Editable.js
import React, { useEffect, useRef, useState, Component } from "react";
import RSR from "react-string-replace";
import RSRR from "react-string-replace-recursively";
import UmatiLink from "./UmatiLink";
import UserLink from "./UserLink";



import {
    Button,
} from '@material-ui/core';

function appendToArray(array1, array2) {
	for (let i = 0; i < array2.length; i++) {
		array1.push(array2[i].trim());
	}
	return array1;
}

var config = {
	// 'hashTag': {
	//   pattern: /(#[a-z\d][\w-]*)/ig,
	//   matcherFn: function (rawText, processed, key) {
	// 	return <Link key={key} to={"tags/" + rawText}>{processed}</Link>;
	//   }
	// },
	"header3": {
		pattern: /^([\\]?(?:###)[^#].*$)/gim,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				return (
					<span>{processed}</span>
				);
			}
			else {
				processed[0] = processed[0].slice(3);
				return (
					<h3>{processed}</h3>
				);
			}
			
		}
	},
	"header2": {
		pattern: /^([\\]?(?:##)[^#].*$)/gim,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				return (
					<span>{processed}</span>
				);
			}
			else {
				processed[0] = processed[0].slice(2);
				return (
					<h2>{processed}</h2>
				);
			}
			
		}
	},
	"header": {
		pattern: /^([\\]?(?:#)[^#].*$)/gim,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				console.log(processed);
				return (
					<span>{processed}</span>
				);
			}
			else {
				processed[0] = processed[0].slice(1);
				return (
					<h1>{processed}</h1>
				);
			}
			
		}
	},
	"quote": {
		pattern: /(?<=\n)([\\]?>.*)/g,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				return (
					<span>{processed}</span>
				);
			}
			else {
				processed[0] = processed[0].slice(1);
				console.log(processed)
				return (
					<blockquote style={{background:"rgb(220,220,220)", 
					color: "rgb(128,128,128)", 
					marginTop: "10px",
					marginBottom: "10px" }}>{processed}</blockquote>
				);
			}
			
		}
	},
	"bulletList": {
		pattern: /((?:\n\* .+)+)/g,
		matcherFn: function (rawText, processed, key) {
			var processed2 = []
			var currentLine = 0;
			var lines = [];
			for (let i = 0; i < processed.length; i++) {
				if (typeof processed[i] == "string") {
					let split = processed[i].split(/\r?\n/);
					processed2 = appendToArray(processed2,split);
				}
				else if (processed[i]) {
					processed2.push(processed[i]);
				}
				
			}
			console.log(processed2);

			for (let i = 0; i < processed2.length; i++) {
				if (processed2[i]) {
					let currentLineArray = [];
					currentLineArray.push(processed2[i]);
					let forward = 1;
					while (true) {
						if ((forward + i) < (processed2.length - 1) ) {
							let forwardItem = processed2[forward + i];
							if (!(typeof forwardItem == "string")) {
								currentLineArray.push(forwardItem);
							}
							else {
								if (forwardItem.charAt(0) != "*") {
									currentLineArray.push(forwardItem);
								}
								else {
									break;
								}
							}
						}
						else {
							break;
						}
						forward++;
				}
				lines[currentLine] = currentLineArray;
				currentLine++;
				i = i + (forward - 1);
				}
			}
			return (
				<ul>
				{/* {
				listItems.map(function (item,i) {
					if (typeof item == "string") {
						if (item.length > 0)
						{
							let forward = 1;
							let insertedItems = [];
							insertedItems.push(item);
							while (true) {
								if ((i + forward) < (listItems.length - 1) ) {
									let forwardItem = listItems[i + forward];
									if (!(typeof forwardItem == "string")) {
										insertedItems.push(forwardItem);
									}
									else {
										break;
									}
								}
								else {
									break;
								}
								forward++;
							}
							console.log(forward);
							return (
								<li><span>{insertedItems}</span></li>
							);
						}
						
					}
					// else {
					// 	return (
					// 			<li>{item}</li>
					// 		);
					// }
					
				})
				} */}
				{lines.map(function (item,i) {
					if (item) {
						// item[0] = item[0].slice(1);
					}
					console.log(item);
					return (
						<li><span>{item}</span></li>
					);
					
				})}
				</ul>
			);
		}
	},
	"bulletEscape": {
		pattern: /(?<=\n)([\\]\*.+)/g,
		matcherFn: function (rawText, processed, key) {
			processed[0] = processed[0].slice(1);
			return (
				<span>{processed}</span>
			);
		}
	},
	"numberList": {
		pattern: /((?:\n[0-9]+\. .*)+)/g,
		matcherFn: function (rawText, processed, key) {
			let listItems = processed[0].split("\n");
			return (
				<ol>
				{
				listItems.map(function (item,i) {
					item = item.replace(/[0-9]+\. /g, "");
					if (item.length > 0) {
						return (
							<li>{item}</li>
						);
					}
					
				})
				}
				</ol>
			);
		}
	},
	"numberEscape": {
		pattern: /(?<=\n)([\\][0-9]+\..*)/g,
		matcherFn: function (rawText, processed, key) {
			processed[0] = processed[0].slice(1);
			return (
				<span>{processed}</span>
			);
		}
	},
	"umatiMention": {
		pattern: /[u]\/\[([^\[]+\]\[[0-9]*)\]/g,
		matcherFn: function (rawText, processed, key) {
			const nameId = rawText.split("][");
			const umatiname = nameId[0];
			const umatiId = nameId[1];
			return (
				<UmatiLink key={key}
				umatiname={umatiname}
				umatiId={umatiId}/>
			);
		}
	},
	"userMention": {
		pattern: /\@\[([^\[]+\]\[[0-9]*)\]/g,
		matcherFn: function (rawText, processed, key) {
			const nameId = rawText.split("][");
			const username = nameId[0];
			const userId = nameId[1];
			return (
				<UserLink key={key}
					username={username}
					userId={userId}/>
			);
		}
	},
	"link": {
		pattern: /([\\]?\[[^\[\n\s]+\]\([^\)\n\s]+\))/g,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				console.log(processed);
				return (
					<span>{processed}</span>
				);
			}
			else {
				var nameId = processed[0].split("](");
				const linkname = nameId[0].slice(1);
				const link = nameId[1].slice(0,-1);
				return (
					<a href={link}>{linkname}</a>
				);
			}
		}
	},
	"italibold": {
		pattern: /([\\]?(?:\*\*\*)(?:.+)(?:\*\*\*))/g,
		matcherFn: function (rawText, processed, key) {
			if (rawText.charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				console.log(processed);
				console.log("escaped");
				return (
					<span>{processed}</span>
				);
			}
			else {
				console.log(rawText);
				console.log("italibold applied");
				processed[0] = processed[0].slice(3,-3);
				return (
					<em><strong>{processed}</strong></em>
				);
			}
		}
	},
	"bold": {
		pattern: /([\\]?(?:\*\*)(?:.+)(?:\*\*))/g,
		matcherFn: function (rawText, processed, key) {
			if (rawText.charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				console.log(processed);
				console.log("escaped");
				return (
					<span>{processed}</span>
				);
			}
			else {
				console.log(rawText);
				console.log("bold applied");
				processed[0] = processed[0].slice(2,-2);
				return (
					<strong>{processed}</strong>
				);
			}
		}
	},
	"italics": {
		pattern: /(?<!\*)([\\]?(?:\*)(?!\s)(?:[^*\n]+?)(?<!\s)(?:\*))(?!\*)/g,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				console.log(processed);
				return (
					<span>{processed}</span>
				);
			}
			else {
				processed[0] = processed[0].slice(1,-1);
				return (
					<em>{processed}</em>
				);
			}
		},
	},
	
	
	
	"hr": {
		pattern: /\n[\\]?-{5,}/g,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				return (
					<span>{processed}</span>
				);
			}
			else {
				return (
					<hr/>
				);
			}
		}
	},
	
	"listFix": {
		pattern: /<\/ul>\s?<ul>/g,
		matcherFn: function (rawText, processed, key) {
			return (
				""
			);
		}
	},
	"numberedFix": {
		pattern: /<\/ol>\s?<ol>/g,
		matcherFn: function (rawText, processed, key) {
			return (
				""
			);
		}
	},
	"quoteFix": {
		pattern: /<\/blockquote><blockquote>/g,
		matcherFn: function (rawText, processed, key) {
			return (
				<br/>
			);
		}
	},

	
};

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

			// // Umati Mention Replace
			// returned = RSR(textInput, /[u]\/\[([^\[]+\]\[[0-9]*)\]/g, function (match, i) {
			// 	const nameId = match.split("][");
			// 	const umatiname = nameId[0];
			// 	const umatiId = nameId[1];
			// 	return (
			// 		<UmatiLink
			// 		umatiname={umatiname}
			// 		umatiId={umatiId}/>
			// 	);
			// });

			

			// // User Mention Replace
			// returned = RSR(returned, /\@\[([^\[]+\]\[[0-9]*)\]/g, function (match, i) {
			// 	const nameId = match.split("][");
			// 	const username = nameId[0];
			// 	const userId = nameId[1];
			// 	return (

			// 		<UserLink
			// 		username={username}
			// 		userId={userId}/>
			// 	);
			// });
			// // Bullet List
			// returned = RSR(returned, /\n\*(.*)/g, function (match, i) {
			// 	return (
			// 		<li>{match}</li>
			// 	);
			// });
			// // Number List
			// returned = RSR(returned, /\n[0-9]+\.(.*)/g, function (match, i) {
			// 	return (
			// 		<ol>{match}</ol>
			// 	);
			// });

			// // Quote
			// returned = RSR(returned, />(.*)/g, function (match, i) {
			// 	return (
			// 		<blockquote style={{background:"rgb(220,220,220)", color: "rgb(128,128,128)", marginTop: "10px" }}>{match}</blockquote>
			// 	);
			// });
			
			// // Link
			// returned = RSR(returned, /\[([^\[]+\]\([^\)]+)\)/g, function (match, i) {
			// 	var nameId = match.split("](");
			// 	const linkname = nameId[0]
			// 	const link = nameId[1]
			// 	return (
			// 		<a href={link}>{linkname}</a>
			// 	);
			// });

			// // Bold
			// returned = RSR(returned, /(?:\*\*)(.*?)(?:\*\*)/g, function (match, i) {
			// 	return (
			// 		<strong>{match}</strong>
			// 	);
			// });

			// // Italics
			// returned = RSR(returned, /(?:\*)(.*?)(?:\*)/g, function (match, i) {
			// 	return (
			// 		<em>{match}</em>
			// 	);
			// });

			returned = RSRR(config)(textInput);

			


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
			<span style={{display: "inline-block", width: "100%"}}>
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