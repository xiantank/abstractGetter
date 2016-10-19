"use strict";
class AbstractGetter {
		constructor(options = {}) {
				this.aca = new ACA();
				this.slideType = options.slideType || "char" || "sentence";
				this.slideSize = options.slideSize || 300;
				this.maxParagraph = options.maxParagraph || 3;
				this.isInSlide = (options.isInSlide && options.isInSlide.bind(this)) || ((this.slideType === "char") ? this.isInCharSlide : this.isInSentenceSlide);
				this.getDistance = (options.getDistance && options.getDistance.bind(this)) || ((this.slideType === "char") ? this.getDistanceByChar : this.getDistanceBySentence)
		}

		getDistanceByChar(start, end) {
				return (end - start);
		}

		getDistanceBySentence(start, end) {
				let cnt = 0;
				for (let i = start; i < end; i++) {
						switch (this.article[i]) {
								case ',':
								case '.':
								case '?':
								case '!':
								case '，':
								case '。':
								case '？':
								case '！':
										cnt++;
										break;
								default:
						}
						// if (cnt >= this.slideSize) {
						// 		break;
						// }
				}
				return cnt;
		}

		query(patterns) {
				if (typeof patterns === "string") {
						patterns = patterns.split(/\s/);
				}
				if (!Array.isArray(patterns)) {
						patterns = [patterns];
				}
				for (let pattern of patterns) {
						this.aca.add(pattern);
				}
				this.aca.build();
		}

		getAbstract(article) {
				this.article = article;
				let indexesArray = this.aca.query(article);
				console.log(indexesArray);
				if (!indexesArray.length) {
						console.log("not found!", indexesArray);
						return "";
				}
				let paragraphs = this.getAbstractBySlideWindow(indexesArray);
				paragraphs = paragraphs.map((paragraph)=> {
						//return article.slice(paragraph.start, paragraph.start + this.slideSize);
						console.log(paragraph.start);
						return article.slice(paragraph.start, paragraph.start + 100);
				});
				this.article = undefined;
				return paragraphs;

		}

		getAbstractBySlideWindow(indexObjArray) {
				if (indexObjArray.length === 0) {
						return 0;
				}
				let indexesArray = [];
				let keys = indexObjArray.map(indexObj=> {
						return indexObj.key;
				});
				for (let indexObj of indexObjArray) {
						Array.prototype.push.apply(indexesArray, indexObj.indexes.map((index)=> {
								return {
										key: indexObj.key,
										index: index
								};
						}));
				}
				indexesArray.sort((a, b)=> {
						return a.index - b.index;
				});
				let result = [];
				for (let i = 0; (keys.length > 0) && (i < this.maxParagraph); i++) {
						let paragraph = this._getAbstractBySlideWindow(indexesArray);
						result.push(paragraph);
						keys = keys.filter(function (key) {
								return paragraph.keys.indexOf(key) === -1;
						});
						indexesArray = indexesArray.filter((indexes)=> {
								return paragraph.keys.indexOf(indexes.key) === -1;
						});
				}

				return result;
		}

		_getAbstractBySlideWindow(indexesArray) {
				let wordMap = {
						_min: undefined,
						_max: undefined,
						_map: [],
						keys: function () {
								return this._map.map(indexObj=> {
										return indexObj.key
								})
						},
						get size() {
								return this._map.length;
						},
						set: function (key, value) {
								let index = this.indexOf(key);
								if (index !== -1) {
										this._map[index].value = value;
								} else {
										this._map.push({key: key, value: value});
								}
								if (value > this._max || this._max === undefined) {
										this._max = value;
								}
								if (value < this._min || this._min === undefined) {
										this._min = value;
								}
						},
						delete: function (key) {
								let index = this.indexOf(key);
								if (index !== -1) {
										let word = this._map.splice(index, 1);
										if (word.value === this._min) {
												this._min = undefined;
										} else if (word.value === this._max) {
												this._max = undefined;
										}
								}
						},
						deleteMin: function () {
								let minIndex = 0;
								for (let i = 1; i < this._map.length; i++) {
										if (this._map[i].value < this._map[minIndex].value) {
												minIndex = i;
										}
								}
								this._map.splice(minIndex, 1);
								this._min = undefined;
						},
						indexOf(key){
								for (let i = 0; i < this._map.length; i++) {
										if (key === this._map[i].key) {
												return i;
										}
								}
								return -1;
						},
						get min() {
								if (this._min === undefined && this._map.length > 0) {
										this._min = this._map[0].value;
										this._map.forEach(obj=> {
												if (obj.value < this._min) {
														this._min = obj.value;
												}
										})
								}
								return this._min;
						},
						get max() {
								if (this._max === undefined && this._map.length > 0) {
										this._max = this._map[0].value;
										this._map.forEach(obj=> {
												if (obj.value > this._max) {
														this._max = obj.value;
												}
										})
								}
								return this._max;
						},
						get distance() {
								return this.max - this.min;
						},
						*[Symbol.iterator](){
								for (let obj of this._map) {
										yield [obj.key, obj.value];
								}
						}
				};
				let minDistance = Number.MAX_SAFE_INTEGER;
				let keyMaxCnt = 0;
				let keyMaxStartIndex = indexesArray[0].index;
				let keyMaxEndStartIndex = indexesArray[0].index;
				let keyCnt = 0;
				let keys;
				wordMap.set(indexesArray[0].key, indexesArray[0].index);
				for (let i = 0; i < indexesArray.length; i++) {
						let current = indexesArray[i];
						//if ((current.index - wordMap.min) <= this.slideSize) {
						if (this.getDistance(wordMap.min, current.index) <= this.slideSize) {
								wordMap.set(current.key, current.index);
								keyCnt = wordMap.size;
								if (keyCnt > keyMaxCnt) {
										minDistance = this.getDistance(wordMap.min, wordMap.max);
										keyMaxCnt = keyCnt;
										keyMaxStartIndex = wordMap.min;
										keyMaxEndStartIndex = wordMap.max;
										keys = wordMap.keys();
								} else if (keyCnt === keyMaxCnt) {
										if (this.getDistance(wordMap.min, wordMap.max) < minDistance) {
												minDistance = this.getDistance(wordMap.min, wordMap.max);
												keyMaxStartIndex = wordMap.min;
												keyMaxEndStartIndex = wordMap.max;
												keys = wordMap.keys();
										}
								}
						} else {
								for (; ;) { // remove out of slideSize
										//if (((current.index - wordMap.min) <= this.slideSize)
										if (this.getDistance(wordMap.min, current.index) <= this.slideSize
											|| (current.index === wordMap.min)
											|| !wordMap.size
										) {
												break;
										} else {
												wordMap.deleteMin();
										}
								}
								wordMap.set(current.key, current.index);
								keyCnt = wordMap.size;
								if (keyCnt > keyMaxCnt) {
										minDistance = this.getDistance(wordMap.min, wordMap.max);
										keyMaxCnt = keyCnt;
										keyMaxStartIndex = wordMap.min;
										keyMaxEndStartIndex = wordMap.max;
										keys = wordMap.keys();
								} else if (keyCnt === keyMaxCnt) {
										if (this.getDistance(wordMap.min, wordMap.max) < minDistance) {
												minDistance = this.getDistance(wordMap.min, wordMap.max);
												keyMaxStartIndex = wordMap.min;
												keyMaxEndStartIndex = wordMap.max;
												keys = wordMap.keys();
										}
								}
						}
				}
				return {
						start: keyMaxStartIndex,
						endStart: keyMaxEndStartIndex,
						keys: keys
				};
		}
}
