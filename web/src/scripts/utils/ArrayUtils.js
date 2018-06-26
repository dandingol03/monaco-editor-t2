
const ArrayUtils={
    compare:(arr1,arr2)=>{
        var flag=false
        if(arr1&&arr2)
        {
            if(arr1.length!=arr2.length)
                return flag
            else{
                flag=true
                arr1.map((item,i)=>{
                    if(item!=arr2[i])
                        flag=false
                })
                return flag
            }
        }else{
            return flag
        }
    },
    includes:(arr1,arr2)=>{
        var flag=false
        if(arr1&&arr2)
        {
            var str1=arr1.toString()
            var str2=arr2.toString()
            return str1.startsWith(str2)
        }
    },
    differentInRanges:(range1,range2)=>{
        var flag=false//默认相同
        if(range1&&range2)
        {
            if(range1.length!=range2.length)
                return true
            else{
                
                for(let i=0;i<range1.length;i++)
                {
                    var range=range1[i]
                    if(ArrayUtils.compare(range.key,range2[i].key)==false)
                    {
                        flag=true
                        break
                    }
                }
                return flag
            }
        }else{
            return true
        }
    }
}
export default ArrayUtils