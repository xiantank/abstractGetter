"use strict"

//var aca = new ACA();
TestSlideByChar();
TestSlideBySentence();
function TestSlideByChar() {
		var getter = new AbstractGetter();
		var query = "google apple pixel siri";
		getter.query(query);
		var article = document.body.innerText;
//var start = getAbstractBySlideWindow(a,13);
//console.log(str.slice(start,start+13));


		var result = getter.getAbstract(article);
		console.log(query);
		console.log(result.join("\n\n"));
}
function TestSlideBySentence() {
		var getter = new AbstractGetter({
				slideType: "sentence",
				slideSize: 3
		});
		var query = "google apple pixel siri";
		getter.query(query);
		var article = document.body.innerText;
		var result = getter.getAbstract(article);
		console.log(query);
		console.log(result.join("\n\n"));
}