var clearEvents = require('danack-message').clearEvents;
var getQueuedEvents = require('danack-message').getQueuedEvents;
var registerEventListener = require('danack-message').registerEventListener;
var startEventProcessing = require('danack-message').startEventProcessing;
var stopEventProcessing = require('danack-message').stopEventProcessing;
var triggerEvent = require('danack-message').triggerEvent;
var unregisterListener = require('danack-message').unregisterListener;

const event_foo = 'foo';
const event_unknown = 'unknown';

describe('widgety', function () {
  it('event queue management', function () {
    stopEventProcessing();
    clearEvents();
    expect(getQueuedEvents()).toHaveLength(0);
    triggerEvent('foo', {});
    expect(getQueuedEvents()).toHaveLength(1);
    clearEvents();
    expect(getQueuedEvents()).toHaveLength(0);
  });

  it('dispatches okay', function () {
    const id = '12345';

    clearEvents();
    startEventProcessing();
    triggerEvent(event_foo, {});

    var calledParams = [];
    const fn = (params) => {
      calledParams.push(params);
    };

    const values = { zok: true, fot: false, pik: 3 };

    // Check an unknown event doesn't reach our callback
    triggerEvent(event_unknown, values);
    expect(calledParams).toHaveLength(0);

    // Check foo event does reach our callback.
    registerEventListener(event_foo, id, fn);
    triggerEvent(event_foo, values);
    expect(calledParams).toHaveLength(1);
    expect(calledParams[0]).toEqual(values);
  });

  it('stopping starting processing works', function () {
    const id = 'abcdef';

    clearEvents();

    const values = { zok: true, fot: false, pik: 3 };

    var calledParams = [];
    const fn = (params) => {
      calledParams.push(params);
    };

    stopEventProcessing();

    // Check foo event does reach our callback.
    registerEventListener(event_foo, id, fn);

    // Check an event doesn't reach our callback when processing
    // isn't running
    triggerEvent(event_foo, values);
    expect(calledParams).toHaveLength(0);

    // Start event processing
    startEventProcessing();
    // check the event was received.
    expect(calledParams).toHaveLength(1);

    // Trigger another event
    triggerEvent(event_foo, values);
    // Check the callback was called
    expect(calledParams).toHaveLength(2);

    stopEventProcessing();

    // Trigger another event
    triggerEvent(event_foo, values);
    // Check the callback was not called.
    expect(calledParams).toHaveLength(2);
  });


  // TODO test debug timeout.

});
