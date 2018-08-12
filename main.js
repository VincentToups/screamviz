var Promise = require("bluebird");
var ColorScheme = require("color-scheme");
var puff = require("./lib/puff.js");
var hexToRGB = require('./lib/hexToRGB')
puff.pollute(window);

var scheme1 = new ColorScheme;
var scheme2 = new ColorScheme;
var scheme3 = new ColorScheme;
var scheme4 = new ColorScheme;
// each scheme only produces 12 colors :(
scheme1.from_hue(8)
  .scheme('tetrade')
  .variation('soft');
scheme2.from_hue(42)
  .scheme('tetrade')
  .variation('light');
scheme3.from_hue(16)
  .scheme('tetrade')
  .variation('pastel');
var colors1 = scheme1.colors();
var colors2 = scheme2.colors();
var colors3 = scheme3.colors();
console.log('Colors1', colors1)
console.log('Colors2', colors2)
console.log('Colors3', colors3)
var colors = colors1.concat(colors2).concat(colors3)
// colors.length => 48
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

var visDuration = 2000;

function promiseData(){
	return d3.csv("./data/result.csv",function(row){
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

function r255(){
	return Math.floor(Math.random()*255);
}

function randomRgb(){
	return "rgb("+ hexToRGB(colors.pop())+")";
}

function parseRgb(rgb){
	let p1 = rgb.split(",");
	let p1p = p1[0].split("(");
	let p3p = p1[2].split(")");
	return [+p1p[1],+p1[1],+p3p[0]];
}

function unparseRgb(a){
	return "rgb("+a.join(",")+")";
}

function interpRgb(a,b,p){
	let pa = parseRgb(a);
	let pb = parseRgb(b);
	let q = (1-p);
	return unparseRgb([q*pa[0]+p*pb[0],
		q*pa[1]+p*pb[1],
		q*pa[2]+p*pb[2]]);
	}
	
	function interpFloat(a,b,p){
		var q = (1-p);
		return a*q + b*p;
	}
	
	Promise.all([promiseDOM(),promiseData()])
	.spread((document,data)=>{
		console.log(data);
		const roles = Object.keys(rolesTable).sort();
		const communities = Object.keys(communityTable).sort();
    const communityColors = {};


		communities.forEach((c, i) => communityColors[c]=randomRgb());
		communityColors["none"] = "rgb(255,255,255)";
		const nodes = Object.keys(nodesTable).map(_=>+_).sort(numerically);
		const byTime = groupBy(data,ixc("row"));
		console.log(byTime);
		const svg = d3.select("#viz");
		const width = svg.attr("width");
		const height = svg.attr("height");
		
		
		var node_data = [];
		var link_data = [];
		var node_index_map = {};
		
		var simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.community; }))
			.force("charge", d3.forceManyBody())
			.force("center", d3.forceCenter(width / 2, height / 2));
		
		function dragstarted(d) {
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}
		
		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}
		
		function dragended(d) {
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
		
		
		let TimeLapse = { pause: false, animationSpeed: 200 }
		window.resume = () => {
			if(TimeLapse.pause){
				console.log('Play', TimeLapse.iteration)
				TimeLapse.pause = false
				loop(TimeLapse.iteration)
				document.getElementById('play').style.display = 'none'
				document.getElementById('pause').style.display = 'block'
			}
		}

		window.pause = () => {
			TimeLapse.pause = true
			document.getElementById('pause').style.display = 'none'
			document.getElementById('play').style.display = 'block'
		}

		window.onSpeedChange = (value) => {
			TimeLapse.animationSpeed = 500 - (50 * value)	
		}
		let getTime = (row) => data[row].time
		function loop(i){
			
			if(TimeLapse.pause){
				TimeLapse.iteration = i;
				return
			}

			const events = byTime[i].sort(byEvent);
			events.map(processEvent);
			update();
			if(i < 7900){
				setTimeout(function(){
					loop(i+1);
				},TimeLapse.animationSpeed);
			}
		};
		
		function nodeColor(d){
			return communityColors[d.community];
		}
		
		function ndkey(d){
			return d ? d.id : ""+d.id;
		}
		
		function lkey(d){
			return d ? d.id : [d.source,d.target].join(",");
		}
		
		svg.append("g")
		.attr("class", "links");
		
		svg.append("g")
		.attr("class", "nodes");
		
		function update(){
			var link = svg.select(".links")
			.selectAll("line")
			.data(link_data);
			
			var link_enter = link
			.enter().append("line")
			.attr("stroke-width", function(d) {
				let n1 = node_data[node_index_map[d.source]];
				let n2 = node_data[node_index_map[d.target]];
				n1.lastChange = Date.now();
				n2.lastChange = Date.now();
				return 1;
			})
			.attr("stroke","rgba(57,255,20,0.3)");
			
			var link_all = link.merge(link_enter);
			
			var node = svg.select(".nodes")
			.selectAll("circle")
			.data(node_data);
			var node_enter = node
			.enter()
			.append("circle")
			.attr("r", 5)
			.attr("fill", d => {
				// console.log("On enter, d", nodeColor(d));
				d.targetFill = nodeColor(d);
				d.lastFill = d.targetFill;
				d.lastChange = -Infinity;
				// console.log(d);
				return d.targetFill;
			})
			.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));
			var node_all = node_enter.merge(node)
			.attr("r",5)
			.attr("targetFill", d => {
				let newNodeColor = nodeColor(d);
				// console.log(newNodeColor,d.lastFill);
				if(d.targetFill !== newNodeColor){
					// console.log("targetFill Changed",newNodeColor);
					d.lastFill = d.targetFill;
					d.targetFill = newNodeColor;
					d.lastChange = Date.now();
					d.targetSize = 5;
				}
				return d.lastFill;
			});
			
			node.exit().remove();            
			
			simulation
			.nodes(node_data)
			.on("tick", ticked);
			
			simulation.force("link")
			.links(link_data)
			.id(d => d.id);
			
			simulation.alphaTarget(0.3).restart();
			
			let min = Math.min;
			let max = Math.max;
			function ticked() {
				link_all
					.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
				
				node_all
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
					.attr("fill",function(d){
						let now = Date.now();
						let elapsed = max(min((now - d.lastChange)/visDuration,1),0);
						if(isNaN(elapsed)){
							return d.lastFill;
						}
						if(elapsed < 1){
							// console.log("interp",interpRgb(d.lastFill,d.targetFill,elapsed));                        
						}
						if(elapsed === 1){
							d.lastFill = d.targetFill;
						}
						return interpRgb(d.lastFill,d.targetFill,elapsed);
					})
					.attr("r",function(d){
						let now = Date.now();
						let elapsed = max(min((now - d.lastChange)/visDuration,1),0);
						if(isNaN(elapsed)){
							return 5;
						}
						if(elapsed === 1){
							return 5;
						}
						return interpFloat(15,5,elapsed);
					});
			}
			
		}
		function processEvent(e){
			({
				add:e => {
					node_data.push({
						id:e.node,
						id_n:e.node,
						community:"none",
						role:"none"
					});
					
					if(node_data.length > 1){
						let last = node_data.length - 2;
						let cur = node_data.length -1;
						node_data[cur].x = node_data[last].x ? width/2 : width/2;
						node_data[cur].y = node_data[last].y ? height/2 : height/2;
						
					}
					node_index_map[e.node] = node_data.length-1;
				},
				community: e => {
					console.log()
					let i = node_index_map[e.node];
					// if(node_data[i].community !== e.target) console.log("Community changed", e.target, 'Row', i);
					node_data[i].community = e.target;
				},
				role: e => {
					let i = node_index_map[e.node];
					node_data[i].role = e.target;
				},
				connect: e => {
					//                    console.log("connect",e.node,"to",e.target);
					link_data.push({source:e.node,target:e.target});
				}
			})[e.event](e);
		}
		loop(0);
	});
	
