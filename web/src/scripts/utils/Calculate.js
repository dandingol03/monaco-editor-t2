
const Calculate = {
    recurse: (node, statistics) => {
        if (node) {
            statistics.count++
            if (node.children && node.folded != true && node.children.length > 0) {
                node.children.map((child, i) => {
                    Calculate.recurse(child, statistics)
                })
            } else {
            }
        }
    },
    count: (cur, components) => {
        var statistics = {
            count: 0
        }
        
        if(components instanceof Array)
            Calculate.recurse(components[0], statistics)    
        else
            Calculate.recurse(components, statistics)
        
        return cur + statistics.count
    },
    canHold:(node)=>{
        switch(node.name)
        {
            case 'View':
            case 'Toolbar':
                return true;
            break;
            default:
                return false;
            break;
        }
    }
}
export default Calculate