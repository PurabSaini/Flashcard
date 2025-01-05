import React, { Component, ChangeEvent  } from 'react';
import { isRecord } from './record';

type LoadProps = {
    onBackClick: () => void,
    name: string
}

type LoadState = {
    msg: string
    userName: string
    deck: string[]
    correct: number
    incorrect: number
    currIndex: number
    flip: boolean
}

export class FlashcardLoad extends Component<LoadProps, LoadState> {

    constructor(props: LoadProps) {
        super(props)
        this.state = {msg: "", userName: "", deck: [], correct: 0, incorrect: 0, currIndex: 0, flip: false}
    }

    componentDidMount = (): void => {
      this.doLoadClick();
    }

    render = (): JSX.Element => {
        if (this.state.deck.length !== this.state.currIndex) {
            return (<div> 
    
                <h1>{this.props.name}</h1>
            
                <h2>Correct: {this.state.correct} | Incorrect: {this.state.incorrect}</h2>
        
                <div>
        
                <div className="card">{this.doRenderCardClick()}</div>
                </div>
                
                <div>
                <button onClick={this.doFlipClick}>Flip</button> 
                <button onClick={this.doCorrectClick}>Correct</button>
                <button onClick={this.doIncorrectClick}>Incorrect</button>
                </div>
                
                
                </div>)
        } else { // Renders the end of quiz page.
        
            return (
                
            <div> 
        
                <h1>{this.props.name}</h1>
                <br/>
                <h2>Correct: {this.state.correct} | Incorrect: {this.state.incorrect}</h2>
                <br/>
                <p>End of quiz</p>
    
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={this.state.userName} onChange={this.doUserNameSaveClick}></input>
                <button onClick={this.doSaveScoreClick}>Finish</button>
        
            </div>)
        
        }
    }

    doRenderCardClick = (): JSX.Element => {
        const currCard = this.state.deck[this.state.currIndex];
        const question = currCard.slice(0, currCard.indexOf('|'));
        const answer = currCard.slice(currCard.indexOf('|') + 1, currCard.length);

        if (this.state.flip === false) {
            return <p>{question}</p>
        } else {
            return <p>{answer}</p>
        }
    }

    doBackClick = (): void => {
        this.setState({currIndex: 0, flip: false})
        this.props.onBackClick();
    }

    doUserNameSaveClick = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({userName: evt.target.value});
      }

    doFlipClick = (): void => {
        this.setState({flip: !this.state.flip})
    }

    doError = (err: string): void => {
        console.error(err)
    }

    doCorrectClick = (): void => {
        this.setState({correct: this.state.correct + 1, currIndex: this.state.currIndex + 1, flip: false});
    }
    
    doIncorrectClick = (): void => {
        this.setState({incorrect: this.state.incorrect + 1, currIndex: this.state.currIndex + 1, flip: false});
    }

    renderMessage = (): JSX.Element => {
        if (this.state.msg === "") {
          return <div></div>;
        } else {
          return <p>Server says: {this.state.msg}</p>;
        }
    }

    doSaveScoreClick = (): void => {
        if (this.state.userName.length === 0) {
          this.setState({msg: "Please enter a name."});
          this.renderMessage();
        } else {
          const score = 100 * (this.state.correct / (this.state.deck.length));
          fetch("/api/saveScore", {
            method: "POST",
            body: JSON.stringify({name: this.state.userName, deck: this.props.name, score: String(Math.floor(score))}),
            headers: {"Content-Type": "application/json"},
          })
          .then( (res) => this.doScoreResp(res))
          .catch(() => this.doError("Failed to save"))
        }
      }
    
    doScoreResp = (res: Response): void => {
        if (res.status === 200) {
          res.json().then(this.doScoreJson).catch(() => this.doError("INVALID JSON format"))
        } else if (res.status === 400) {
          res.text().then(this.doError)
                    .catch(() => this.doError("400 reponse is not text"))
        } else {
          this.doError('Unexpected status ${res.status}');
        }
    }
    
    doScoreJson = (val: unknown): void => {
        if (!isRecord(val)) {
          throw new Error("result wasn't json")
        }
    
        if (typeof val.added !== 'boolean') {
          console.error("bad data from /add: name is not a string", val);
          return;
        }
        this.doBackClick();
        return;
    }

    doLoadClick = (): void => {
        fetch(`/api/load/?name=${encodeURIComponent(this.props.name)}`)
          .then(this.doLoadResp)
          .catch(() => this.doError("failed to connect to server"))
    }
    
    doLoadResp = (res: Response): void => {
        if (res.status === 200) {
          res.json().then(this.doLoadJson)
             .catch(() => this.doError("200 response is not valid JSON"));
        } else if (res.status === 400) {
          res.text().then(this.doError)
             .catch(() => this.doError("400 response is not text"));
        } else {
          this.doError(`bad status code ${res.status}`);
        }
    }
    
    doLoadJson = (val: unknown): void => {
        if (!isRecord(val)) {
          throw new Error("Bad data from /load. Not a record")
        }
    
        const item = val.value;
    
        if (item !== undefined && Array.isArray(item) && item !== null) {
          this.setState({deck: item})
        }
    }
}