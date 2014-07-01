# templater

Simple lib for getting and overriding [underscorejs](http://underscorejs.org/#template) based templates on the front-end.

## test

QUnit tests can be run using:

    npm install
    bower install
    npm install grunt-cli -g 
    grunt
    
or in the browser:

    npm install
    bower install
    npm install -g grunt-cli http-server 
    grunt build
    http-server
    open 'http://localhost:8080/tests' #mac command to open in browser

## requirements

### mandatory

* [jQuery](http://jquery.com/) v. 1.6+
* [underscore.js](underscorejs.org) v. 1.6+
* [Q promise library](https://github.com/kriskowal/q)

### optional

- [QUnit for testing](http://qunitjs.com/) - just `bower install`

## examples

Assuming you have two template files in a templates directory, one which holds multiple templates (e.g. templates 'a' and 'b' in `./templates/multiple.html.tmpl`) separated by dom elements:
```
<script id="my-template">
<%= multipleOne %> multiple one
</script>

<script id="my-other-template">
<%= multipleOther %> multiple two
</script>
```

And another with 1 template in it as an override for template 'b' (in `./templates/singular.html.tmpl`):
```
<%= single %> foo bar
<%= templatesingle %> fooo
```

Then you can setup which templates are where on construction and use promise based api to `getTemplate` by name (`./index.html`): 

```
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
    <script src="../libs/jquery/dist/jquery.js"></script>
    <script src="../libs/underscore/underscore.js"></script>
    <script src="../libs/q/q.js"></script>
    <script src="../dist/Templater.min.js"></script>
    <script>
        var templater = new Templater(
               {
                   templates:[
                       {
                           type:"multiple",
                           sections:[{
                               selector:"#my-template",
                               name:"templateOne"
                           },{
                               selector:"#my-other-template",
                               name:"othertempl"
                           }],
                           path:"./templates/multiple.html.tmpl"
                       },
                       {
                           type:"singular",
                           name:"othertempl",
                           path:"./templates/alternative.html.tmpl"
                       }
                   ]
               }
           );
           templater.getTemplate('othertempl').then(function(template){
               $('body').append(template({multipleOther:'ERN'}));
               // will output: 'ALTERNATIVE\n<p>FOOOOOO</p>'
           }).then(templater.getTemplate('templateOne')).then(function(template){
               $('body').append(template({multipleOne:'foo'}));
               // will output: 'foo multiple one'
           });
    </script>
</head>
<body>
</body>
</html>
```
