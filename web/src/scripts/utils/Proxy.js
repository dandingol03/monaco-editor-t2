

let Proxy={
      postes:(params)=>{
        var url=params.url;
        if(url!==undefined&&url!==null)
        {

            if(Object.prototype.toString.call(params.body)=='[object Object]')
                params.body = JSON.stringify(params.body);

            var options={
                method:'POST',
                headers:params.headers!==undefined&&params.headers!==null?params.headers:null,
                cache:'default',
                body:params.body
            };

            return new Promise((resolve,reject) => {
                fetch(url,options)
                    .then((response) => response.text())
                    .then((res) => {
                        resolve(JSON.parse(res));
                    })
                    .catch((err) => {
                        reject(new Error(err));
                        console.warn(err);
                    })
            });

        }else{
            throw new Error('lack of url field');
        }
    },

}
module.exports=Proxy;