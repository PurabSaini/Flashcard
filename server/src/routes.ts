import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

const files: Map<string, unknown> = new Map<string, unknown>();

let scoreList: unknown[] = [];

/**
 * Returns a list of all the named scores. 
 * @param _ {SafeRequest} - The HTTP request object.
 * @param res {SafeResponse} - The HTTP response object.
 * @returns {void}
 */
export const listOfScores = (_: SafeRequest, res: SafeResponse): void => {
  res.status(200).send({items: scoreList});
};

/**
 * Handles request for /save by storing the given score.
 * @param req {SafeRequest} - The HTTP request object.
 * @param res {SafeResponse} - The HTTP response object.
 * @returns {void}
 */
export const saveScore = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;

  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('required argument "name" was missing');
    return;
  }

  const deck = req.body.deck;
  if (deck === undefined || typeof deck !== 'string') {
    res.status(400).send('required argument "deck" was missing');
    return;
  }

  const score = req.body.score;
  if (score === undefined || typeof deck !== 'string') {
    res.status(400).send('required argument "score" was missing');
    return;
  }


  scoreList.push({userName: name, deck: deck, score: score});
  res.send({added: true})
};

/**
 * Returns a list of all the named save files. 
 * @param _ {SafeRequest} - The HTTP request object.
 * @param res {SafeResponse} - The HTTP response object.
 * @returns {void}
 */
export const list = (_: SafeRequest, res: SafeResponse): void => {
  const fileNames = Array.from(files.keys());
  res.status(200).send({items: fileNames});
};

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};


/**
 * Handles request for /save by storing the given file.
 * @param req {SafeRequest} - The HTTP request object.
 * @param res {SafeResponse} - The HTTP response object.
 * @returns {void}
 */
export const save = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('required argument "name" was missing');
    return;
  }

  const value = req.body.value;
  if (value === undefined) {
    res.status(400).send('required argument "value" was missing');
    return;
  }

  
  const replaced = files.has(name);
  files.set(name, value);
  res.send({replaced: replaced}); 
};


/**
 * Handles request for /load by returning the file requested. 
 * @param req {SafeRequest} - The HTTP request object.
 * @param res {SafeResponse} - The HTTP response object.
 * @returns {void}
 */
export const load = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.query.name;
  const msg = first(name);
  if (msg === undefined || typeof msg !== 'string') {
    res.status(400).send('required argument "name" was missing');
    return;
  } 

  const hasName = files.has(msg);
  if (!hasName) {
    res.status(404).send(`no transcript saved under "${msg}"`);
    return;
  }

  res.send({value: files.get(msg)});
};


/** Used in tests to set the transcripts map back to empty. */
export const resetForTesting = (): void => {
  // Do not use this function except in tests!
  files.clear();
};

/** Used in tests to set the scores map back to empty. */
export const resetForTestingScores = (): void => {
  // Do not use this function except in tests!
  scoreList = [];
};
