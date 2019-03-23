/*Name: 		Luke Connolly
  Student Number: 100999531
  This file is the server for the game. It contains info for how the server should react to certain requests
  Note: The code for the skeleton of the server was in large based on demo code from lectures
*/

//load some modules
var http = require("http");
var fs = require("fs");
var mime = require('mime-types');
var url = require("url");
var mkBoard = require("./makeBoard.js");

//declaring root
const ROOT = "./public_html"; 

//dictionary of users
var userDict = {};

//create http server
var server = http.createServer(handleRequest);
server.listen(2406);
console.log("Server listening on port 2406");

function handleRequest(req,res){
	//print request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url, true);
	var filename = ROOT+urlObj.pathname;
	
	if(urlObj.pathname==="/memory/intro"){
		var postBody="";
		req.setEncoding("utf8");
		req.on("data",function(msg){
			console.log(msg);
			postBody += msg;
		});
		req.on("end",function(){
			
			var username = JSON.parse(postBody).username;
			var userObj = userDict[username];
			var difficulty = JSON.parse(postBody).difficulty;
			if(difficulty==0){
				difficulty=4; //if there is no difficulty yet, start at 4
			}
			var board = mkBoard.makeBoard(difficulty);//make the game board
			var userObj = {
				
				gameBoard : board, //make user object, store game board here
				diff : difficulty
			}
			userDict[username] = userObj; //add to user dictionary
		});
		//res.end();
	}
	
	else if(urlObj.pathname==="/memory/card"){
		var username = urlObj.query.username;
		var row = urlObj.query.row;
		var column = urlObj.query.column;
		//check for valid indices
		if(row<userDict[username].gameBoard.length && column<userDict[username].gameBoard[row].length){
			//respond with the number under the flipped tile
			respond(200,""+userDict[username].gameBoard[row][column]+"");
		}
		else{
			respond(400,"Bad Request");
		}
	}
	
	else{
		//the callback sequence for static serving...
		fs.stat(filename,function(err,stats){
			if(err) { respondErr(err); }
		
			else if(stats.isDirectory()){
				if(err){ respondErr(err); }
				else fs.readFile(ROOT+"/index.html", function(err,data){
					if(err){ respondErr(err); }
					else {respond(200,data);}//if asked for a directory, give index.html
				});			
			}
			else{
				fs.readFile(filename, function(err,data){
					if(err){ respondErr(err); }
					else {respond(200,data);}
				});
			}
		});
	}
	//helper function to serve 404 files
	function serve404(){
		fs.readFile(ROOT+"/404.html",function(err,data){
			if(err){ respond(500,err.message); }
			else {respond(404,data);}
		});
	}
	
	//helper function to respond to errors and output to console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}
		else{
			respond(500,err.message);
		}
	}
	
	//helper function to give the response message
	function respond(code,data){
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		res.end(data);
	}
}; //handle request over