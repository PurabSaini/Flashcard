import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { list, save, load, resetForTesting, listOfScores, saveScore, resetForTestingScores } from './routes';


describe('routes', function() {

  // TODO: remove the tests for the dummy route
  it ('list', function() {
    // Tests to see if no files have been saved
    const savedFilesReq1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list'});
    const savedFilesRes1 = httpMocks.createResponse();
    list(savedFilesReq1, savedFilesRes1);

    assert.strictEqual(savedFilesRes1._getStatusCode(), 200);
    assert.deepStrictEqual(savedFilesRes1._getData().items, []);

    // Tests to see if there is one item saved
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "key", value: "some stuff"}});
    const res2 = httpMocks.createResponse();
    save(req2, res2);
    
    const savedFilesReq2 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list'});
    const savedFilesRes2 = httpMocks.createResponse();
    list(savedFilesReq2, savedFilesRes2);

    assert.strictEqual(savedFilesRes2._getStatusCode(), 200);
    assert.deepStrictEqual(savedFilesRes2._getData().items, ['key']);
    resetForTesting();
    
    // Tests to see if there are multiple items saved
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/save', 
      body: {name: "lock", value: "batman"}});
    const res3 = httpMocks.createResponse();
    save(req3, res3);

    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/save', 
      body: {name: "lord", value: "ruler"}});
    const res4 = httpMocks.createResponse();
    save(req4, res4);

    const savedFilesReq3 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list'});
    const savedFilesRes3 = httpMocks.createResponse();
    list(savedFilesReq3, savedFilesRes3);

    assert.strictEqual(savedFilesRes3._getStatusCode(), 200);
    assert.deepStrictEqual(savedFilesRes3._getData().items, ['lock', 'lord']);

    resetForTesting();
  })

  it('save', function() {
    // First branch, straight line code, error case (only one possible input)
    const req1 = httpMocks.createRequest(
        {method: 'POST', url: '/api/save', body: {value: "some stuff"}});
    const res1 = httpMocks.createResponse();
    save(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "name" was missing');

    // Second branch, straight line code, error case (only one possible input)
    const req2 = httpMocks.createRequest(
        {method: 'POST', url: '/api/save', body: {name: "A"}});
    const res2 = httpMocks.createResponse();
    save(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(),
        'required argument "value" was missing');

    // Third branch, straight line code

    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/save',
        body: {name: "A", value: "some stuff"}});
    const res3 = httpMocks.createResponse();
    save(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData(), {replaced: false});

    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/save',
        body: {name: "A", value: "different stuff"}});
    const res4 = httpMocks.createResponse();
    save(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData(), {replaced: true});

    // Called to clear all saved transcripts created in this test
    //    to not effect future tests
    resetForTesting();
  });

  it('load', function() {

    // Example test:
    // First need to save something in order to load it
    const saveReq = httpMocks.createRequest({method: 'POST', url: '/api/save',
        body: {name: "key", value: "transcript value"}});
    const saveResp = httpMocks.createResponse();
    save(saveReq, saveResp);
    // Now we can actually (mock a) request to load the transcript
    const loadReq = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "key"}});
    const loadRes = httpMocks.createResponse();
    load(loadReq, loadRes);
    // Validate that both the status code and the output is as expected
    assert.strictEqual(loadRes._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes._getData(), {value: "transcript value"});
    
    // Tests to see if value is returned when the name inputted has a transcript.
    const req1 = httpMocks.createRequest({method: 'POST', url: '/api/save', 
        body: {name: "lock", value: "batman"}});
    const saveReq1 = httpMocks.createResponse();
    save(req1, saveReq1);
    const loadReq1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "lock"}});
    const loadRes1 = httpMocks.createResponse();
    load(loadReq1, loadRes1);

    assert.strictEqual(loadRes1._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes1._getData(), {value: "batman"});
    
    // Tests to see if 404 status is returned when there is no transcript with inputted name.
    const loadReq2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "Nurgle"}});
    const loadRes2 = httpMocks.createResponse();
    load(loadReq2, loadRes2);
    
    assert.strictEqual(loadRes2._getStatusCode(), 404);
    assert.deepStrictEqual(loadRes2._getData(), 'no transcript saved under "Nurgle"');

    const loadReq3 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "Ninja"}});
    const loadRes3 = httpMocks.createResponse();
    load(loadReq3, loadRes3);
    
    assert.strictEqual(loadRes3._getStatusCode(), 404);
    assert.deepStrictEqual(loadRes3._getData(), 'no transcript saved under "Ninja"');

    // Tests to see if 400 status is returned when name is undefined or not a string
    const loadReq4 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: undefined}});
    const loadRes4 = httpMocks.createResponse();
    load(loadReq4, loadRes4);
    
    assert.strictEqual(loadRes4._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes4._getData(), 'required argument "name" was missing');

    const loadReq5 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: 5}});
    const loadRes5 = httpMocks.createResponse();
    load(loadReq5, loadRes5);
    
    assert.strictEqual(loadRes5._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes5._getData(), 'required argument "name" was missing');

    const loadReq6 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: 5}});
    const loadRes6 = httpMocks.createResponse();
    load(loadReq6, loadRes6);
    
    assert.strictEqual(loadRes6._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes6._getData(), 'required argument "name" was missing');

    // Called to clear all saved files created in this test
    //    to not effect future tests
    resetForTesting();
  });

  it ('listScore', function() {
    // Tests to see if no files have been saved
    const savedFilesReq1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/listOfScores'});
    const savedFilesRes1 = httpMocks.createResponse();
    listOfScores(savedFilesReq1, savedFilesRes1);

    assert.strictEqual(savedFilesRes1._getStatusCode(), 200);
    assert.deepStrictEqual(savedFilesRes1._getData().items, []);

    // Tests to see if there is one item saved
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/saveScore', body: {name: "name", deck: "deck", score: "5"}});
    const res2 = httpMocks.createResponse();
    saveScore(req2, res2);
    
    const savedFilesReq2 = httpMocks.createRequest(
      {method: 'GET', url: '/api/listOfScores'});
    const savedFilesRes2 = httpMocks.createResponse();
    listOfScores(savedFilesReq2, savedFilesRes2);

    assert.strictEqual(savedFilesRes2._getStatusCode(), 200);
    assert.deepStrictEqual(savedFilesRes2._getData().items, [{userName: "name", deck: "deck", score: "5"}]);
    resetForTestingScores();
    
    // Tests to see if there are multiple items saved
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/saveScore', 
      body: {name: "Arnold", deck: "Math", score: "100"}});
    const res3 = httpMocks.createResponse();
    saveScore(req3, res3);

    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/saveScore', 
      body: {name: "Jared", deck: "History", score: "75"}});
    const res4 = httpMocks.createResponse();
    saveScore(req4, res4);

    const savedFilesReq3 = httpMocks.createRequest(
      {method: 'GET', url: '/api/listOfScores'});
    const savedFilesRes3 = httpMocks.createResponse();
    listOfScores(savedFilesReq3, savedFilesRes3);

    assert.strictEqual(savedFilesRes3._getStatusCode(), 200);
    assert.deepStrictEqual(savedFilesRes3._getData().items, [{userName: "Arnold", deck: "Math", score: "100"}, {userName: "Jared", deck: "History", score: "75"}]);

    resetForTestingScores();
  })

  it('saveScore', function() {
    // First branch, straight line code, error case (only one possible input)
    const req1 = httpMocks.createRequest(
        {method: 'POST', url: '/api/saveScore', body: {deck: "some stuff", score: "50"}});
    const res1 = httpMocks.createResponse();
    saveScore(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "name" was missing');

    // Second branch, straight line code, error case (only one possible input)
    const req2 = httpMocks.createRequest(
        {method: 'POST', url: '/api/saveScore', body: {name: "A", score: "100"}});
    const res2 = httpMocks.createResponse();
    saveScore(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(),
        'required argument "deck" was missing');

    // Third branch, straight line code, error case (only one possible input)
    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/saveScore', body: {name: "Barry", deck: "Comics"}});
  const res5 = httpMocks.createResponse();
  saveScore(req5, res5);

  assert.strictEqual(res5._getStatusCode(), 400);
  assert.deepStrictEqual(res5._getData(),
      'required argument "score" was missing');

    // Fourth branch, straight line code
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/saveScore',
        body: {name: "A", deck: "Yugioh", score: "90"}});
    const res3 = httpMocks.createResponse();
    saveScore(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData(), {added: true});

    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/saveScore',
        body: {name: "B", deck: "Magic", score: "95"}});
    const res4 = httpMocks.createResponse();
    saveScore(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData(), {added: true});

    // Called to clear all saved transcripts created in this test
    //    to not effect future tests
    resetForTestingScores();
  });

});
