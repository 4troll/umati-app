import UmatiLink from "../components/UmatiLink";
import UserLink from "../components/UserLink";
function appendToArray(array1, array2) {
	for (let i = 0; i < array2.length; i++) {
		array1.push(array2[i]);
	}
	return array1;
}
const mdconfig = {
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
			console.log(processed);
			for (let i = 0; i < processed.length; i++) {
				if (typeof processed[i] == "string") {
					let split = processed[i].split(/\n/);
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
				{lines.map(function (item,i) {
					if (item) {
						item[0] = item[0].slice(2);
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
			var processed2 = []
			var currentLine = 0;
			var lines = [];
			console.log(processed);
			for (let i = 0; i < processed.length; i++) {
				if (typeof processed[i] == "string") {
					let split = processed[i].split(/\n/);
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
								if (!forwardItem.match(/[0-9]+\./)) {
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
				<ol>
				{
				lines.map(function (item,i) {
					if (item) {
						item[0] = item[0].replace(/[0-9]+\./, "");
					}
					console.log(item);
					return (
						<li><span>{item}</span></li>
					);
					
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
		pattern: /([\\]?(?:\*\*\*)(?:[^*\n]+)(?:\*\*\*))/g,
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
		pattern: /([\\]?(?:\*\*)(?:[^*\n]+)(?:\*\*))/g,
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
		pattern: /(\n[\\]?-{5,})/g,
		matcherFn: function (rawText, processed, key) {
			if (processed[0].charAt(0) == '\\') {
				processed[0] = processed[0].replace("\\", "");
				return (
					<span>{processed}</span>
				);
			}
			else {
				return (
					<hr></hr>
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
export { mdconfig };