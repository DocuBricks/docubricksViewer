import * as React from "react";
import * as ReactDOM from "react-dom";

import { DocubricksProject } from "./docubricksViewer";
import * as Docubricks from "./docubricks";

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

if(document.getElementById("hiddendata")){
	// the XML has been converted to JSON and base64 encoded in the HTML document.
	// we assume the supporting files are in ./project/ (the default base_url defined in docubricks.ts)
    var s= document.getElementById("hiddendata").textContent;
    document.getElementById("hiddendata").textContent="";
    var docu = Docubricks.docubricksFromJSON(s);

    ReactDOM.render(
        <DocubricksProject proj={docu}/>,
        document.getElementById("example")
    );
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


    	Docubricks.docubricksFromXML(body, function(docu){
			docu.base_url = base_url;
            ReactDOM.render(
                <DocubricksProject proj={docu}/>,
                document.getElementById("example")
            );
        });
    });
}
if(document.getElementById("docubricks_xml")){
    var xmlstring = document.getElementById("docubricks_xml").textContent;
    //document.getElementById("docubricks_xml").textContent="";
    console.log("XML String");
    console.log(xmlstring);
    Docubricks.docubricksFromXML(xmlstring, function(docu){
        ReactDOM.render(
            <DocubricksProject proj={docu}/>,
            document.getElementById("example")
        );
    });
}
if(document.getElementById("docubricks_xml_iframe")){
    console.log("Loading from iframe");
    let iframe = document.getElementById("docubricks_xml_iframe") as HTMLIFrameElement;
    let xmldoc = iframe.contentDocument || iframe.contentWindow.document;
    console.log(xmldoc);
    let docu = Docubricks.docubricksFromDOM(xmldoc);
    ReactDOM.render(
            <DocubricksProject proj={docu}/>,
            document.getElementById("example")
        );
}
function loadDocumentFromFileInput(){
    var fileinput = document.getElementById("docubricks_xml_file_input") as HTMLInputElement;
    console.log("Loading file from file input control.");
    if("files" in fileinput){
        if(fileinput.files.length > 0){
            let file = fileinput.files[0];
            console.log("Reading file: "+file.name);
            let reader = new FileReader();
            reader.onload = function(){
                let docu = Docubricks.docubricksFromXMLSync(reader.result);
                ReactDOM.render(
                    <DocubricksProject proj={docu}/>,
                    document.getElementById("example")
                );   
            }
            reader.readAsText(file);
        }
    }
}