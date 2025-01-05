import React, { Component, ChangeEvent  } from 'react';
import { isRecord } from './record';

type CreateProps = {
    onBackClick: () => void,
}

type CreateState = {
    name: string
    textbox: string
    msg: string
    decks: string[]
}

export class FlashcardCreate extends Component<CreateProps, CreateState> {
    constructor(props: CreateProps) {
        super(props)
        this.state = {name: "", textbox: "", msg: "", decks: []}
    }

    componentDidMount = (): void => {
        this.doRefreshDecksClick();
    }

    render = (): JSX.Element => {
        return (
            <div>
                <h1>Create</h1>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" value={this.state.name} onChange={this.doChangeNameClick}></input>
                    <p> Options (one per line, formatted as front|back)</p>
                </div>

                <div>
                    <label htmlFor="textbox">Enter text:</label>
                    <br/>
                    <textarea id="textbox" rows={10} cols={40} value={this.state.textbox}
                    onChange={this.doChangeDeckClick}></textarea>
                </div>

                <div>
                    <button onClick={this.doAddClick}>Add</button>
                    <button onClick={this.doBackClick}>Back</button>
                </div>
                {this.renderMessage()}
            </div>
        )
    }

    doBackClick = (): void => {
        this.doRefreshDecksClick();
        this.props.onBackClick();
    }

    renderMessage = (): JSX.Element => {
        if (this.state.msg === "") {
          return <div></div>;
        } else {
          return <p>Server says: {this.state.msg}</p>;
        }
    }
      
    doError = (err: string): void => {
        console.error(err)
    }
      
    doChangeNameClick = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({name: evt.target.value, msg: ""});
    }

    doChangeDeckClick = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({textbox: event.target.value});
    }

    doAddClick = (): void => {
        if (this.state.decks.includes(this.state.name)) {
          this.setState({msg: "Name is already used. Please enter new name."});
          this.renderMessage();
        } else if (this.state.name.length === 0) {
          this.setState({msg: "Please enter a name."});
          this.renderMessage();
        } else if (this.state.textbox.length === 0) {
          this.setState({msg: "Please enter flashcards."});
          this.renderMessage();
        } else {
          const newDeck: string[] = this.state.textbox.split("\n")
          for (const card of newDeck) {
            if (card.indexOf("|") === -1 || card.indexOf("|") === 0 || card.indexOf("|") === card.length - 1) {
              this.setState({msg: "Please enter flashcards in the correct format."})
              this.renderMessage();
              return;
            } else if ((card.slice(card.indexOf("|") + 1)).indexOf("|") !== -1) {
                this.setState({msg: "Please only have one | per question and answer"})
                this.renderMessage();
                return;
            }
          }
          fetch("/api/save", {
            method: "POST",
            body: JSON.stringify({name: this.state.name, value: newDeck}),
            headers: {"Content-Type": "application/json"},
          })
          .then( (res) => this.doAddResp(res))
          .catch(() => this.doError("Failed to save"))
        }
      }
    
    doAddResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doAddJson).catch(() => this.doError("INVALID JSON format"))
        } else if (res.status === 400) {
            res.text().then(this.doError)
                    .catch(() => this.doError("400 reponse is not text"))
        } else {
            this.doError('Unexpected status ${res.status}');
        }
    }

    doAddJson = (val: unknown): void => {
        if (!isRecord(val)) {
            throw new Error("result wasn't json")
        }

        if (typeof val.replaced !== 'boolean') {
            console.error("bad data from /add: name is not a string", val);
            return;
        }
        this.doBackClick();
        return;
    }

    doRefreshDecksClick = (): void => {
        fetch("/api/list")
            .then(this.doListResp)
            .catch(() => this.doError("failed to connect to server"));
      };
    
    // Called with the response from a request to /api/list
    doListResp = (res: Response): void => {
        if (res.status === 200) {
            res.json().then(this.doListJson)
                .catch(() => this.doError("200 response is not valid JSON"));
        } else if (res.status === 400) {
            res.text().then(this.doError)
                .catch(() => this.doError("400 response is not text"));
        } else {
            this.doError(`bad status code ${res.status}`);
        }
    };

    // Called with the JSON response from /api/list
    doListJson = (val: unknown): void => {
        if (!isRecord(val)) {
            console.error("bad data from /list: not a record", val)
            return;
        }
        
        const items = this.doParseItemsClick(val.items);
        if (items !== undefined) {
            this.setState({decks: items})
        } else {
            console.error("Failed to parse items")
        }
    };
    
    doParseItemsClick = (val: unknown): undefined | string[] => {
        if (!Array.isArray(val)) {
            console.error("not an array", val);
            return undefined;
        }
        
        const items: string[] = [];
        for (const item of val) {
            if (typeof item !== 'string') {
                console.error("item.name is missing or invalid", item.name);
                return undefined;
            } else {
                items.push(item);
            }
        }
        return items;
    };
    
}