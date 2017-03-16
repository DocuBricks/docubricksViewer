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
//        console.log("fff "+this.bom.get(p));
        if(n==0)
            n=1;
        if(this.bom.has(p))
            this.bom.set(p,this.bom.get(p)+n);
        else
            this.bom.set(p,n)
//        console.log("ggg "+this.bom.get(p));
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
export class Author {
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

}

/**
 * One brick
 */
export class Brick {
    public id:string; //Secondary store    
    public name: string;
    public abstract: string;
    public long_description: string;
    public notes: string;
    public license: string;
    public files: MediaFile[];
    public authors: [string];
    public functions: [BrickFunction];
    public mapFunctions:Map<string,BrickFunction>=new Map<string,BrickFunction>();
    public instructions: StepByStepInstruction[];


    /**
     * Get BOM as only what this particular brick contains
     */
    public getBom(proj:Project, recursive:boolean):Bom {
        var bom:Bom=new Bom();
    
        this.functions.forEach(function(func:BrickFunction){
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
        });
        return bom;
    }


    /**
     * Get bricks this brick has as direct children
     */
    public getChildBricks():Set<string> {
        var referenced:Set<string> = new Set<string>();
        this.functions.forEach(function(func:BrickFunction){
            func.implementations.forEach(function(imp:FunctionImplementation){
                if(imp.isBrick()){
                    referenced.add(imp.id);               
                }
            });
        });
        return referenced;
    }
    
    /**
     * Copy (for parsing)
     */
    copyfrom(o:Brick):void{
        Object.assign(this,o);
        this.functions=<[BrickFunction]>[];
        var t:Brick=this;
        //Copy sub-bricks
        o.functions.forEach(function(ofunc:BrickFunction,index:number){
            var f:BrickFunction=new BrickFunction();
            f.copyfrom(ofunc);
            t.functions.push(f);
        });
    }

}

/**
 * One function for a brick
 */
export class BrickFunction {
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
}

export class FunctionImplementation {
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
        this.id=oi.id;
        this.quantity=oi.quantity;
        this.type=oi.type;
    }
}

/**
 * One associated file
 */
export class MediaFile {
    public url: string;
}

/**
 * One part
 */
export class Part {
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
}

/**
 * One step-by-step instruction
 */
export class StepByStepInstruction {
    public name: string;
    public steps: AssemblyStep[];
}

/**
 * One assembly step (or any instruction step)
 */
export class AssemblyStep {
    public description: string;
    public files: MediaFile[];
    public components: AssemblyStepComponent[];
}

/**
 * reference - to be removed?
 */
export class AssemblyStepComponent {
    public quantity: string;
    public id: string;
}


export class BrickTree{
    public brick:Brick;
    public children:BrickTree[]=[];
}




/**
 * One docubricks project
 */
export class Project {
    public bricks:Brick[]=[];
    public parts:Part[]=[];
    public authors:Author[]=[];
    public mapBricks:Map<string,Brick>=new Map<string,Brick>();
    public mapParts:Map<string,Part>=new Map<string,Part>();
    public mapAuthors:Map<string,Author>=new Map<string,Author>();


    public getBrickByName(id:string):Brick{
        var b:Brick=this.mapBricks.get(id)
        if(b===undefined){
            console.error("---- no such brick \""+id+"\"");
            for(let i of this.mapBricks.keys())
                console.error(i);
        }
        return b;
    }
    
    public getPartByName(id:string):Part{
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
   
        for(let b of this.mapBricks.values()){
            for(let c of b.getChildBricks())
                referenced.add(c);
        }
        //Pick unreferenced bricks as roots
        var roots:string[]=[];
        for(let b of this.mapBricks.values())
            if(!referenced.has(b.id))
                roots.push(b.id);
        
        //Backup: Pick anything as the root. Not great but better
        if(roots.length==0)
            for(let b of this.mapBricks.values()){
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
        for(let b of this.mapBricks.values())
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
        for(let index in o.bricks){
            var ob:Brick=o.bricks[index];
            var b:Brick=new Brick();
            b.copyfrom(ob);
            var si:string=""+index;
            b.id=si;
            this.mapBricks.set(si,b);
        };
        //Copy parts
        for(let index in o.parts){
            var op:Part=o.parts[index];
            var p:Part=new Part();
            p.copyfrom(op);
            p.id=""+index;
            this.mapParts.set(index,p);
        };
        //Copy authors
        for(let index in o.authors){
            var oa:Author=o.authors[index];
            var a:Author=new Author();
            a.copyfrom(oa);
            a.id=""+index;
            this.mapAuthors.set(index,a);
        };
        
        
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
    return realproj;
}
