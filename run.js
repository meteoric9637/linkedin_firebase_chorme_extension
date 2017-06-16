
var userProfileID = "";
var event_type = "";
var element_clicked  = null;
var pressedKey = "";

$(document).ready(function()
{
	/* 
	* Init FireBase
	*/
	var config = {
		apiKey: "",
		authDomain: "",
		databaseURL: "",
		storageBucket: "",
		messagingSenderId: "",
	};
	firebase.initializeApp(config);

	event_type = "opened_linked";
	
	/* 
	* Regist Events
	*/
	document.addEventListener("visibilitychange", FocusedDocument);
	document.addEventListener("click",MouseClickedDocument);
	document.addEventListener("keyup",KeyUpDocument);

	document.defaultView.onbeforeunload = function(event)
	{
		return "Dialog text here";
	}
});


// Event Methods
function FocusedDocument(event)
{
	var focused = !document.hidden;
	if(focused)
		event_type = "tab_focused";
	else
		event_type = "tab_unfocused";
	pressedKey = "";
	SaveEventsToFireBase();
	console.log("Focus Event");
}

function MouseClickedDocument(event)
{
	var element = FindLinkedObject(event.toElement);
	if(element != null)
	{
		console.log(element);
		event_type = "mouse_click";
		element_clicked = 
		{
			"innerText": element.innerText, 
			"nodeName" : element.tagName, 
			"className":element.getAttribute('class'),
		};
		clickedLink = element.href
		pressedKey = "";
		SaveEventsToFireBase();
	}
	console.log("Mouse Event");
}

function KeyUpDocument(event)
{
	var InputTagNames = ['textarea','input'];
	var element = event.target;
	if(element == 'undefined' || element == document.body || element == null) return;
	if(InputTagNames.includes(element.tagName.toLowerCase()))
	{
		if(element.tagName == "input")
			if(element.type != "text")
				return;
		event_type = "key_press";
		pressedKey = event.key;
		SaveEventsToFireBase();
	}
	console.log("Key Event");
}

// User Define Methods
function FindLinkedObject(elmt)
{
	var tagNames = ["a"];
	var element;
	if(elmt == document || elmt == null) return null;
	
	if(tagNames.includes(elmt.tagName.toLowerCase()))
	{
		return elmt;
	}
	element = FindLinkedObject(elmt.parentElement);
	return element;
}

function SaveEventsToFireBase()
{
	userProfileID = GetProfileUrl();
	if(userProfileID == "undefined" || userProfileID == null || userProfileID == "") return;
	var date = new Date();
	var year  = date.getFullYear();
	var month = date.getMonth();
	var day = date.getDate();
	var hour = date.getHours();
	var min = date.getMinutes(); 
	var sec = date.getSeconds();
	var time = month + "_" + day + "_"+ year + "T" + hour + ":" + min + ":" + sec;
	
	var event = {};
	event[time] = 
	{
		"event_type": event_type,
		"element_clicked": element_clicked,
		"key_press": pressedKey,
	};

	var json = 
	{ 	
		"event_type": event_type,
		"element_clicked": element_clicked,
		"key_press": pressedKey,
	};
	
	firebase.database().ref(userProfileID+"/linkedin_browser_events/"+time).set(json);
}

function GetProfileUrl()
{
	if(userProfileID != "" && userProfileID != null && userProfileID != "undefined")
		return userProfileID;
	if(document.URL == "https://www.linkedin.com/feed/")
	{
		if($('.left-rail-container')[0] != "undefined" &&  $('.left-rail-container')[0] != null)
		{
			var strHtml = $('.left-rail-container')[0].innerHTML;
			if(strHtml != "undefined" &&  strHtml != null)
			{
				var strArrHtml = strHtml.split('href="/in/');
				var profileID = strArrHtml[1].split('/"');
				return profileID[0];
			}
		}
	}
 }
