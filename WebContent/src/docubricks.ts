/**
 * Deserialisation from XML
 * 
 * The following methods tidy up the common code required to create objects from their XML representation.
 */
//const xml2js = require("xml2js"); //rwb27: tried adding XML import
const assert = require("assert");

interface CopiableFromXML {
	// All the DocuBricks types should implement this so they can be reconstituted from XML
    copyFromXML(xml: Element): void;
}
function stringOfHTMLFromXML(tag: string, xml: Element, def: string|null=" "): string{
	// retrieve the contents of a tag as a string, allowing HTML tags (for now, allows anything...?!)
    let nodes = xml.getElementsByTagName(tag);
    if(nodes.length == 0){
		// if the element is missing, return the default value if present, or throw an error.
        if(def != null){
            return def;
        }else{
            throw(Error("Error: there was no '"+tag+"' tag, and one is required."));
        }
    }
    assert(nodes.length == 1, "Got multiple elements matching '"+tag+"' but exactly 1 was required.");
    let node = nodes[0];
    return node.innerHTML;
}
/*
// it would be nice to handle strings in the same way as everything else - nice, but hard it seems!
class LoadableString extends string implements CopiableFromXML{
    copyFromXML(xml: XMLelement): void{
        
}*/
function attributeFromXML(attributeName: string, xml: Element, def: string|null = ""): string{
    let attr = xml.getAttribute(attributeName);
	if(typeof attr === "string"){
		return attr; //if a string is found, return that.
    }else if(typeof def === "string"){
        return def; //if a reasonable default is given, use that.
    }else{
		//otherwise, raise an error (for the moment, dump debug info as well)
		console.log("Missing attribute '"+attributeName+"' in XML:");
		console.log(xml);
		console.log("attr:");
		console.log(attr);
		console.log("def:");
		console.log(def);
		console.log("typeof def:"+(typeof def));
        throw "Attribute "+attributeName+" is missing, but it is required.";
    }
}
function idFromXML(xml: Element): string{
	// convenience property to retrieve the id property of a tag
    return attributeFromXML("id", xml);
}
function tagsFromXML(tag: string, xml: Element): Element[]{
	// return immediate children of an object (i.e. one level down the DOM tree)
	// which are of a specified tag type.  Surely there is a function for this
	// already???
	let elist: Element[] = [];
	for(let i=0; i<xml.children.length; i++){
		if(xml.children[i] instanceof Element){
			if(xml.children[i].tagName == tag) elist.push(xml.children[i]);
		}
	}
	return elist;
}
function tagFromXML(tag: string, xml: Element): Element{
    // return a given tag from an XML element, ensuring there is at most one of it.
    //let elist = xml.children;//getElementsByTagName(tag); //retrieve nodes matching the given pathtry{
	let elist = tagsFromXML(tag, xml);
    if(elist.length == 1){
        return elist[0];
    }else if(elist.length == 0){
		throw "There is no <"+tag+"> tag in the XML";
	}else{
        console.log("multiple "+tag+" tags in the following XML (not allowed)");
        console.log(xml);
		console.log(elist);
        throw "Got multiple <"+tag+"> tags but exactly one is required.";
    }
}
function arrayFromXML<T extends CopiableFromXML>(c: new () => T, tag: string, xml: Element, allowEmpty: boolean=true): Array<T>{
    //Copy all XML tags with a given tag name ("key") into an array, converting each to the given type
    let elist = tagsFromXML(tag, xml); //retrieve the tags we want to turn into objects
    if(!allowEmpty) assert(elist.length > 0, "Error: couldn't find a node matching '"+tag+"'");
    //try{
        let objects = new Array<T>();
        for(let i=0; i<elist.length; i++){
            let o = new c();
            o.copyFromXML(elist[i]);
            objects.push(o);
        }
        return objects;
    //}catch(e){
        //console.log("Error: couldn't load objects matching <'"+tag+"'> error: "+e);
    //}
}
function objectFromXML<T extends CopiableFromXML>(c: new () => T, tag: string, xml: Element, allowEmpty: boolean=true):T|null{
	// restore XML tags to objects, given the constructor of a class that contains the tags.
    let objects = arrayFromXML(c, tag, xml, allowEmpty);
    if(objects.length == 1){
		return objects[0];
    }else if(objects.length == 0){
		if(allowEmpty) return null;
		else throw "There were no <"+tag+"> tags, and one is required.";
	}else{
		throw "There were multiple <"+tag+"> tags, and at most one is required.";
	}
}
function stringArrayFromXML(tag: string, xml: Element, allowEmpty: boolean=true): Array<string>{
    // Return an array with the text values of all the tags of a given type
    // NB may have trouble if the text values are missing, or the XPath matches non-Element nodes
    let elist = tagsFromXML(tag, xml); //retrieve tags matching the given path
    if(!allowEmpty) assert(elist.length > 0, "Error: couldn't find a node matching '"+tag+"'");
    try{
        let strings = new Array<string>();
        for(let i=0; i<elist.length; i++){
            strings.push(elist[i].textContent);
        }
        return strings;
    }catch(e){
        console.log("Missing property: "+tag+" error: "+e);
    }
}
function stringFromXML(tag: string, xml: Element, allowEmpty: boolean=true): string{
    // Return the text stored in a given tag (specified by the tag), checking there's only one tag.
    let objects = stringArrayFromXML(tag, xml, allowEmpty);
    assert(objects.length <= 1, "Error: multiple nodes matched '"+tag+"' and at most one was required.");
    if(objects.length == 1) return objects[0];
    else return null;
}

/**
 * Bill of materials
 */

export class Bom {
    public bom: Map<string,number>=new Map<string,number>();  //part-id

   /**
    * Add to BOM
    * 
    * @param p The part
    * @param n Quantity
    */
    public addPart(p:string,n:number){
        if(n==0)
            n=1;
        if(this.bom.has(p))
            this.bom.set(p,this.bom.get(p)+n);
        else
            this.bom.set(p,n)
    }
    

    public addBom(b:Bom,n:number){
        if(n==0)
            n=1;
        for(let p of b.bom.keys()){
            this.addPart(p,b.bom.get(p)*n);
        }
        
    }
    public isEmpty():boolean{
        return this.bom.size==0;
    }
    
}

/**
 * One author
 */
export class Author implements CopiableFromXML{
    public id: string; //Secondary copy
    
    public name: string;
    public email: string;
    public orcid: string;
    public affiliation: string;

    /**
     * Copy (for parsing)
     */
    copyfrom(o:Author):void{
        Object.assign(this,o);
    }
    copyFromXML(xml:  Element): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.name = stringFromXML("name", xml);
        this.email = stringFromXML("email", xml);
        this.orcid = stringFromXML("orcid", xml);
        this.affiliation = stringFromXML("affiliation", xml);
    }
}

/**
 * One brick
 */
export class Brick implements CopiableFromXML{
    public id:string; //Secondary store    
    public name: string;
    public abstract: string;
    public long_description: string;
    public notes: string;
    public license: string;
    public files: MediaFile[];
    public authors: string[]; //RWB27 changed this from [string] because the former implies only ever one author??
    public functions: BrickFunction[];  //should not be used after import //changed from [bf] by rwb27
    public mapFunctions:Map<string,BrickFunction>=new Map<string,BrickFunction>();
    public instructions: StepByStepInstruction[];


    /**
     * Get BOM as only what this particular brick contains
     */
    public getBom(proj:Project, recursive:boolean):Bom {
        var bom:Bom=new Bom();

        console.log("functions");
        console.log(this.functions);
        for(let func of this.mapFunctions.values()){
            func.implementations.forEach(function(imp:FunctionImplementation){
                if(imp.isPart()){
                    var p:Part=imp.getPart(proj);
                    //bom.addPart(p.id, +func.quantity);
                    bom.addPart(p.id, imp.quantity);
                } else if(imp.isBrick()){
                    if(recursive){
                        var b:Bom=imp.getBrick(proj).getBom(proj,true);
                        //bom.addBom(b,+func.quantity);                    
                        bom.addBom(b,imp.quantity);                    
                    }
                } else {
                    console.log("bad imp type"+imp.type);
                }
            });
        }
        console.log("bom");
        console.log(bom);
        return bom;
    }


    /**
     * Get bricks this brick has as direct children
     */
    public getChildBricks():Set<string> {
        var referenced:Set<string> = new Set<string>();
        //this.mapFunctions.values().forEach(function(func:BrickFunction){
        for(let func of this.mapFunctions.values()){
            func.implementations.forEach(function(imp:FunctionImplementation){
                if(imp.isBrick()){
                    referenced.add(imp.id);               
                }
            });
        }
        return referenced;
    }
    
    /**
     * Copy (for parsing)
     */
    copyfrom(o:Brick):void{
        Object.assign(this,o);
        this.functions=<[BrickFunction]>[];
        var t:Brick=this;
        //Copy sub-bricks and functions
        o.functions.forEach(function(ofunc:BrickFunction,index:number){
            var f:BrickFunction=new BrickFunction();
            f.copyfrom(ofunc);
            //t.functions.push(f);
            f.id=""+index;
            t.mapFunctions.set(""+index,f);
        });
    }

    copyFromXML(xml:  Element): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.name = stringFromXML("name", xml);
        this.abstract = stringFromXML("abstract", xml);
        this.long_description = stringFromXML("long_description", xml);
        this.notes = stringFromXML("notes", xml);
        this.license = stringFromXML("license", xml);
        this.authors = stringArrayFromXML("authors", xml);
        this.functions = arrayFromXML(BrickFunction, "function", xml);
        this.instructions = arrayFromXML(StepByStepInstruction, "assembly_instruction", xml);
        this.files = mediaFilesFromXML(xml);
        for(let i in this.functions){
            this.mapFunctions.set(""+i, this.functions[i]);
        }
    }

}

/**
 * One function for a brick
 */
export class BrickFunction implements CopiableFromXML{
    public id: string;

    public description: string;
    public designator: string;
    public quantity: string;  //deprecated
    public implementations: FunctionImplementation[];


    copyfrom(o:BrickFunction):void{
        Object.assign(this,o);
        this.implementations=<[FunctionImplementation]>[];
        o.implementations.forEach((oi:FunctionImplementation,index:number) => {
            var f:FunctionImplementation=new FunctionImplementation();
            f.copyfrom(oi);
            this.implementations.push(f);
        });
    }
    copyFromXML(xml:  Element): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.description = stringFromXML("description", xml);
        this.designator = stringFromXML("designator", xml);
        this.quantity = stringFromXML("quantity", xml);
        this.implementations = arrayFromXML(FunctionImplementation, "implementation", xml);
    }
}

export class FunctionImplementation implements CopiableFromXML{
    public type: string; //"part" or "brick"
    public id: string;
    public quantity: number;

    public isPart():boolean{
        return this.type=="part";
    }
    public isBrick():boolean{
        return this.type=="brick";
    }
    public getPart(proj:Project):Part{
        return proj.getPartByName(this.id);//parts[+this.id];
    }
    public getBrick(proj:Project):Brick{
        return proj.getBrickByName(this.id);//bricks[+this.id];
    }
    
    copyfrom(oi:FunctionImplementation){
        Object.assign(this,oi);
        /*this.id=oi.id;
        this.quantity=oi.quantity;
        this.type=oi.type;*/
    }

    copyFromXML(xml:  Element): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.type = attributeFromXML("type", xml, null);
        if(this.type=="physical_part"){
            this.type="part";
        }
        this.quantity = Number(stringFromXML("quantity", xml));
    }
}

/**
 * One associated file
 */
export class MediaFile implements CopiableFromXML{
    public url: string;
    copyFromXML(xml:  Element): void{
        this.url = attributeFromXML("url", xml, null);
    }
}
function mediaFilesFromXML(xml:  Element): MediaFile[]{
    //convenience function for populating files lists from  Element
    let media = tagFromXML("media", xml);
    //return [];
    //try{
        return arrayFromXML(MediaFile, "file", media as  Element);
    //}catch(e){
    //    return [];
    //}
}

/**
 * One part
 */
export class Part implements CopiableFromXML{
    public id: string; //secondary
    
    public name: string;
    public description: string;

    public supplier: string;
    public supplier_part_num: string;
    public manufacturer_part_num: string;
    public url: string;

    public material_amount: string;
    public material_unit: string;

    public files: MediaFile[];

    public manufacturing_instruction: StepByStepInstruction;

    copyfrom(o:Part):void{
        Object.assign(this,o);
    }
    copyFromXML(xml:  Element): void{
        this.id = idFromXML(xml);
        this.name = stringFromXML("name", xml);
        this.description = stringFromXML("description", xml);
        if(this.name == null || this.name.length==0){
            this.name = this.description;
        }
        this.supplier = stringFromXML("supplier", xml);
        this.supplier_part_num = stringFromXML("supplier_part_num", xml);
        this.manufacturer_part_num = stringFromXML("manufacturer_part_num", xml);
        this.url = stringFromXML("url", xml);
        this.material_amount = stringFromXML("material_amount", xml);
        this.material_unit = stringFromXML("material_unit", xml);
        this.files = mediaFilesFromXML(xml);
        this.manufacturing_instruction = objectFromXML(StepByStepInstruction, "manufacturing_instruction", xml);
    }
}

/**
 * One step-by-step instruction
 */
export class StepByStepInstruction implements CopiableFromXML{
    public name: string;
    public steps: AssemblyStep[];

    copyFromXML(xml:  Element): void{
        this.name = attributeFromXML("name", xml);
        this.steps = arrayFromXML(AssemblyStep, "step", xml); //load correctly from XML file
        //this.steps = [{components:[], description:"test step", files:[]}];//this works (untyped objects)
        
        /*let teststep = new AssemblyStep();
        teststep.files = [];
        teststep.components = [];
        teststep.description = "test step with correct type";
        this.steps = [teststep];//arrayFromXML(AssemblyStep, "step", xml);*/
    }
}

/**
 * One assembly step (or any instruction step)
 */
export class AssemblyStep implements CopiableFromXML{
    public description: string;
    public files: MediaFile[];
    public components: AssemblyStepComponent[];

    copyFromXML(xml:  Element): void{
        this.description = stringFromXML("description", xml);
        this.files = mediaFilesFromXML(xml);
        this.components = arrayFromXML(AssemblyStepComponent, "component", xml);
    }
}

/**
 * reference - to be removed?
 */
export class AssemblyStepComponent implements CopiableFromXML{
    public quantity: string;
    public id: string;

    copyFromXML(xml:  Element): void{
        this.quantity = stringFromXML("quantity", xml);
        this.id = idFromXML(xml);
    }
}


export class BrickTree{
    public brick:Brick;
    public children:BrickTree[]=[];
}




/**
 * One docubricks project
 */
export class Project implements CopiableFromXML{
    public bricks:Brick[]=[];
    public parts:Part[]=[];
    public authors:Author[]=[];
//    public mapBricks:Map<string,Brick>=new Map<string,Brick>();    //discards order. SHOULD use bricks[]
    public mapParts:Map<string,Part>=new Map<string,Part>();
    public mapAuthors:Map<string,Author>=new Map<string,Author>();
	public base_url:string="./project/";


    public getBrickByName(id:string):Brick{
        for(let b of this.bricks)
            if(b.id==id)
                return b;
        //var b:Brick=this.mapBricks.get(id)
        //if(b===undefined){
        console.error("---- no such brick \""+id+"\"");
        console.error(this.bricks)
        //for(let of of this.bricks)
        //    console.error(i);
        return null;
        //}
        //return b;
    }
    
    public getPartByName(id:string):Part{
        if(this.mapParts.get(id) == null){
            console.log("BAD PART ID: "+id);
        }
        return this.mapParts.get(id);
    }
    
    public getAuthorById(id:string):Author{
        return this.mapAuthors.get(id);
    }
    
    
    /**
     * Get all the roots. Hopefully only one
     */
    public getRootBricks():string[]{
        //See what is referenced
        var referenced:Set<string> = new Set<string>();
   
        //for(let b of this.mapBricks.values()){
        for(let b of this.bricks){
            for(let c of b.getChildBricks())
                referenced.add(c);
        }
        //Pick unreferenced bricks as roots
        var roots:string[]=[];
        for(let b of this.bricks)
            if(!referenced.has(b.id))
                roots.push(b.id);
        
        //Backup: Pick anything as the root. Not great but better
        if(roots.length==0)
            for(let b of this.bricks){
                roots.push(b.id);
                break;
            }
        return roots;
    }


    public getBrickTree():[BrickTree]{
        var thetree:[BrickTree]=<[BrickTree]>[];
    
        
        //Pick unreferenced bricks as roots
        var roots:string[]=this.getRootBricks();
        var referenced:Set<string> = new Set<string>();
        for(let b of this.bricks)
            if(!referenced.has(b.id))
                thetree.push(this.getBrickTreeR(this, b, referenced));
        return thetree;
    }

    getBrickTreeR(thisProject:Project, thisbrick:Brick, referenced:Set<string>): BrickTree {
        var t:BrickTree=new BrickTree();
        t.brick=thisbrick;//this.mapBricks.get(thisbrick);//bricks[+thisbrick];
        referenced.add(thisbrick.id);
        var children:Set<string>=thisbrick.getChildBricks();
        for(let c of children){
            if(!referenced.has(c)){
                t.children.push(thisProject.getBrickTreeR(thisProject, 
                        thisProject.getBrickByName(c), referenced));
            }
        }
        return t;
    }
    
    
    /**
     * For parsing only
     */
    public copyfrom(o:Project):void{
        //Copy bricks
        for(let ob of o.bricks){
            //var ob:Brick=o.bricks[index];
            var b:Brick=new Brick();
            b.copyfrom(ob);
            //var si:string=""+index;
            //b.id=si;
            this.bricks.push(b);
            //this.mapBricks.set(si,b);
        };
        //Copy parts
        for(let op of o.parts){
            var p:Part=new Part();
            p.copyfrom(op);
            this.mapParts.set(p.id,p);
        };
        //Copy authors
        for(let oa of o.authors){
            var a:Author=new Author();
            a.copyfrom(oa);
            this.mapAuthors.set(a.id,a);
        };
        
        
    }
    public copyFromXML(xml:  Element): void{
        console.log("Parsing bricks");
        this.bricks = arrayFromXML(Brick, "brick", xml);
        console.log("Parsing parts");
        this.parts = arrayFromXML(Part, "physical_part", xml);
        console.log("Parsing authors");
        this.authors = arrayFromXML(Author, "author", xml);
        console.log("Parsed project, building maps...");
        for(let p of this.parts){
            this.mapParts.set(p.id,p);
        }
        for(let a of this.authors){
            this.mapAuthors.set(a.id,a);
        }
        console.log("Project successfully reconstructed from XML")
    }

    /**
     * Get the name of the project - use the name of the root brick
     */
    public getNameOfProject():string{
        var roots:string[] = this.getRootBricks();
        if(roots.length>0){
            var root:Brick=this.getBrickByName(roots[0]);
            return root.name;
        } else
            return "";
    }
}


    
   

export function docubricksFromJSON(s:string):Project{
    var proj:Project=<Project>JSON.parse(s);    

    var realproj:Project=new Project();
    realproj.copyfrom(proj);
    console.log("successfully created docubricks project ",realproj);
    return realproj;
}

export function docubricksFromXML(s:string, callback: (p: Project)=>any ){
    let xmldoc = new DOMParser().parseFromString(s, "application/xml");
    var proj:Project=new Project();

    //Copy bricks
    proj.copyFromXML(xmldoc.documentElement);
    console.log("successfully created docubricks project ",proj);

    callback(proj); //I really hate JS callbacks :(
}



// WEBPACK FOOTER //
// ./src/docubricks.ts