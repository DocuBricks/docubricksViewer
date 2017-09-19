import * as React from "react";
import * as ReactDOM from "react-dom";

import { DocubricksProject } from "./docubricksViewer";
import * as Docubricks from "./docubricks";

const request = require('browser-request');

//alert(getQueryStringValue("id")); 

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