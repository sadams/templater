(function(){
    'use strict';
    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    /**
     *
     * @param {{
     *   [cacheRequests]:true,
     *   [noCompile]:false,
     *   templates:[
     *     {
     *       type:"singular",
     *       name:"standard",
     *       path:"./standard.html.tmpl"
     *     },
     *     {
     *       type:"singular",
     *       name:"paragraph",
     *       template:"<p><%= value %></p>"
     *     },
     *     {
     *       type:"multiple",
     *       sections:[{
     *         selector:"#keyval-template",
     *         name:"key_val"
     *       },{
     *         selector:"#checkbox",
     *         name:"checkbox"
     *       }],
     *       path:"./multiple.html.tmpl"
     *     }
     *   ]
     * }} options
     * @param {{}} [_jQuery] - jquery lib
     * @param {{}} [_underscore] - underscore lib
     * @param {{}} [_q] - Q promises lib
     * @returns {{getTemplate: getTemplate}}
     * @constructor
     */
    function Templater(options, _jQuery, _underscore, _q) {
        var TYPE_MULTIPLE = 'multiple';
        var TYPE_SINGULAR = 'singular';
        var $ = _jQuery || window.jQuery;
        var _ = _underscore || window._;
        var Q = _q || window.Q;
        var _requestsCache = {};


        function init() {
            options.cacheRequests = options.cacheRequests !== false;
            options.templates = options.templates || [];

            if (!Q) {
                throw new Error('Missing Q promises dependency');
            }

            if (!$) {
                throw new Error('Missing jQuery dependency');
            }

            if (!_) {
                throw new Error('Missing underscore dependency');
            }
        }

        function getFile(path) {
            if (!options.cacheRequests || !_requestsCache[path]) {
                _requestsCache[path] = new Q($.ajax(path));
            }
            return _requestsCache[path];
        }

        function compile(text) {
            if (options.noCompile) {
                return text;
            } else {
                return _.template(text);
            }
        }

        function resolveTemplate(template, name) {
            var deferred = Q.defer();
            var promise;
            if (name && template.singular && template.name !== name) {
                return;
            }
            if (template.path) {
                promise = getFile(template.path);
            } else {
                promise = Q.fcall(function () {
                    return template.template;
                });
            }
            promise.then(function(rawData) {
                var resolved = {};
                switch (template.type) {
                    case TYPE_MULTIPLE:
                        var $html = $(rawData);
                        _.each(template.sections, function(section){
                            resolved[section.name] = compile($html.filter(section.selector).text());
                        });
                        break;
                    case TYPE_SINGULAR:
                        resolved[template.name] = compile(rawData);
                        break;
                    default:
                        throw new Error("template type " + template.type + " invalid");
                }
                deferred.resolve(resolved);
            });
            return deferred.promise;

        }

        function resolveTemplates(templates) {
            var promises = [];
            _.each(templates, function(template) {
                promises.push(resolveTemplate(template));
            });
            return Q.all(promises);
        }

        function loadTemplates(alternativeTemplates, name) {
            return Q.all([
                resolveTemplates(options.templates, name),
                resolveTemplates(alternativeTemplates, name)
            ]).then(function(both){
                var merged = _.extend(//merge both with alternatives last
                    _.extend.apply(_, both[0]),//result from standard templates
                    _.extend.apply(_, both[1]) //result from alternatives
                );
                return merged;
            });
        }

        function getTemplate(name, alternativeTemplates) {
            return loadTemplates(alternativeTemplates, name).then(function(templates){
                return templates[name];
            });
        }

        init();

        return {
            getTemplate:getTemplate
        };
    }

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Templater;
        }
        exports.Templater = Templater;
    } else {
        root.Templater = Templater;
    }
}).call(this);