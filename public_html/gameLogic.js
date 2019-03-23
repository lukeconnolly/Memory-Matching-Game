/*Name: 		Luke Connolly
  Student Number: 100999531
  This file contains the game logic, and is linked to by the index.html page. 
*/
var name = prompt("What is your name?","Enter name here");//ask user for name
		var firstCard=""; //variables to keep track of active cards
		var secondCard=""; 
		var numAttempts=0; //variable to keep track of the number of matching attempts the user has made
		var difficulty=4; //variable to keep track of difficulty level
		$(document).ready(function(){
			makeGame();
		});
		
		//function that makes the game board
		function makeGame(){
			//make a POST request sending the username and difficulty level
			$.post("/memory/intro",JSON.stringify({"username": name, "difficulty": difficulty}));
			var cards = "";
			for(var i=0; i<difficulty; i++){
				cards+="<tr>";
				for(var j=0; j<difficulty; j++){
					//append a tile in the table for every index j. Store the row and column # in the div
					//and the activity status of it (for later to know if it's being looked at or not for matches)
					cards += "<td><div class='cardBack' data-row="+i+" data-column="+j+"></div></td>";
				}
				cards+="</tr>"; //end the table row before incrementing i	
			}
			//$("h1").text(cards);
			$("#tileBoard").append(cards);
			
			//when a card back is clicked, go to the canFlip function to see if it can be flipped
			$(".cardBack").on("click",canFlip);
		
		}
		
		//function that determines whether a card can be flipped or not
		function canFlip(){
		
			//if the card is already face up
			if($(this).hasClass("cardFace")){
				return;
			}
			
			//if the card is face down and no other cards are active
			else if(firstCard==="" && secondCard===""){
				flipFirst(this);
			}
			
			//if the card is face down and one other card is active
			else if(secondCard===""){
				flipSecond(this);
			}
			
			//card is face down and two other cards are active
			else{
				return;
			}
		}
			
		//function that sends GET request, gets card number, and makes first card flip
		function flipFirst(card){
			firstCard = card;
			
			//data that will be sent to server on GET request
			var toSend = {'username':name, 'row':$(card).data("row"),'column':$(card).data("column")};
			
			//make get request and send data, callback function stores the value of card to flip
			$.get("/memory/card",toSend,function(data){
				$(firstCard).slideUp(250);
				setTimeout(function(){
					$(firstCard).text(data);
					$(firstCard).addClass("cardFace"); //so the card shows as flipped
					$(firstCard).slideDown(250);
				},250);
			});
		}
		
		function flipSecond(card){
			numAttempts++;
			secondCard = card;
			
			//data that will be sent to server on GET request
			var toSend = {'username':name, 'row':$(card).data("row"),'column':$(card).data("column")};
			
			//make get request and send data, callback function stores the value of card to flip
			$.get("/memory/card",toSend,function(data){
				$(secondCard).slideUp(250);
				setTimeout(function(){
					$(secondCard).text(data);
					$(secondCard).addClass("cardFace"); //so the card shows as flipped
					$(secondCard).slideDown(250);
					},250);
				setTimeout(function(){
				if($(firstCard).text()===$(secondCard).text()){
					firstCard="";
					secondCard=""; //make both cards inactive
						
					//check how many cards are face up, if its all then make new game
					var i= $(".cardFace").length;
					if(i===(difficulty*difficulty)){
						alert("You finished the game in "+numAttempts+" match attempts!");
						numAttempts=0; //restart number of attempts
						if(difficulty<10){
							difficulty+=2; //increase the difficulty if not at cap of 10 yet
						}
						$("#tileBoard").empty();  //clear the current gameboard
						makeGame(); //make a new gameboard
						return; 
					}
				}	
				//no match, flip cards back over
				else{
					setTimeout(function(){
						$(firstCard).removeClass("cardFace"); //change the look of the card to face down
						$(firstCard).text(""); //get rid of the text
						$(secondCard).removeClass("cardFace");
						$(secondCard).text("");
						firstCard = "";
						secondCard = "";
					},800);
				}
			},500);
			});
		}