"use strict"
class ACA{
		constructor(options){
				/*TODO 
				 * future work: bind this, can use like : 
				 * this.content to get current 
				 * func nextChar(currentPosition){}
				 * ;this.nextChar = options.nextChar;
				 */
				this.nodeList = [];
				this.root = this.createNode("",0);
				this.nodeCount = 1;
				this.stringCount = 0;
				this.stringList = [];
		}

		add(pattern){
				let node = this.root;
				for(let i=0;i<pattern.length;i++){
						let ch = pattern[i]
						if(node.next[ch] === undefined){
								let remainString = pattern.slice(i);
								for(let c of remainString){
										node.next[c] = this.createNode(c, this.nodeCount++)
										node = node.next[c];
								}
								break;
						}
						node = node.next[ch]
				}

				return node.strNo = this.stringList.push(pattern) - 1 ;
		}
		build(){
				let queue = {
						_q:[],
						push: function(element){
								return this._q.push(element);
						},
						pop: function(){
								return this._q.shift();
						}
				}
				for(let ch in this.root.next){
						this.root.next[ch].fail = this.root;
						queue.push(this.root.next[ch]);
				}
				for(let target;(target = queue.pop())!==undefined;){
						for(let ch in target.next){
								queue.push(target.next[ch]);
								let p = target.fail;
								for(;p;){
										if(p.next[ch]){
												target.next[ch].fail = p.next[ch];
												break;
										}
										p=p.fail
								}
								if(!p){
										target.next[ch].fail = this.root;
								}
						}
				}
				this.root.fail = this.root;
		}
		query(haystack){
				let matchStringIndexes = {};
				let node = this.root;
				for(let i=0;i<haystack.length;i++){
						let ch = haystack[i];
						for(;;){
								if(node.next[ch] === undefined){
										node = node.fail;
										if(node === this.root){
												break;
										}
								} else {
										node = node.next[ch];
										break;
								}
						}
						if(node === this.root){
								continue;
						}
						let strNode = node;
						for(;strNode !== this.root;strNode = strNode.fail){
								if(strNode.strNo >= 0){
										let key = this.stringList[strNode.strNo];
										if(matchStringIndexes[key]){
												matchStringIndexes[key].push(i-key.length+1)
										} else{
												matchStringIndexes[key] = [i-key.length+1];
										}
								} else{
										break;
								}
						}
				}
				let result = [];
				for(let key in matchStringIndexes){
						result.push({
								key: key,
								indexes: matchStringIndexes[key]
						});
				}
				return result;
		}
		reset(){}
		createNode(ch, id){
				let node = {};
				node.id = id;
				node.char = ch
				node.strNo = -1;
				node.fail = null;
				node.next = {};
				this.nodeList.push(node);
				return node;
		}
		print(){
				for(let node of this.nodeList){
						console.log(
								`id:${node.id}, char:${node.char}, str:${this.stringList[node.strNo]}, fail:${node.fail && node.fail.char}`
						);
						console.log(node);
				}

		}
		printTrie(){
				this.dfs(this.root, 0);
		}
		dfs(node, depth){
				for(let index in node.next){
						let child = node.next[index];
						//console.log(depth,child.strNum, node.fail, node.next.length,node.id)
						//console.log(child);
						if(child.strNo >= 0 ){
								console.log(depth, child.char)
								console.log(this.stringList[child.strNo])
						} else{
								console.log(depth, child.char)
						}
						this.dfs(child, depth+1)
				}
		}
}

