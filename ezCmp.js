function randomString(len){
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
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
    let ifparts = str.split('</if>')
    ifparts.forEach((part,i)=>{
        let ifTag = part.match(/(<if.*?>)(.*)/s)
        if(ifTag){
            let ifStartTag = ifTag[1].match(/<if\s*(.*)\s*>/)
            let conditonvar = ifStartTag[1]
            if(conditonvar.startsWith('!')){
                conditonvar = conditonvar.slice(1)
                if(!state[conditonvar]){
                    part = part.replace(ifTag[0],ifTag[2])
                }else{
                    part = part.replace(ifTag[0],'')
                }
            }else{
                if(state[conditonvar]){
                    part = part.replace(ifTag[0],ifTag[2])
                }else{
                    part = part.replace(ifTag[0],'')
                }
            }
            str = str.replace(ifTag[0],part)
        }
    })
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
                outStr += template(loopStr, {[loopIdx]: item, [idx]:index},id,true)
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
    return str
}
let components = {};
function ezCmp(config){
    let {mount,state: data,render,methods,onMounted, onUpdated, name} = config;
    name = name || randomString(10)
    components[name] = this
    let that = this
    data = data || {}
    onMounted = onMounted || function(){}
    let renderFn = render || function(){return ''}
    methods = methods || {}
    onUpdated = onUpdated || function(){}
    this.state = new Proxy(data, {
        set: function(target, key, value, receiver){
            target[key] = value;
            that.render()
            return true
        }
    })
    Object.keys(methods).forEach(fun=>{
        this[fun] = methods[fun].bind(this)
    })
    this.render = function(){
        if(typeof renderFn === 'function'){
            str = template(renderFn.bind(this)(), this.state, name)
        }else{
            str = template(renderFn, this.state, name)
        } 
        let path = cssPath(document.activeElement)
        let selNumber = 0
        'selectionStart' in document.activeElement ? 
            selNumber = document.activeElement.selectionStart 
            : ''
        document.querySelector(mount).innerHTML = str
        let newFocusElement = document.querySelector(path)
        if(newFocusElement){
            'setSelectionRange' in newFocusElement
                ? newFocusElement.setSelectionRange(selNumber,selNumber)
                :''
            newFocusElement.focus()
        }
        if(onUpdated){
            onUpdated.bind(this)()
        }
    }
    this.render()

    onMounted.bind(this)()

    return this
}