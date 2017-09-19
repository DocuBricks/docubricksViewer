import * as React from "react";
import * as ReactDOM from "react-dom";

import { DocubricksProject } from "./docubricksViewer";
import * as Docubricks from "./docubricks";

const request = require('browser-request');

//alert(getQueryStringValue("id")); 

if(document.getElementById("hiddendata")){
    var s= document.getElementById("hiddendata").textContent;
    document.getElementById("hiddendata").textContent="";
    var docu = Docubricks.docubricksFromJSON(s);

    ReactDOM.render(
        <DocubricksProject proj={docu}/>,
        document.getElementById("example")
    );
}
if(document.getElementById("docubricks_xml_url")){
    var f = document.getElementById("docubricks_xml_url").textContent;
    document.getElementById("docubricks_xml_url").textContent="";

    request(f, function(error: any, response: any, body: any){
        console.log('statusCode retrieving XML file:',response && response.statusCode);
        console.log('error:',error);


    	Docubricks.docubricksFromXML(body, function(docu){
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