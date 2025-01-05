import React, { Component } from "react";
import { FlashcardList } from "./FlashcardList";
import { FlashcardCreate } from "./FlashcardCreate";
import { FlashcardLoad} from "./FlashcardLoad"
import "./style.css"


// TODO: When you're ready to get started, you can remove all the example 
//   code below and start with this blank application:

type Page = {kind: "list"} | {kind: "create"} | {kind: "quiz", name: string};

type FlashcardAppState = {
  page: Page
}

export type Props = {
  onBack: () => void
}

/** Displays the UI of the Flashcard application. */
export class FlashcardApp extends Component<{}, FlashcardAppState> {

  constructor(props: {}) {
    super(props);

    this.state = {page: {kind: "list"}};
  }

  
  render = (): JSX.Element => {
    if (this.state.page.kind === "list") {
      return <FlashcardList onCreateClick={this.doCreateClick}
                            onLoadDeckClick={this.doLoadDeckClick}/>
    } else if (this.state.page.kind === "create") {
      return <FlashcardCreate onBackClick={this.doBackClick}/>
    } else {
      return <FlashcardLoad name={this.state.page.name}
                            onBackClick={this.doBackClick}/>
    }
  };

  doCreateClick = (): void => {
    this.setState({page: {kind: "create"}})
  }

  doLoadDeckClick = (name: string): void => {
    this.setState({page: {kind: "quiz", name: name}})
  }

  doBackClick = (): void => {
    this.setState({page: {kind: "list"}})
  }
}


