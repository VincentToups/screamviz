var puff = require("./puff.js");
var Promise = require("bluebird");
puff.pollute(window);

function promiseDOM(){
    return new Promise((res,rej)=>{
        document.addEventListener("DOMContentLoaded",_=>res(document));
    });
}

const rolesTable = {};
const communityTable = {};
const nodesTable = {};
var minTime = Infinity;
var maxTime = -Infinity;

function promiseData(){
    return d3.csv("./result.csv",function(row){
        let out = {};
        Object.keys(row).forEach(k => {
            let asNumber = +row[k];
            if(typeof asNumber === "number" && !isNaN(asNumber)){
                out[k.toLowerCase()] = asNumber;
            } else {
                out[k.toLowerCase()] = row[k].toLowerCase().trim();
            }
        });
        if(out.event === "role"){
            if(out.target){
                out.target = out.target.replace("role_","");
                rolesTable[out.target] = true;
            } else {
                debugger;
            }
        }
        if(out.event === "community"){
            if(out.target){
                communityTable[out.target] = true;
            } else {
                debugger;
            }
        }
        if(out.event === "add"){
            nodesTable[out.node] = true;
        }
        if(out.event === "connect"){
            nodesTable[out.target] = true;
        }
        if(out.time < minTime) minTime = out.time;
        if(out.time > maxTime) maxTime = out.time;
        return out;
    });
}

function numerically(a,b){
    return a-b;
}

function groupBy(data, key){
    let out = {};
    data.forEach(d => {
        let lst = out[key(d)]||[];
        lst.push(d);
        out[key(d)] = lst;
    });
    return out;
}

const eventOrderTable = {
    add:0,
    connect:1,
    community:2,
    role:3
};

function byEvent(a,b){
    return eventOrderTable[a.event]-eventOrderTable[b.event];    
}

Promise.all([promiseDOM(),promiseData()])
    .spread((document,data)=>{
        console.log(data);
        const roles = Object.keys(rolesTable).sort();
        const communities = Object.keys(communityTable).sort();
        const nodes = Object.keys(nodesTable).map(_=>+_).sort(numerically);
        const byTime = groupBy(data,ixc("time"));
        const times = [];
        for(let i = minTime; i <= maxTime; i++){
            times.push(i);
        }
        const svg = d3.select("#viz");
        const width = svg.attr("width");
        const height = svg.attr("height");

        var color = d3.scaleOrdinal(d3.schemeCategory20);

        var node_data = [];
        var link_data = [];
        var node_index_map = {};
        
        var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(function(d) { return d.community; }))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));

        function loop(i){
            const events = byTime[times[i]].sort(byEvent);
            events.map(processEvent);
            update();
        };

        function update(){
            
        }

        function processEvent(e){
            ({
                add:e => {
                    node_data.push({
                        id:e.target,
                        community:"none",
                        role:"none"
                    });
                    node_index_map[e.target] = node_data.length-1;
                },
                community: e => {
                    let i = node_index_map[e.target];
                    node_data[i].community = e.target;
                },
                role: e => {
                    let i = node_index_map[e.target];
                    node_data[i].role = e.target;
                },
                connect: e => {
                    link_data.push([e.node,e.target]);
                }
            })[e.event](e);
        }
        
    });

