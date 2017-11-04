const request = require('browser-request');

//alert(getQueryStringValue("id")); 

function getQueryVariable(variable:string){
	// retrieve a query variable from the URL (used to specify the URL on the command line)
	// courtesy of CHRIS COYIER at https://css-tricks.com/snippets/javascript/get-url-variables/
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		   var pair = vars[i].split("=");
		   if(pair[0] == variable){return pair[1];}
	}
	return(''); // we return an empty string rather than false to avoid type issues.
	// NB empty string will evaluate to false if cast to boolean.
}

if(document.getElementById("docubricks_xml_url")){
	// We use an HTTP request to retrieve the XML from a URL, which works well for e.g. GitHub.
    var url = document.getElementById("docubricks_xml_url").textContent;
	document.getElementById("docubricks_xml_url").textContent="";
	if(url == "docubricks_xml_url will be read from the query string."){
		url = decodeURIComponent(getQueryVariable("docubricks_xml_url"));
	}
	var base_url = url.split('/').slice(0,-1).join('/') + '/'; // the DocuBricks root folder
	// paths for images and other files in the DocuBricks project should be given relative to the docubricks root folder

    request(url, function(error: any, response: any, body: any){
        console.log('statusCode retrieving XML file:',response && response.statusCode);
        console.log('error:',error);


    	let xmldoc = new DOMParser().parseFromString(body, "application/xml");
        console.log("Parsed XML to DOM object");
        let bricks = xmldoc.documentElement.getElementsByTagName("brick");
        for(let i=0; i < bricks.length; i++){
            let brickxml = bricks[i];
            console.log(brickxml);
            console.log(brickxml.querySelector("name").textContent);
        }
        
    });
}