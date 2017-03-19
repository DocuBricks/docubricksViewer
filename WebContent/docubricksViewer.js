"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class DocubricksProject extends React.Component {
    renderBrickTree(t) {
        var mnodes = [];
        for (let n of t) {
            mnodes.push(this.renderBrickTreeR(n));
        }
        return React.createElement("ul", null, mnodes);
    }
    renderBrickTreeR(t) {
        var proj = this.props.proj;
        var mnodes = [];
        for (let c of t.children) {
            mnodes.push(React.createElement("li", { key: "treechild_" + c.brick.id }, this.renderBrickTreeR(c)));
        }
        return React.createElement("div", { key: "treenode_" + t.brick.id },
            React.createElement("a", { href: "#brick_" + t.brick.id }, t.brick.name),
            React.createElement("ul", null, mnodes));
    }
    render() {
        var proj = this.props.proj;
        document.title = "DocuBricks - " + proj.getNameOfProject();
        var brickTree = proj.getBrickTree();
        console.log(brickTree);
        var itemsAuthors = [];
        for (let a of proj.mapAuthors.values()) {
            itemsAuthors.push(React.createElement(Author, { key: "author_" + a.id, proj: proj, authorid: a.id }));
        }
        var itemsBricks = [];
        for (let b of proj.bricks) {
            itemsBricks.push(React.createElement("div", { key: b.id },
                " ",
                React.createElement(Brick, { proj: proj, brickid: b.id })));
        }
        var itemsParts = [];
        for (let b of proj.mapParts.values()) {
            itemsParts.push(React.createElement("div", { key: b.id },
                " ",
                React.createElement(Part, { proj: proj, partid: b.id })));
        }
        console.log(proj);
        var itemsTotalBom = [];
        var roots = proj.getRootBricks();
        if (roots.length > 0) {
            var root = proj.getBrickByName(roots[0]);
            var bom = root.getBom(proj, true);
            itemsTotalBom.push(React.createElement("div", null,
                React.createElement("div", { className: "divbom" },
                    React.createElement("h1", { id: "bom" }, "Total bill of materials for this project")),
                React.createElement(BomList, { proj: proj, bom: bom })));
        }
        else {
            console.log("no root brick found for bom");
        }
        var projectid = getQueryStringValue("id");
        var downloadlink = "DownloadZip?id=" + projectid;
        return React.createElement("div", null,
            React.createElement("div", null),
            React.createElement("div", { className: "page-container" },
                React.createElement("div", { className: "navbar navbar-default navbar-fixed-top", role: "navigation" },
                    React.createElement("div", { className: "container" },
                        React.createElement("div", { className: "navbar-header" },
                            React.createElement("button", { type: "button", className: "navbar-toggle", "data-toggle": "offcanvas", "data-target": ".sidebar-nav" },
                                React.createElement("span", { className: "icon-bar" }),
                                React.createElement("span", { className: "icon-bar" }),
                                React.createElement("span", { className: "icon-bar" })),
                            React.createElement("a", { className: "navbar-brand", href: "./" }, "DocuBricks")))),
                React.createElement("div", { className: "container" },
                    React.createElement("div", { className: "row row-offcanvas row-offcanvas-left" },
                        React.createElement("div", { className: "col-xs-12 col-sm-3 sidebar-offcanvas no-print", id: "sidebar", role: "navigation" },
                            React.createElement("ul", { className: "nav", "data-spy": "affix" },
                                React.createElement("li", null,
                                    React.createElement("a", { href: downloadlink }, "Download project")),
                                React.createElement("li", null,
                                    React.createElement("a", { href: "#", id: "btn-1", "data-toggle": "collapse", "data-target": "#submenu1", "aria-expanded": "false" }, "Bricks"),
                                    React.createElement("li", { className: "nav collapse", id: "submenu1", role: "menu", "aria-labelledby": "btn-1" }, this.renderBrickTree(brickTree))),
                                React.createElement("li", null,
                                    React.createElement("a", { href: "#partstart" }, "Parts")),
                                React.createElement("li", null,
                                    React.createElement("a", { href: "#bom" }, "Bill of materials")),
                                React.createElement("li", null,
                                    React.createElement("a", { href: "#authors" }, "Authors")))),
                        React.createElement("div", { className: "col-xs-12 col-sm-9", id: "main-content" },
                            React.createElement("div", null,
                                React.createElement("div", { id: "brickstart" }, itemsBricks),
                                React.createElement("div", { id: "partstart" }, itemsParts),
                                React.createElement("div", { className: "brickdiv" },
                                    React.createElement("h3", { id: "authors" }, "Authors")),
                                React.createElement("table", null,
                                    React.createElement("thead", null,
                                        React.createElement("tr", null,
                                            React.createElement("th", null, "Name"),
                                            React.createElement("th", null, "E-mail"),
                                            React.createElement("th", null, "Affiliation"),
                                            React.createElement("th", null, "ORCID"))),
                                    React.createElement("tbody", null, itemsAuthors)),
                                itemsTotalBom))))));
    }
}
exports.DocubricksProject = DocubricksProject;
class Brick extends React.Component {
    render() {
        var proj = this.props.proj;
        var brickid = this.props.brickid;
        var brick = proj.getBrickByName(brickid);
        var brickkey = "brick" + this.props.brickid;
        const pStyle = {
            textAlign: "left"
        };
        var mnodes = [];
        var addField = function (name, value) {
            if (value != "")
                mnodes.push(React.createElement("p", { key: brickkey + "_" + name },
                    React.createElement("b", null,
                        name,
                        ": "),
                    value));
        };
        addField("Description", brick.long_description);
        mnodes.push(React.createElement("p", { key: brickkey + "_brickabstract", style: pStyle }, brick.abstract));
        mnodes.push(React.createElement(Files, { key: brickkey + "_files", proj: proj, files: brick.files, basekey: brickkey }));
        addField("License", brick.license);
        addField("Notes", brick.notes);
        if (brick.authors.length != 0) {
            var alist = "";
            for (let a of brick.instructions) {
                if (alist.length != 0) {
                    alist = alist + ", " + a.name;
                }
                else
                    alist = a.name;
            }
            addField("Authors", brick.notes);
        }
        var reqnodes = [];
        for (let func of brick.mapFunctions.values()) {
            var fnodes = [];
            for (let imp of func.implementations) {
                var impend = "";
                if (fnodes.length != 0)
                    fnodes.push(React.createElement("b", null, ", "));
                if (imp.isPart()) {
                    var ip = imp.getPart(proj);
                    fnodes.push(React.createElement("a", { href: "#part_" + imp.id },
                        ip.name,
                        " ",
                        React.createElement("b", null,
                            "x ",
                            imp.quantity)));
                }
                else if (imp.isBrick()) {
                    var ib = imp.getBrick(proj);
                    fnodes.push(React.createElement("a", { href: "#brick_" + imp.id },
                        ib.name,
                        " ",
                        React.createElement("b", null,
                            "x ",
                            imp.quantity)));
                }
            }
            var desc = "";
            if (func.description != "")
                desc = func.description + ": ";
            reqnodes.push(React.createElement("li", null,
                React.createElement("b", null, desc),
                fnodes));
        }
        var reqnodes2 = [];
        if (reqnodes.length != 0) {
            reqnodes2 = [React.createElement("div", null,
                    React.createElement("b", null, "Requires:"),
                    React.createElement("ul", null, reqnodes))];
        }
        var instrnodes = [];
        for (let instr of brick.instructions) {
            instrnodes.push(React.createElement("div", { key: brickkey + "_" + instr.name },
                React.createElement(InstructionList, { proj: proj, brick: brick, part: null, instr: instr })));
        }
        var ret = React.createElement("div", null,
            React.createElement("div", { className: "brickdiv" },
                React.createElement("h1", { id: "brick_" + brickid }, brick.name)),
            mnodes,
            reqnodes2,
            instrnodes);
        return ret;
    }
}
exports.Brick = Brick;
class Part extends React.Component {
    render() {
        var proj = this.props.proj;
        var partid = this.props.partid;
        var part = proj.getPartByName(partid);
        var partkey = "part" + partid;
        var mnodes = [];
        var addField = function (name, value) {
            if (value != "")
                mnodes.push(React.createElement("p", { key: partkey + "_" + name },
                    React.createElement("b", null,
                        name,
                        ": "),
                    value));
        };
        addField("Description", part.description);
        mnodes.push(React.createElement(Files, { key: partkey + "_files", proj: proj, files: part.files, basekey: partkey }));
        addField("Supplier", part.supplier);
        addField("Supplier catalog #", part.supplier_part_num);
        addField("Manufacturer catalog #", part.manufacturer_part_num);
        if (part.url != "")
            mnodes.push(React.createElement("p", { key: partkey + "_url" },
                React.createElement("b", null, "URL: "),
                formatURL(part.url)));
        if (part.material_amount != "")
            addField("Material usage", part.material_amount + " " + part.material_unit);
        if (part.manufacturing_instruction.steps.length != null) {
            mnodes.push(React.createElement("div", { key: partkey + "_instr" },
                React.createElement(InstructionList, { proj: proj, brick: null, part: part, instr: part.manufacturing_instruction })));
        }
        var ret = React.createElement("div", null,
            React.createElement("div", { className: "partdiv" },
                React.createElement("h3", { id: "part_" + partid },
                    "Part: ",
                    part.name)),
            mnodes);
        return ret;
    }
}
exports.Part = Part;
class Author extends React.Component {
    render() {
        var proj = this.props.proj;
        var author = proj.getAuthorById(this.props.authorid);
        return React.createElement("tr", { key: "authorrow_" + author.id },
            React.createElement("td", null, author.name),
            React.createElement("td", null, author.email),
            React.createElement("td", null, author.affiliation),
            React.createElement("td", null, author.orcid));
    }
}
exports.Author = Author;
class InstructionList extends React.Component {
    render() {
        var proj = this.props.proj;
        var brick = this.props.brick;
        var instr = this.props.instr;
        var key;
        if (brick != null)
            key = "instrBrick" + brick.id + "_instr" + instr.name;
        else
            key = "instrPart" + this.props.part.id + "_instr" + instr.name;
        var snodes = [];
        var curstep = 1;
        for (let step of instr.steps) {
            var stepkey = key + "_" + curstep;
            snodes.push(React.createElement("div", { key: stepkey },
                React.createElement("nav", null,
                    React.createElement(Files, { proj: proj, files: step.files, basekey: stepkey })),
                React.createElement("article", null,
                    React.createElement("hr", null),
                    React.createElement("b", null,
                        "Step ",
                        curstep,
                        ". "),
                    step.description)));
            const divclear = { clear: "both" };
            snodes.push(React.createElement("div", { key: stepkey + "_end", style: divclear }));
            curstep++;
        }
        var instrtitle = "Instruction: " + instr.name;
        if (instr.name == "assembly")
            instrtitle = "Assembly instruction";
        if (snodes.length > 0)
            return React.createElement("div", { key: key + "_main" },
                React.createElement("h3", null, instrtitle),
                snodes);
        else
            return React.createElement("div", { key: key + "_main" });
    }
}
exports.InstructionList = InstructionList;
class BomList extends React.Component {
    render() {
        var proj = this.props.proj;
        var snodes = [];
        var roots = proj.getRootBricks();
        if (roots.length > 0) {
            var root = proj.getBrickByName(roots[0]);
            var bom = root.getBom(proj, true);
            var key = "mainbom_";
            var curstep = 1;
            for (let partid of bom.bom.keys()) {
                var quantity = bom.bom.get(partid);
                var part = proj.getPartByName(partid);
                var stepkey = key + curstep;
                curstep++;
                snodes.push(React.createElement("tr", { key: stepkey },
                    React.createElement("td", null, part.name),
                    React.createElement("td", null, quantity),
                    React.createElement("td", null, part.supplier),
                    React.createElement("td", null, part.supplier_part_num),
                    React.createElement("td", null, formatURL(part.url))));
            }
        }
        else {
            return React.createElement("div", null);
        }
        return React.createElement("div", { key: key + "_main" },
            React.createElement("table", null,
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Part"),
                        React.createElement("th", null, "Quantity"),
                        React.createElement("th", null, "Supplier"),
                        React.createElement("th", null, "Supplier part number"),
                        React.createElement("th", null, "URL"))),
                React.createElement("tbody", null, snodes)));
    }
}
exports.BomList = BomList;
var urlcount = 1;
var formatURL = function (url) {
    urlcount = urlcount + 1;
    var ret = [];
    if (url != "") {
        var s = new String(url);
        s = s.replace(/.+\:\/\//gi, "");
        s = s.replace(/\/.*/gi, "");
        ret.push(React.createElement("a", { key: "url_" + urlcount + "_" + url, href: url }, s.toString()));
    }
    return ret;
};
var formatURLfile = function (url, filename) {
    urlcount = urlcount + 1;
    var ret = [];
    if (url != "") {
        ret.push(React.createElement("p", { key: "url_" + urlcount + "_" + url },
            React.createElement("a", { href: url },
                React.createElement("b", null,
                    "File: ",
                    filename))));
    }
    return ret;
};
var getQueryStringValue = function (key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).
        replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
};
class Files extends React.Component {
    render() {
        var proj = this.props.proj;
        var files = this.props.files;
        function isImage(url) {
            return (url.toLowerCase().match(/\.(jpeg|jpg|gif|png|svg)$/) != null);
        }
        var projectid = getQueryStringValue("id");
        var basedir = "./project/";
        if (projectid != "") {
            basedir = "./project/" + projectid + "/";
        }
        var inodes = [];
        var fnodes = [];
        for (let f of files) {
            const imgStyle = {
                maxWidth: '300px',
                maxHeight: '300px',
                margin: '5px'
            };
            var imgurl = basedir + f.url;
            if (isImage(imgurl)) {
                inodes.push(React.createElement("a", { key: this.props.basekey + f.url, href: imgurl, "data-lightbox": "image" },
                    React.createElement("img", { src: imgurl, style: imgStyle })));
            }
            else {
                var s = new String(f.url);
                s = s.replace(/.*\//gi, "");
                fnodes.push(formatURLfile(imgurl, s.toString())[0]);
            }
        }
        return React.createElement("div", null,
            fnodes,
            inodes);
    }
}
exports.Files = Files;
//# sourceMappingURL=docubricksViewer.js.map