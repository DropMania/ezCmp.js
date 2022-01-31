function randomString(len) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var str = ''
    for (var i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
}

var cssPath = function (el) {
    if (!(el instanceof Element)) return
    var path = []
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase()
        if (el.id) {
            selector += '#' + el.id
            path.unshift(selector)
            break
        } else {
            var sib = el,
                nth = 1
            while ((sib = sib.previousElementSibling)) {
                if (sib.nodeName.toLowerCase() == selector) nth++
            }
            if (nth != 1) selector += ':nth-of-type(' + nth + ')'
        }
        path.unshift(selector)
        el = el.parentNode
    }
    return path.join(' > ')
}
function createLoopTag(doc,state,id,classes){
    let loops = doc.querySelectorAll('loop');
    let filtered = [...loops].filter(tag => {
        while (tag.parentNode) {
            if (tag.parentNode.tagName === 'LOOP') {
                return false
            }
            tag = tag.parentNode
        }
        return true
    })
    filtered.forEach((tag) => {
        let stateVar = tag.getAttribute('for')
        let as = tag.getAttribute('as')
        let i = tag.getAttribute('i')
        let obj = stateVar.split('.')
        let loopArr = []
        obj.forEach(function (item, index) {
            if (index == 0) {
                loopArr = state[item]
            } else {
                loopArr = loopArr[item]
            }
        })
        let loopStr = tag.innerHTML
        let outStr = ''
        loopArr.forEach((itemA, indexA) => {
            outStr += DOMtemplate(loopStr,{
                ... state, 
                [i]: indexA,
                [as]: itemA
                
            },id, true,classes)
        })
        tag.innerHTML = outStr
    })
}

function createIfTag(doc,state){
    let ifs = doc.querySelectorAll('if');
    let filtered = [...ifs].filter(tag => {
        while (tag.parentNode) {
            if (tag.parentNode.tagName === 'IF') {
                return false
            }
            tag = tag.parentNode
        }
        return true
    })
    filtered.forEach((tag) => {
        let condition = tag.getAttribute('c')
        let values = condition.split(/\s+/)
        let finalEval = ''
        values.forEach((item, index) => {
            var negate = ''
            if(item.startsWith('!')){
                item = item.slice(1)
                negate = '!'
            }
            var val = item
            if (item.split('.')[0] in state) {
                let obj = item.split('.')
                obj.forEach(function (item, index) {
                    if (index == 0) {
                        val = state[item]
                    } else {
                        val = val[item]
                    }
                })
                if(typeof val === 'string'){
                    val = `'${val}'`
                }
            }
            finalEval +=  negate + val + ' '
        })
        try{
            if (!(eval(finalEval))) {
                tag.parentNode.removeChild(tag)
            }
        }catch(e){
        }
    })
}

function createJsonTag(doc,state,id,classes){
    let jsonTags = doc.querySelectorAll('json');
    let filtered = [...jsonTags].filter(tag => {
        while (tag.parentNode) {
            if (tag.parentNode.tagName === 'JSON') {
                return false
            }
            tag = tag.parentNode
        }
        return true
    })
    filtered.forEach(async (tag) => {
        let url = tag.getAttribute('url')
        let as = tag.getAttribute('as')
        let convert = tag.getAttribute('convert')
        let str = tag.innerHTML
        let path = cssPath(tag)
        tag.innerHTML = '<div class="loading">Loading...</div>'
        let res = await fetch(url)
        let json = await res.json()
        if(convert){
            json = ezCmp.components[id][convert](json)
        }
        document.querySelector(path).innerHTML = DOMtemplate(str,{
            ... state,
            [as]: json
        },id, false,classes)
    })
}
function createSlotTag(doc,state,id,classes){
    let slotTags = doc.querySelectorAll('slot');
    slotTags.forEach((tag) => {
        tag.innerHTML = DOMtemplate(state.slot,state,id,true,classes)
    })
}
function DOMtemplate(str, state, id, isChild = false,classes) {
    let parser = new DOMParser()
    let doc = parser.parseFromString(str, 'text/html')
    createJsonTag(doc,state,id,classes)
    createLoopTag(doc,state,id,classes)
    createIfTag(doc,state)
    createSlotTag(doc,state,id,classes)
    let text = doc.body.innerHTML
    let regex = /\{(.*?)\}/g
    let matches = text.match(regex)
    if (matches) {
        for (let i = 0; i < matches.length; i++) {
            let key = matches[i].replace(/\{|\}/g, '')
            let obj = key.split('.')
            obj.forEach(function (item, index) {
                if (index == 0) {
                    obj[index] = state[item]
                } else {
                    obj[index] = obj[index - 1][item]
                }
            })
            text = text.replace(matches[i], obj[obj.length - 1])
        }
    }
    if(!isChild){
        let classRegex = Array.from(text.matchAll(/class="(.*?)"/g))
        classRegex.forEach((match, i) => {
            if (match) {
                let classStr = match[1]
                let classArr = classStr.split(/\s+/)
                classArr = classArr.map((item) => {
                    if (item) {
                        if (classes[item]) {
                            return `c-${id}-${item}`
                        } else {
                            return item
                        }
                    }
                })
                text = text.replace(match[0], `class="${classArr.join(' ')}"`)
            }
        })
        text = text.replace(/on\w+="/g,
            (match) => `${match}ezCmp.components['${id}'].`
        )
    }
    return text
}
function compareEls(el,compareEl){
    let allEls = [...el.querySelectorAll('*')].reverse()

    allEls.forEach((item,index) => {
        let path = cssPath(item)
        let compareItem = compareEl.querySelector(path)
        if(compareItem){
            if(item.tagName === compareItem.tagName){
                if(item.textContent !== compareItem.textContent){
                    item.innerHTML = compareItem.innerHTML
                }
            }
        }
    })
    if(el.textContent !== compareEl.textContent){
        el.innerHTML = compareEl.innerHTML
    }
}
function compareHTML(el, str){
    let parser = new DOMParser()
    let doc = parser.parseFromString(str, 'text/html')
    let compareEl = doc.body
    compareEls(el,compareEl)
}

class ezCmp {
    static define(id, config){
        ezCmp.definedComponents[id] = config
    }
    static init(root = document.querySelector('[ezcmp]') || document.body){
        let ez_root = root
        Object.entries(ezCmp.definedComponents).forEach(([id, config]) => {
            ez_root.querySelectorAll(id).forEach((el, i) => {
                if(!ezCmp.components[`${id}-${i}`]){
                    new ezCmp({name: id,key: i, el,slot: el.innerHTML, ...config})
                }else{
                    //components[`${id}-${i}`].render()
                }
            })
        })
    }
    static components = {}
    static definedComponents = {}
    constructor(config) {
        let {
            state: data,
            render,
            methods,
            onMounted,
            onUpdated,
            name,
            key,
            el,
            watch,
            computed,
            components: cmps,
            classes,
            storage,
            slot
        } = config
        name = (name || randomString(10)) + '-' + key
        ezCmp.components[name] = this
        let that = this
        data = data || {}
        watch = watch || {}
        cmps = cmps || []
        computed = computed || {}
        onMounted = onMounted || function () {}
        let renderFn =
            render ||
            function () {
                return '<slot></slot>'
            }
        methods = methods || {}
        onUpdated = onUpdated || function () {}
        classes = classes || {}
        storage = storage || []
        let destinationEl = el
        let cmpStore = {}
        if (localStorage.getItem(`ezcmp-${name}`)) {
            cmpStore = JSON.parse(localStorage.getItem(`ezcmp-${name}`))
        }
        var style = document.createElement('style')
        var classString = Object.keys(classes)
            .map((c) => {
                let css = classes[c]
                return `.c-${name}-${c}{${Object.keys(css)
                    .map((s) => {
                        let snakeCase = s.replace(/([A-Z])/g, function (g) {
                            return '-' + g.toLowerCase()
                        })
                        return `${snakeCase}:${css[s]}`
                    })
                    .join(';')}}`
            })
            .join(' ')
        style.appendChild(document.createTextNode(classString))

        document.getElementsByTagName('head')[0].appendChild(style)
        this.state = new Proxy({ slot,...data}, {
            set: function (target, key, value, receiver) {
                let commit = true
                if (key in watch) {
                    commit = watch[key].bind(that)(value, target[key])
                }
                if (commit != false) {
                    if (storage.includes(key)) {
                        cmpStore[key] = value
                        localStorage.setItem(
                            `ezcmp-${name}`,
                            JSON.stringify(cmpStore)
                        )
                    }
                    target[key] = value
                    that.render()
                }
                return true
            }
        })
        Object.keys(methods).forEach((fun) => {
            this[fun] = methods[fun].bind(this)
        })
        this.render = function () {
            let vars = { ...this.state }
            Object.keys(computed).forEach((fun) => {
                vars[fun] = computed[fun].bind(this)()
            })
            vars.props = {}

            let str = ''
            if (typeof renderFn === 'function') {
                str = DOMtemplate(renderFn.bind(this)(), vars, name, false,classes)
            } else {
                str = DOMtemplate(renderFn, vars, name,false, classes)
            }
            let path = cssPath(document.activeElement)
            let selNumber = 0
            'selectionStart' in document.activeElement
                ? (selNumber = document.activeElement.selectionStart)
                : ''
            
                if (destinationEl) {
                    compareHTML(destinationEl, str, vars)
                }
            let bindFields = el.querySelectorAll(`[bind]`)
            bindFields.forEach((item) => {
                let bind = item.getAttribute('bind')
                if (bind) {
                    item.value = this.state[bind]
                    if(item.getAttribute('binded') !== 'true'){
                        item.setAttribute('binded',"true")
                        item.addEventListener('input', function (e) {
                            that.state[bind] = e.target.value
                        })
                    }
                }
            })
            let newFocusElement = document.querySelector(path)
            if (newFocusElement) {
                try {
                    'setSelectionRange' in newFocusElement
                        ? newFocusElement.setSelectionRange(
                              selNumber,
                              selNumber
                          )
                        : ''
                    newFocusElement.focus()
                } catch (e) {}
            }
            if (onUpdated) {
                onUpdated.bind(this)()
            }
            //ezCmp.init(el)
        }
        Object.keys(cmpStore).forEach((key) => {
            if (storage.includes(key)) {
                this.state[key] = cmpStore[key]
            }
        })
       
        this.render()
        this.state.init = true
        onMounted.bind(this)()

        return this
    }
}
document.addEventListener('DOMContentLoaded', function () {
    ezCmp.init()
})