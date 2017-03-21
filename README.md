Docubricks viewer
===========================

Viewer for [docubricks](http://docubricks.com/) - high quality Open Science Hardware documentations.


Built using React and Webpack


#### Build

``
$ webpack
``


#### Devbuild

```
$ npm install -g webpack-dev-server
$ webpack-dev-server --host 0.0.0.0 --port 8080

```


#### Docubricks structure:

```
Definitions The following lists define the elements of the DocuBricks XML format

<docubricks> tag for the start of DocuBricks documentation of the project; the brackets are not written in the following definitions

author id(string):
  name (string)
  email (string)
  orcid (string)
  affiliation (string)

part id(string):
  name (string)
  description (string)
  supplier (string)
  supplier_part_num (string)
  manufacturer_part_num (string)
  url (string) link to an internet source of the part
  material_amount (string)
  material_unit (string)
  media: file(s) (url) images, videos, CAD files, and more
  manufacturing_instruction: step(s): step by step instructions
      description (string)
      media: file(s) (url)

brick id(string):
  name (string)
  abstract (string)
  long_description (string)
  notes (string)
  media: file (url)
  license (string)
  author(s) (id(string))
  function(s) (id(string)):
      description (string) name of the function
      implementation(s) (type(“brick” or “part”), id(string) of brick or part respectively, quantity (string) how many pieces of this implementation are needed)

  assembly_instruction: step(s): step by step instructions
      description (string)
      media: file(s) (url)
      component(s) (id(string) of function) local reference to functions in the brick needed as component in this assembly step

  custom_instruction(s) type(string): step(s): other step by step instructions of custom type e.g. safety, testing, calibration, user_manual, improvement_suggestions, etc.
      description (string)
      media: file(s) (url)
</ docubricks >

```
