function injectedFunction() {
  console.log('hello from injectedFunction()');

  /*const http = require('http');

  const originalAddRequest = http.Agent.prototype.addRequest;
  const originalOnSocket = http.ClientRequest.prototype.onSocket;

  let lastRequestId = 0;
  let lastConnectionId = 0;*/


  let messages = [];
  let messageAdded = null;

  global.__ndb_reportMessage = async function(message) {
    console.log('hello from reportMessage. message: ' + message);
    messages.push(message);
    if (messageAdded) {
      setTimeout(messageAdded, 0);
      messageAdded = null;
    }
  }

  global.__ndb_getMessages = async function() {
    console.log('hello from getMessages');
    if (!messages.length)
      await new Promise(resolve => messageAdded = resolve);
    let copy = messages;
    messages = [];
    return copy;
  }

  console.log('injectedFunction exiting');
}

async function injectNetworking10(target) {
  console.log('hello from injectNetworking10');


  async function listenForMessages() {
    console.log('hello from listenForMessages');
    while (true) {
      //const {result: {value: messages}} = await target.runtimeAgent().invoke_evaluate({
      const retval = await target.runtimeAgent().invoke_evaluate({
        awaitPromise: true,
        returnByValue: true,
        expression: 'global.__ndb_getMessages()'
      });
      console.log('recieved message: ' + JSON.stringify(retval, null, 2));
      /*for (const message of messages) {
        console.log('received message: ' + message);
        if (message === 'stop') // TODO delet this?
          process.exit(0);
      }*/
      // TODO
      // SDK.networkLog.dispatchEventToListeners(SDK.NetworkLog.Events.RequestAdded,
      // request);
    }
  }

  await target.runtimeAgent().invoke_evaluate({
    //awaitPromise: true,
    expression: `(${injectedFunction.toString()})()`
  });

  console.log('calling listenForMessages()');
  listenForMessages();

  console.log('injectNetworking10 exiting');
}



//async function injectNetworking12(target) {
//
//  await target.runtimeAgent().invoke_addBinding({
//    name: '__cdp_requestWillBeSent'
//  });
//
//  const injectedFunction = async function() {
//    const http = require('http');
//  };
//
//  await target.runtimeAgent().invoke_evaluate({
//    // TODO what is this? includeCommandLineAPI: true
//    awaitPromise: true,
//    expression: `(${injectedFunction.toString()})()`
//  });
//
//  target.registerRuntimeDispatcher();
//}

Ndb.NetworkAgent = class {
  static async injectNetworking(target) {
    await injectNetworking10(target);
  }
};
