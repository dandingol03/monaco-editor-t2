
addEventListener("message", function(evt){  
    var xhr = new XMLHttpRequest();  
    xhr.open("POST", "http://localhost:3000/fetchAllLibraryTpls");  
    xhr.onload = function(){  
    postMessage(JSON.parse(xhr.responseText))
    };  
    xhr.send();  
    },false);  