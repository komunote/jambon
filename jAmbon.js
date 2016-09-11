
'use strict';
var $, _, jAmbon, utils, require, define, c;

(function () {

    // methods not below are only accessible by prototype
    _ = jAmbon = function (el) {
        if (!this) {
            return c(el);
        }
        //this.el = el;
        this.getElements = _.els;
        this.getConfig = _.getConfig;
        this.setConfig = _.setConfig;
        this.find = _.find;
        this.append = _.append;
        this.attach = _.attach;
        this.onClick = _.onClick;
        this.get = _.get;
        this.post = _.post;
        this.load = _.load;
        this.template = _.template;
        this.addClass = _.addClass;
        this.removeClass = _.removeClass;
        this.onModalClick = _.onModalClick;
        this.onModalClose = _.onModalClose;
    };

    _.el = document;

    _.els = function () {
        return this.el;
    };

    _._config = {
        cordova: false,
        paths: {
            js: "/",
            html: "/",
            route: "/"
        }
    };

    _.getConfig = function () {
        return _._config;
    };

    _.setConfig = function (conf) {
        if (typeof conf !== 'undefined') {
            if (typeof conf.cordova !== 'undefined') {
                _._config.cordova = conf.cordova;
            }

            if (typeof conf.paths !== 'undefined') {
                _._config.paths.js = conf.paths.js ? conf.paths.js : '/';
                _._config.paths.html = conf.paths.html ? conf.paths.html : '/';
                _._config.paths.route = conf.paths.route ? conf.paths.route : '/';
            }
            return _.config;
        }
        return false;
    }

    _._find = function (e, parent) {
        var searcher = parent || document;
        if (typeof e === "string") {
            if (e.indexOf('#') === 0) {
                return document.getElementById(e.replace(/#/, ''));
            } else if (e.indexOf('.') > -1) {
                var items = searcher.querySelectorAll(e);
                return items.length === 1 ? items[0] : items;
            }
        } else {
            if (!e.hasOwnProperty('el')) {
                return e;
            } else {
                return this.el;
            }
        }
    };
    _.find = function (e) {
        return c(_._find(e, this.el));
    };

    // c for construct
    c = function (el) {
        var j = new jAmbon();
        j.el = _._find(el);
        return j; // must return object
    };

    _.addClass = function (c) {
        if (this.el.classList) {
            this.el.classList.add(c);
        } else {
            this.el.className += ' ' + c;
        }
        return this;
    };

    _.removeClass = function (c) {
        if (this.el.classList) {
            this.el.classList.remove(c);
        } else {
            this.el.className = this.el.className.replace(new RegExp('(^|\\b)' + c.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
        return this;
    };

    _.eventsWatcher = function (el) {
        if (!el) {
            el = document;
        }
        ['click', 'change', 'blur', 'mousein', 'mouseout']
            .forEach(function (type) {
                var els = el.querySelectorAll(`[data-${type}]`);
                for (var i = 0; i < els.length; i++) {
                    els[i].addEventListener(type, window[els[i].dataset[type]], false);
                }
            });
    };

    _.append = function (html, el) {
        if (!el) {
            el = document.body;
        }
        try {
            if (typeof html === 'object' && typeof el === 'string') {
                var _html = html;
                html = el;
                el = _html;
            }
            el.innerHTML += html;
            _.eventsWatcher(el);
            return el;
        } catch (e) {
            return e;
        }

    };

    _.attach = function (name, func) {
        try {
            console.log('event attached : ' + name);
            if (typeof name === 'function' && typeof func === 'string') {
                var _name = name;
                name = func;
                func = _name;
            }
            window[name] = func;
            return this;
        } catch (e) {
            return e;
        }
    };

    _.onClick = function (el, func) {
        var e = _.find(el).el;
        console.log(el);
        console.log(e);
        e.addEventListener('click', func, false);
    };

    _.resolve = [];
    _.reject = [];
    _.templates = [];
    _.events = {};
    _.slugify = function (str) {
        return str.replace(/[\/_,.]/g, '-');
    };
    _.generateId = function () {
        return Math.round(10000 * Math.random()).toString() +
            '-' + Math.round(10000 * Math.random()).toString() +
            '-' + Math.round(10000 * Math.random()).toString() +
            '-' + Math.round(10000 * Math.random()).toString();
    };
    _.findScriptById = function (id) {
        return eval(document.scripts.namedItem(id).text);
    };

    _.writeScript = function (res, file) {
        var id = _.slugify(file);
        _.resolve[id] = res;
        if (document.getElementById(id)) {
            _.removeScript(id);
        }
        var el = document.createElement('script');
        el.setAttribute('id', id);
        el.setAttribute('type', 'text/javascript');
        el.setAttribute('src', file);
        document.body.appendChild(el);
    };
    _.removeScript = function (id) {
        return document.getElementById(id).parentNode.removeChild(document.getElementById(id));
    };
    _.require = function (f) {
        return new Promise(function (res, reject) {
            var paths = _.getConfig().paths, xhr = true,
                file = paths.route + f;

            if (f.indexOf('text!') > -1) {
                file = paths.html + f.split('text!')[1];
                if (paths.html.indexOf('http') < 0) {
                    xhr = false;
                }
            } else if (f.indexOf('.js') > 0) {
                file = paths.js + f;
                if (paths.js.indexOf('http') < 0) {
                    xhr = false;
                }
            }
            console.log(file);
            if (xhr) {
                _.get(file).then(function (val) {
                    return res(val);
                }).catch(function (error) {
                    console.log(error);
                    return reject(error);
                });
            } else {
                _.writeScript(res, file);
            }
        });
    };

    _.jsonp = function jsonp(uri) {
        return new Promise(function (resolve, reject) {
            var id = '_' + Math.round(10000 * Math.random());
            var cbName = 'jsonp_cb_' + id;
            window[cbName] = function (data) {
                delete window[cbName];
                var ele = document.getElementById(id);
                ele.parentNode.removeChild(ele);
                resolve(data);
            }

            var src = uri + '&cb=' + cbName;
            var script = document.createElement('script');
            script.src = src;
            script.id = id;
            script.addEventListener('error', reject);
            (document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script);
        })
    };
    _.post = function (f, data) { return _.load(f, 'POST', data); };
    _.get = function (f) { return _.load(f, 'GET'); };
    _.put = function (f, data) { return _.load(f, 'PUT', data); };
    _.delete = function (f, data) { return _.load(f, 'DELETE', data); }
    _.load = function (f, method, data) {
        return new Promise(function (res, reject) {
            try {
                var xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function () {
                    if (xhr.status == 200 && xhr.readyState == 4) {
                        if (xhr.getResponseHeader('content-type')
                            .indexOf('javascript') > -1) {
                            return res(eval(xhr.responseText));
                        }
                        else if (xhr.getResponseHeader('content-type')
                            .indexOf('json') > -1) {
                            return res(JSON.parse(xhr.responseText));
                        } else {
                            return res(xhr.responseText);
                        }
                    }
                };

                if (typeof method === 'undefined') {
                    method = 'GET';
                }

                var url = f;

                if (url.indexOf('text!') > -1) {
                    url = url.replace(/text!/gi, '');
                }
                xhr.open(method, url);

                xhr.setRequestHeader(
                    "Content-type",
                    f.indexOf('text!') > -1 ? "text/html" : "application/javascript"
                );

                if (typeof data !== 'undefined' && (method == 'POST' || method == 'PUT')) {
                    var formData = new FormData();
                    formData.append("data", data);
                    xhr.send(data);
                } else {
                    xhr.send();
                }
            } catch (e) {
                return reject(e);
            }
        }
        );
    };

    require = function (dep, cb) {
        if (!cb) {
            if (typeof dep === 'function') {
                cb = dep;
                dep = [];
            } else {
                cb = function () {
                };
            }
        }
        return new Promise(function (res, reject) {
            var promises = [];
            if (!Array.isArray(dep)) {
                dep = [dep];
            }

            dep.forEach(function (item) {
                promises.push(new Promise(function (_res, _reject) {
                    _.require(item)
                        .then(function (val) {
                            return _res(val);
                        })
                        .catch(function (_error) {
                            console.log(_error);
                            return _reject(_error);
                        });
                }));
            });

            Promise
                .all(promises)
                .then(function (values) {
                    if (values instanceof Promise) {
                        values.then(function () {
                            return res(cb.apply(this, values));
                        });
                    } else {
                        return res(cb.apply(this, values));
                    }
                }).catch(function (error) {
                    console.log(error);
                    return reject(error);
                });
        });
    };

    define = function (dep, cb) {
        if (typeof dep === 'function') {
            return dep();
        }
        return new Promise(function (res, reject) {
            require(dep, function (values) {
                if (Array.isArray(values)) {
                    return res(cb.apply(this, values));
                } else {
                    return res(cb(values));
                }
            });
        }).catch(function (error) {
            console.log(error);
            return reject(error);
        });
    }

    _.template = function (tpl, values) {
        function _clean(tpl, forced) {
            var tmp = tpl.replace(/{{( )*/gi, '{{').replace(/( )*}}/gi, '}}');
            if (typeof forced !== 'undefined' && forced) {
                tmp = tmp.replace(/{{[\w\.\-]*}}/gi, '');
            }
            return tmp;
        }

        function _forEach(tpl, p, val) {
            var data, rows = '', ex,
                row = tpl.split('{{for-' + p + '}}')[1].split('{{endfor-' + p + '}}')[0];

            if (p.indexOf('.') > -1) {
                ex = p.split('.');
                data = val ? val : values[ex[0]][ex[1]];

            } else {
                data = val ? val[p] : values[p];
            }
            for (var d of data) {
                var tmp = row;
                Object.getOwnPropertyNames(d).forEach(function (_p) {
                    if (Array.isArray(d[_p])) {
                        tmp = _forEach(tmp, `${ex[1]}.${_p}`, d[_p]);
                    } else if (typeof d[_p] === 'object') {
                        tmp = _nested(tmp, `${ex[1]}.${_p}`, d[_p]);
                    } else {
                        tmp = tmp.replace(
                            new RegExp('{{' + p + '.' + _p + '}}', 'gi'),
                            d[_p] ?
                                d[_p] : ' ');
                    }
                });
                rows += tmp;
            }

            return tpl.replace(row, rows)
                .replace(new RegExp('{{for-' + p + '}}', 'gi'), ' ')
                .replace(new RegExp('{{endfor-' + p + '}}', 'gi'), ' ');
        }

        function _nested(tpl, p, items) {
            for (var i in items) {
                if (items[i] && Object.getOwnPropertyNames(items[i])) {
                    if (Array.isArray(items[i])) {
                        tpl = _forEach(tpl, `${p}.${i}`);
                    } else if (typeof items[i] === 'object') {
                        tpl = _nested(tpl, `${p}.${i}`, items[i]);
                    } else {
                        tpl = tpl.replace(new RegExp(`{{${p}.${i}}}`, 'gi'), items[i] ? items[i] : ' ');
                    }
                }
            }

            return tpl;
        }

        function _build(tpl, items) {
            items.forEach(function (p) {
                if (Array.isArray(values[p])) {
                    tpl = _forEach(tpl, p);
                } else {
                    if (typeof values[p] === 'object') {
                        tpl = _nested(tpl, p, values[p]);
                    } else {
                        tpl = tpl.replace(new RegExp('{{' + p + '}}', 'gi'), values[p] ? values[p] : ' ');
                    }
                }
            });

            return tpl;
        }

        var data = (typeof tpl === 'string' ? tpl : (tpl.data || false));
        return data ?
            _clean(_build(_clean(data), Object.getOwnPropertyNames(values)), true) :
            '';
    }

    _.onModalClick = function (e) {
        e.stopPropagation();
        var dataset = e.target.dataset.id ? e.target.dataset : e.target.parentNode.dataset,
            modal = document.getElementById(dataset.id),
            bg = modal.parentNode;

        _.find(document.body).addClass('stop-scrolling');
        _.find(modal).removeClass('dc-modal').addClass('dc-modal-show');
        _.find(bg).removeClass('dc-modal-bg').addClass('dc-modal-bg-show');

        if (dataset.closeable !== "false") {
            var btn = document.createElement('button'),
                div = document.createElement('div');
            _.find(div).addClass('text-right');
            btn.setAttribute('type', 'button');
            _.find(btn).addClass('btn').addClass('btn-danger').addClass('btn-lg')
                .addClass('dc-modal-close-click').
                addClass('fa')
                .addClass('fa-times');
            div.appendChild(btn);
            modal.insertBefore(div, modal.firstChild);

            btn.addEventListener('click', _.onModalClose);
            bg.removeEventListener('click', _.onModalBgClose);
            bg.addEventListener('click', _.onModalBgClose, false);
        }
    };

    _.onModalClose = function (e) {
        e.stopPropagation();

        var modal = e.target.parentNode.parentNode,
            bg = modal.parentNode;
        var closeBtns = modal.querySelectorAll('.fa-times');
        if (closeBtns.length > 0) {
            for (var i = 0; i < closeBtns.length; i++) {
                closeBtns[i].parentNode.parentNode.removeChild(closeBtns[i].parentNode);
            }
        }

        _.find(modal).addClass('dc-modal').removeClass('dc-modal-show');
        _.find(bg).addClass('dc-modal-bg').removeClass('dc-modal-bg-show');

        if (document.querySelectorAll('.dc-modal-show').length < 1) {
            _.find(document.body).removeClass('stop-scrolling');
        }
    };

    _.onModalBgClose = function (e) {
        e.stopPropagation();

        if (e.target.tagName !== 'DIV') {
            return;
        }

        var bg = e.target,
            modal = bg.querySelector('.dc-modal-show');
        var closeBtns = modal.querySelectorAll('.fa-times');
        if (closeBtns.length > 0) {
            for (var i = 0; i < closeBtns.length; i++) {
                closeBtns[i].parentNode.parentNode.removeChild(closeBtns[i].parentNode);
            }
        }

        _.find(modal).addClass('dc-modal').removeClass('dc-modal-show');
        _.find(bg).addClass('dc-modal-bg').removeClass('dc-modal-bg-show');
        if (document.querySelectorAll('.dc-modal-show').length < 1) {
            _.find(document.body).removeClass('stop-scrolling');
        }
        bg.removeEventListener('click', _.onModalBgClose);
    };

    var script = document.currentScript || (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    if (script.getAttribute('data-main')) {
        console.log("data-main loading");
        require(script.getAttribute('data-main')).then(function () {
            console.log('main script loaded');
        });
    }

    $ = jAmbon;
})();
