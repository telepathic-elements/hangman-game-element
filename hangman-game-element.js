import {TelepathicElement} from "../telepathic-element/telepathic-element.js";

export default class HangmanGameElement extends TelepathicElement{
    constructor(){
        super();
        this.state = 0;
        this.score = 0;
        this.wordList = ["HANGMAN","HELLO","LASTCALL"];
        this.revealedWord = document.createElement("ul");
        this.loadText();
    }

    //The maximum is exclusive and the minimum is inclusive
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; 
    }
    static get observedAttributes() {
        return ['lastkeypress','reset'];
    } 
    
    async loadText(){
        console.log("loadText was called");
        this.words = await this.loadFile("./wordlist.txt");
        //console.log("words: ",this.words);
        this.wordList = this.words.split('\n');
        //console.log("wordList: ",this.wordList);
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        console.log(attrName+" changed from "+oldVal+" to "+newVal);
        if(attrName == "lastkeypress" && oldVal != newVal){
            this.onBtnPress(newVal);
        }
        if(attrName == "reset" && oldVal != newVal){
           this.state = 0;
           this.gameField.setState(this.state);
           this.resetGame();
        }
    } 
    async init(){
        console.log("this.$: ",this.$);
        this.keyboard = this.$.querySelector("hangman-keyboard-element");
        this.gameField = this.$.querySelector("hangman-svg-element");
    }

    onReady(){
        this.resetGame(); 
    }

    resetGame(){
        this.score = 0;
        //This kicks off the reset chain, no need to reset the other components here
        this.keyboard.setAttribute("reset", new Date());
        let wordNum = this.getRandomInt(0,this.wordList.length);
        let word = this.wordList[wordNum].toUpperCase();
        this.prepWordField(word);
        this.currentWord = word;
        this.gameField.setAttribute("word",`${this.currentWord}`);

    }
    prepWordField(word){
        while(this.revealedWord.firstChild){
            this.revealedWord.removeChild(this.revealedWord.firstChild);
        }
        word.split('').forEach((letter)=>{
            let li = document.createElement("li");
            li.style.display = "inline";
            li.innerHTML = " _ ";
            this.revealedWord.appendChild(li);
        });
        console.log("this.revealedWord: ",this.revealedWord);
    }
    onBtnPress(val){
        console.log("Button pressed was ",val);
        if(!this.currentWord.includes(val)){
            this.gameField.setState(++this.state);
            if(this.state >= 6){
                setTimeout(()=>{
                    alert("Sorry!  You Lose!");
                    this.resetGame();
                },1000);                
            }
        }else{
            if(this.state > 0){
                this.gameField.setState(--this.state);
            }
            this.revealLetter(val);
            console.log("this.score: ",this.score);
            console.log("this.currentWord.length: ",this.currentWord.length);
            if(this.score == this.currentWord.length){
                setTimeout(()=>{
                    alert("Congratulations! You win!");
                    this.resetGame();
                },1000);
            }
        }
    }

    revealLetter(l){
        let positions = []
        this.currentWord.split('').forEach((el,idx)=>{
            if(l == el){
                positions.push(idx);
            }
        });
        this.score += positions.length;
        let pos = 0;
        console.log("positions: ",positions);
        console.log("checking for "+l+" on ",this.revealedWord.childNodes);
        this.revealedWord.childNodes.forEach((el,idx)=>{
            console.log("on "+idx+" looking for "+positions[pos]);
            if(idx == positions[pos]){
                console.log("found "+l+" @ "+idx);
                let newNode = document.createElement('b');
                newNode.innerHTML = ` ${l} `;
                let oldNode = el.firstChild;
                if(oldNode){
                    el.replaceChild(newNode,oldNode);
                }else{
                    el.appendChild(newNode);
                }
                pos++;
            }
            
        });
    }
}