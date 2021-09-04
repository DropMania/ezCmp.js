function randomString(len){
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var str = ""
    for (var i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
}

var cssPath = function(el) {
    if (!(el instanceof Element)) 
        return
    var path = []
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase()
        if (el.id) {
            selector += '#' + el.id
            path.unshift(selector)
            break;
        } else {
            var sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector)
                    nth++
            }
            if (nth != 1)
                selector += ":nth-of-type("+nth+")"
        }
        path.unshift(selector)
        el = el.parentNode
    }
    return path.join(" > ")
}

function template(str, state,id,isChild = false){
    let loopparts = str.split('</loop>')
    loopparts.forEach((part,i)=>{
        let loopTag = part.match(/(<loop.*?>)(.*)/s)
        if(loopTag){
            let loopStartTag = loopTag[1].match(/<loop\s*(.*)\s*>/)
            let [loopVar,loopIdx,idx] = loopStartTag[1].split('_')
            let loopStr = loopTag[2]
            let loopArr = state[loopVar]
            let outStr = ''
            loopArr.forEach((item,index)=>{
                outStr += template(loopStr, {[loopIdx]: item, [idx]:index, ...state},id,true)
            })
            str = str.replace(loopTag[0],outStr)
        }
    })
    let regex = /\{(.*?)\}/g;
    let matches = str.match(regex);
    if(matches){
        for(let i = 0; i < matches.length; i++){
            let key = matches[i].replace(/\{|\}/g, '');
            let obj = key.split('.');
            obj.forEach(function(item, index){
                if(index == 0){
                    obj[index] = state[item];
                }else{
                    obj[index] = obj[index - 1][item];
                }
            })
            str = str.replace(matches[i], obj[obj.length - 1]);       
        }
    }
    if(!isChild){
        let events = ['onclick','onchange','onsubmit','oninput','onkeyup']
        events.forEach(function(e){
            str = str.replace(new RegExp(`${e}="`,'g'),`${e}="components['${id}'].`)
        })
    }
    let ifparts = str.split('</if>')
    ifparts.forEach((part,i)=>{
        let ifTag = part.match(/(<if.*?>)(.*)/s)
        if(ifTag){
            let ifStartTag = ifTag[1].match(/<if\s*(.*)\s*>/)
            part = ifTag[2]
            let conditonvar = ifStartTag[1]
            if(conditonvar.startsWith('!')){
                conditonvar = conditonvar.slice(1)
                if(!state[conditonvar]){
                }else{
                    part = part.replace(ifTag[2],'')
                }
            }else{
                if(state[conditonvar]){
                }else{
                    part = part.replace(ifTag[2],'')
                }
            }
            str = str.replace(ifTag[0],part)
        }
    })
    
    let classRegex = Array.from(str.matchAll(/class="(.*?)"/g));
    classRegex.forEach((match,i)=>{
        if(match){
            let classStr = match[1]
            let classArr = classStr.split(' ')
            classArr = classArr.map(item=>{
                if(item.startsWith('!')){
                    return item.slice(1)
                }else if(item.startsWith('c-')){
                    return item
                }else{
                    return `c-${id}-${item}`
                }
            })
            str = str.replace(match[0],`class="${classArr.join(' ')}"`)
        }
    })
    
    return str
}
let components = {};
function ezCmp(config){
    let {mount,state: data,render,methods,onMounted, onUpdated, name, watch, computed, components:cmps,classes} = config;
    name = name || randomString(10)
    components[name] = this
    let that = this
    data = data || {}
    watch = watch || {}
    cmps = cmps || []
    computed = computed || {}
    onMounted = onMounted || function(){}
    let renderFn = render || function(){return ''}
    methods = methods || {}
    onUpdated = onUpdated || function(){}
    classes = classes || {}
    let destinationEl = document.querySelector(mount)
    var style=document.createElement('style');
    var classString = Object.keys(classes).map((c)=>{
        let css = classes[c]
        return `.c-${name}-${c}{${Object.keys(css).map(s=>{
            let snakeCase = s.replace(/([A-Z])/g, function(g){return '-'+g.toLowerCase()})
            return `${snakeCase}:${css[s]}`
        }).join(';')}}`
    }).join(' ')
    style.appendChild(document.createTextNode(classString));
    
    document.getElementsByTagName('head')[0].appendChild(style);
    this.state = new Proxy(data, {
        set: function(target, key, value, receiver){
            let commit = true
            if(key in watch){
                commit = watch[key].bind(that)(value,target[key])
            }
            if(commit != false){
                target[key] = value;
                that.render()
            }
            return true
        }
    })
    Object.keys(methods).forEach(fun=>{
        this[fun] = methods[fun].bind(this)
    })
    this.render = function(){
        let vars = {...this.state}
        Object.keys(computed).forEach(fun=>{
            vars[fun] = computed[fun].bind(this)()
        })
        vars.props = {}
        destinationEl = document.querySelector(mount)
        destinationEl.getAttributeNames().forEach(name=>{
            vars.props = {...vars.props, [name]: destinationEl.getAttribute(name)}
        })
        if(typeof renderFn === 'function'){
            str = template(renderFn.bind(this)(), vars, name)
        }else{
            str = template(renderFn, vars, name)
        } 
        let path = cssPath(document.activeElement)
        let selNumber = 0
        'selectionStart' in document.activeElement ? 
            selNumber = document.activeElement.selectionStart 
            : ''
        if(destinationEl){
            
            destinationEl.innerHTML = str
        }
        let newFocusElement = document.querySelector(path)
        if(newFocusElement){
            try{
                'setSelectionRange' in newFocusElement
                    ? newFocusElement.setSelectionRange(selNumber,selNumber)
                    :''
                newFocusElement.focus()
            }catch(e){}
        }
        if(onUpdated){
            onUpdated.bind(this)()
        }
        cmps.forEach(cmp=>{
            if(components[cmp]){
                components[cmp].render()
            }
        })
    }
    
    this.render()
    onMounted.bind(this)()

    return this
}
