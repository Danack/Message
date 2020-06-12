type Message = {
  type: string;
  params: object;
};

// Whether message processing is active. Events are not processed
// until startMessageProcessing is called, so that events that are
// triggered while widgets are being created, aren't dispatched
// until all widgets are loaded.
let messageProcessingActive: boolean = false;

// Record of whether event processing has ever been active
// If someone sends an event and processing has never been
// active, we give them an info message of 'you probably
// forgot to start processing'.
let messageProcessingEverActive: boolean = false;

// If an an event is triggered, but event processes has never been started
// we create a warning timeout, that will show a debug message after x seconds
// to avoid people staring at their computer, wondering when their events
// aren't being processed.
let notStartedWarningTimeout: any = null;

const notStartedWarningTime = 5;

// A queue of events that have been stored, rather than dispatched
// immediately. This is typically used when an app is starting up.
let messageQueue: Message[] = [];

// The current listeners to events.
let messsageListeners: object = {};

/**
 * Register a listener for a particular type of event.
 *
 * @param messageType which event to listen for.
 * @param id A unique id for this listener
 * @param fn The thing to call when the event is dispatched.
 */
const registerMessageListener = (messageType: string, id: string, fn: (params: object) => void) => {
  // @ts-ignore: any ...
  if (messsageListeners[messageType] === undefined) {
    // @ts-ignore: any ...
    messsageListeners[messageType] = {};
  }
  // @ts-ignore: any ...
  messsageListeners[messageType][id] = fn;
};

/**
 *
 *
 * @param messageType
 * @param id
 */
const unregisterListener = (messageType: string, id: string) => {
  // @ts-ignore: any ...
  delete messsageListeners[messageType][id];
};

// Allow messages to be processed, and process any backlog of messages.
const startMessageProcessing = () => {
  if (notStartedWarningTimeout !== null) {
    clearTimeout(notStartedWarningTimeout);
    notStartedWarningTimeout = null;
  }

  messageProcessingActive = true;
  messageProcessingEverActive = true;

  while (messageQueue.length > 0) {
    const messageData = messageQueue.pop();

    if (messageData === undefined) {
      // A foreach loop! A foreach loop! My kingdom
      // for a foreach loop!
      continue;
      // aka this will never happen.
    }

    triggerMessageInternal(messageData.type, messageData.params);
  }
};

// Stop messages from being processed immediately.
const stopMessageProcessing = () => {
  messageProcessingActive = false;
};

const timeoutDebugInfo = () => {
  // TODO - change to just no-console
  // @ts-ignore: console warning is fine here.
  console.warn(
    'You sent a message but message processing has never been activated. Call Message.startMessageProcessing if you want events to be dispatched.',
  );
};

/**
 * Actually process the event.
 *
 * @param eventType
 * @param params
 */
function triggerMessageInternal(eventType: string, params: object) {
  // @ts-ignore: any ...
  if (messsageListeners[eventType] === undefined) {
    // console.error('unknown event type ' + event);
    return;
  }
  // @ts-ignore: any ...
  const callbacks = messsageListeners[eventType];

  const keys = Object.keys(callbacks);
  for (const i in keys) {
    if (keys.hasOwnProperty(i) !== true) {
      continue;
    }

    const keyName = keys[i];
    const fn = callbacks[keyName];
    fn(params);
  }
}

const sendMessage = (eventType: string, params: object) => {
  // if event processing is active, process it.
  if (messageProcessingActive === true) {
    return triggerMessageInternal(eventType, params);
  }

  // If not, store the data for later processing.
  messageQueue.push({ type: eventType, params });

  // If processing has ever been active, assume they know
  // what they're doing
  if (messageProcessingEverActive === true) {
    return;
  }

  // Otherwise create a timeout to remind them to call 'startMessageProcessing'
  notStartedWarningTimeout = setTimeout(timeoutDebugInfo, notStartedWarningTime * 1000);
};

/**
 * Clear the queued events. This should only have an effect
 * when the processing is disabled, as that is the only time
 * there should be queued events.
 */
const clearMessages = () => {
  messageQueue = [];
};

/**
 * Get the queued events. This queue should only have entries
 * when the processing is disabled.
 */
const getQueuedMessages = () => {
  // TODO - return a copy, because JS.
  return messageQueue;
};

module.exports = {
  clearMessages,
  getQueuedMessages,
  registerMessageListener,
  startMessageProcessing,
  stopMessageProcessing,
  sendMessage,
  unregisterListener,
};
