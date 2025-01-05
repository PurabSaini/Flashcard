import React, { Component } from 'react';
import { isRecord } from './record';

export type Score = {userName: string, deckName: string, score: number}

type ListProps = {
    onCreateClick: () => void,
    onLoadDeckClick: (name: string) => void
}

type ListState = {
    decks: string[]
    scores: Score[]
}

export class FlashcardList extends Component<ListProps, ListState> {

    constructor(props: ListProps) {
        super(props)
        this.state = {decks: [], scores: []}
    }

    componentDidMount = (): void => {
        this.doRefreshDecksClick();
        this.doRefreshScoresClick();
    }

    render = (): JSX.Element => {
        const list: JSX.Element[] = [];
        const scoresList: JSX.Element[] = [];
        if (this.state.decks.length !== 0) {
            for (const fileName of this.state.decks) {
              list.push(
                <div key={fileName}>
                    <ul>
                        <li>
                            <a href="#" onClick={() => this.doLoadDeckClick(fileName)}>
                            {fileName}
                            </a>
                        </li>
                    </ul>
                </div>
              )
            }
        }

        if (this.state.scores.length !== 0) {
            for (const [index, score] of this.state.scores.entries()) {
              scoresList.push(
                <div key={index}>
                    <ul>
                        <li>
                        <p>
                            {`${score.userName}, ${score.deckName}: ${score.score}`}  
                        </p>
                        </li>
                    </ul>
                </div>
              )
            }
        }
        return (
            <div>
                <h1>List</h1>
                {list}
                <button type="button" onClick={this.doCreateClick}>New</button>
                <h1>Scores</h1>
                {scoresList}
            </div>
        )
    }


    doCreateClick = (): void => {
        this.props.onCreateClick();
    }

    doLoadDeckClick = (name: string): void => {
        this.props.onLoadDeckClick(name);
    }

    doError = (err: string): void => {
        console.error(err)
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

    doRefreshScoresClick = (): void => {
        fetch("/api/listOfScores")
            .then(this.doListScoreResp)
            .catch(() => this.doError("failed to connect to server"));
    };
    
      // Called with the response from a request to /api/list
    doListScoreResp = (res: Response): void => {
        if (res.status === 200) {
          res.json().then(this.doListScoreJson)
             .catch(() => this.doError("200 response is not valid JSON"));
        } else if (res.status === 400) {
          res.text().then(this.doError)
             .catch(() => this.doError("400 response is not text"));
        } else {
          this.doError(`bad status code ${res.status}`);
        }
    };
    
      // Called with the JSON response from /api/list
    doListScoreJson = (val: unknown): void => {
        if (!isRecord(val)) {
          console.error("bad data from /listOfScores: not a record", val)
          return;
        }
        
        const items = this.doParseScoresClick(val.items);
        if (items !== undefined) {
          this.setState({scores: items})
        } else {
          console.error("Failed to parse scores")
        }
    };
    
    doParseScoresClick = (val: unknown): undefined | Score[] => {
        if (!Array.isArray(val)) {
          console.error("not an array", val);
          return undefined;
        }
        
        const items: Score[] = [];
        for (const item of val) {
          if (!isRecord(item)) {
            console.error("item is not a record", item);
            return undefined;
          } else if (typeof item.userName !== 'string') {
            console.error("item name is not a string", item.userName)
          } else if (typeof item.deck !== 'string') {
            console.error("deck name is not a string", item.deck)
          } else if (typeof item.score !== 'string') {
            console.error("score is not a string", item.score)
          } else {
            items.push({userName: item.userName, deckName: item.deck, score: Number(item.score)});
          }
        }
        return items;
    }
}