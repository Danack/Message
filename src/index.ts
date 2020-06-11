type EventData = {
    type: string,
    params: object
};

// Whether event processing is active. Events are not processed
// until startEventProcessing is called, so that events that are
// triggered while widgets are being created, aren't dispatched
// until all widgets are loaded.
let eventProcessingActive: boolean = false;


// A queue of events that have been stored, rather than dispatched
// immediately. This is typically used when an app is starting up.
let eventDataQueue: EventData[] = [];

// The current listeners to events.
let eventListeners:object = {};

/**
 * Register a listener for a particular type of event.
 *
 * @param eventType which event to listen for.
 * @param id A unique id for this listener
 * @param fn The thing to call when the event is dispatched.
 */
const registerEventListener = (eventType:string, id:string, fn:(params:object) => void) => {
    // @ts-ignore: any ...
    if (eventListeners[eventType] === undefined) {
        // @ts-ignore: any ...
        eventListeners[eventType] = {};
    }
    // @ts-ignore: any ...
    eventListeners[eventType][id] = fn;
};

/**
 *
 *
 * @param event
 * @param id
 */
const unregisterListener = (event:string, id:string) => {
    // @ts-ignore: any ...
    delete eventListeners[event][id];
};

// Allow events to be processed, and process any backlog of events.
const startEventProcessing = () => {
    eventProcessingActive = true;

    while (eventDataQueue.length > 0) {
        const eventData = eventDataQueue.pop();

        if (eventData === undefined) {
            // A foreach loop! A foreach loop! My kingdom
            // for a foreach loop!
            continue;
            // aka this will never happen.
        }

        triggerEventInternal(
            eventData.type,
            eventData.params
        );
    }
};

// Stop events from being processed immediately.
const stopEventProcessing = () => {
    eventProcessingActive = false;
};



/**
 * Actually process the event.
 *
 * @param eventType
 * @param params
 */
function triggerEventInternal(eventType:string, params:object)
{
    // @ts-ignore: any ...
    if (eventListeners[eventType] === undefined) {
        // console.error('unknown event type ' + event);
        return;
    }
    // @ts-ignore: any ...
    const callbacks = eventListeners[eventType];

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

const triggerEvent = (eventType:string, params:object) => {
    // if event processing is active, process it.
    if (eventProcessingActive === true) {
        return triggerEventInternal(eventType, params);
    }

    // If not, store the data for later processing.
    eventDataQueue.push({type: eventType, params});
};

/**
 * Clear the queued events. This should only have an effect
 * when the processing is disabled, as that is the only time
 * there should be queued events.
 */
const clearEvents = () => {
    eventDataQueue = [];
};

/**
 * Get the queued events. This queue should only have entries
 * when the processing is disabled.
 */
const getQueuedEvents = () => {
    // TODO - return a copy, because JS.
    return eventDataQueue;
};

module.exports = {
    clearEvents,
    getQueuedEvents,
    registerEventListener,
    startEventProcessing,
    stopEventProcessing,
    triggerEvent,
    unregisterListener,
};