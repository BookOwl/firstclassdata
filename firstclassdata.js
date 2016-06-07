(function(ext) {
    var clean = function(obj){
        if (typeof obj == "string" && obj.startsWith("--#firstclassdata#--#obj#--#id#")) {
            console.log("Cleaning data["+obj+"]")
            return clean(data[obj])
        }
        if (obj.type != "obj" && typeof obj != "object"){
            console.log("Cleaning normal data", obj)
            return obj;
        }
        if (obj.type == undefined){
            console.log("Cleaning normal object", obj)
            var keys = Object.keys(obj);
            var newobj = {};
            keys.forEach(function(key){newobj[key] = clean(obj[key])});
            return newobj;
        }
        if (obj.val.map){
            console.log("Cleaning array", obj.val)
            return obj.val.map(clean);
        }
        console.log("Cleaning object", obj.val)
        return clean(obj.val);
    }
    var convert = function(obj){
        if (typeof obj != "object"){
            return obj
        }else if (obj.map){
            var l = obj.map(convert)
            var id = "--#firstclassdata#--#obj#--#id#" + nextobjid;
            data[id] = {type:"obj", id:id, val:l};
            nextobjid++;
            return id
        }else {
            var keys = Object.keys(obj);
            var newobj = {};
            keys.forEach(function(key){
                newobj[key] = convert(obj[key])
            });
            var id = "--#firstclassdata#--#obj#--#id#" + nextobjid;
            data[id] = {type:"obj", id:id, val:newobj};
            nextobjid++;
            return id
        }
    }
    data = Object.create(null);
    nextobjid = 1;
    var convertval = function(val){
        if (typeof val == "string" && val.startsWith("--#firstclassdata#--#obj#--#id#")) {
            return data[val]
        }else if (/^\d+$/.exec(val)){
            return {type:'num', val:parseInt(val)} 
        }else if (/^\d+\.\d+$/.exec(val)) {
            return {type:'num', val:parseFloat(val)} 
        }else {
            return {type:"str", val: val}
        }
    }
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    
    ext.color = function(color){return color;}
    
    ext.create_list = function(){
        var id = "--#firstclassdata#--#obj#--#id#" + nextobjid;
        data[id] = {type:"obj", id:id, val:[]};
        nextobjid++;
        return id;
     }
     ext.item_of_list = function(index, id){
        var l = data[id].val;
        var i = l[index-1];
        console.log(i);
        if (i.type == 'obj'){
            console.log("Returning an ID")
            return i.id;
        }else {
            console.log("Returning a val")
            return i.val;
        }
        console.log("Shouldn't be reached")
     }
     ext.set_item = function(index, id, val){
        var l = data[id].val;
        l[index-1] = convertval(val)
     }
     ext.add_item = function(val, id){
        var l = data[id].val;
        l.push(convertval(val))
     }
     ext.insert_item = function(val, index, id){
         var l = data[id].val;
         l.splice(index-1, 0, convertval(val))
     }
     ext.list_length = function(id){
         return data[id].val.length;
     }
     ext.delete_item = function(index, id){
         data[id].val.splice(index-1, 1)
     }
     ext.create_obj = function(){
        var id = "--#firstclassdata#--#obj#--#id#" + nextobjid;
        data[id] = {type:"obj", id:id, val:Object.create(null)};
        nextobjid++;
        return id;
     }
     ext.set_prop = function(prop, id, val){
        var l = data[id].val;
        var p = prop
        l[p] = convertval(val)
     }
     ext.item_of_obj = function(prop, id){
        var l = data[id].val;
        var i = l[prop];
        if (i.type == 'obj'){
            return i.id;
        }else {
            return i.val;
        }
     }
     ext.delete_prop = function(prop, id){
         delete data[id][prop]
     }
     ext.as_json = function(id){
        var obj = data[id];
        obj = JSON.parse(JSON.stringify(obj))
        obj = clean(obj)
        return JSON.stringify(obj)
     }
     ext.from_json = function(json){
         obj = JSON.parse(json)
         return convert(obj)
     }
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
           // ['r', 'Color %c', 'color'],
            ['r', 'create list', 'create_list'],
            ['r', 'item %n of list %s', 'item_of_list'],
            [' ', 'set item %n of list %s to %s', 'set_item'],
            [' ', 'add %s to list %s', 'add_item'],
            [' ', 'insert %s at %n of list %s', 'insert_item'],
            ['r', 'length of list %s', 'list_length'],
            [' ', 'delete item %n of list %s', 'delete_item'],
            ['r', 'create object', 'create_obj'],
            [' ', 'set property %s of object %s to %s', 'set_prop'],
            ['r', 'property %s of object %s', 'item_of_obj'],
            [' ', 'delete property %s of object %s', 'delete_prop'],
            ['r', 'object %s as JSON', 'as_json'],
            ['r', 'create object from JSON %s', 'from_json']
        ]
    };

    // Register the extension
    ScratchExtensions.register('First Class Data', descriptor, ext);
})({});