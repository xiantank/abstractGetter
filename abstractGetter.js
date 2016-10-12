class AbstractGetter{
		constructor(options = {}){
				this.aca = new ACA()
				this.slideSize = options.slideSize || 300;
		}
		query(patterns){
				if(typeof patterns === "string"){
						patterns = patterns.split(/\s/);
				}
				if(!Array.isArray(patterns)){
						patterns = [patterns];
				}
				for(let pattern of patterns){
						this.aca.add(pattern);
				}
				this.aca.build();
		}
		getAbstract(article){
				let indexesArray = this.aca.query(article);
				console.log(indexesArray);
				if(!indexesArray.length){
						console.log("not found!", indexesArray);
						return "";
				}
				let startIndex = this.getAbstractBySlideWindow(indexesArray);
				return article.slice(startIndex, startIndex+this.slideSize);

		}
		getAbstractBySlideWindow(indexObjArray){
				let indexesArray = [];
				for(let indexObj of indexObjArray){
						Array.prototype.push.apply(indexesArray,indexObj.indexes.map((index)=>{
								return {
										key: indexObj.key,
										index: index
								};
						}));
				}
				indexesArray.sort((a,b)=>{
						return a.index - b.index;
				});
				let wordMap = new Map();
				let indexMin=0; // index in indexesArray
				let keyMaxCnt = 0;
				let keyMaxStratIndex = indexesArray[0].index;
				let keyCnt = 0;
				wordMap.set(indexesArray[0].key, indexesArray[0].index);
				for(let i=0;i<indexesArray.length;i++){
						let current = indexesArray[i];
						let min = indexesArray[indexMin]
						if((current.index - min.index) <= this.slideSize){
								wordMap.set(current.key, current.index);
								keyCnt = wordMap.size;
								if(keyCnt > keyMaxCnt){
										if(keyCnt === keyMaxCnt){
												// TODO compare index distance
										}
										keyMaxCnt = keyCnt;
										let minIndex=Number.MAX_SAFE_INTEGER;
										for(let v of wordMap){
												let startIndex = v[1];
												if(startIndex < minIndex){
														minIndex = startIndex;
												}
										}
										keyMaxStratIndex = minIndex;
								}
						} else{
								for(;;){ // remove out of slideSize
										if(((current.index-indexesArray[indexMin].index)<=this.slideSize)
												|| (current === indexesArray[indexMin])
										  ){
												  break;
										  }
										  wordMap.delete(indexesArray[indexMin].key);
										  indexMin++;
								}
								wordMap.set(current.key, current.index);
								keyCnt = wordMap.size;
								if(keyCnt > keyMaxCnt){
										keyMaxCnt = keyCnt;
										let minIndex=Number.MAX_SAFE_INTEGER;
										for(let v of wordMap){
												let startIndex = v[1];
												if(startIndex < minIndex){
														minIndex = startIndex;
												}
										}
										keyMaxStratIndex = minIndex;
								}

						}
				}
				return keyMaxStratIndex;
		}
}
