import Pusher from 'pusher-js';
import {
  PUSHER_APP_KEY,
  PUSHER_APP_CLUSTER,
  PUSHER_WS_HOST,
  PUSHER_APP_PORT,
  PUSHER_APP_SCHEME,
} from '../config';

// Enable Pusher logging
Pusher.logToConsole = true;

const pusher = new Pusher(PUSHER_APP_KEY, {
  cluster: PUSHER_APP_CLUSTER,
  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
  wsHost: PUSHER_WS_HOST,
  wsPort: Number(PUSHER_APP_PORT),
  wssPort: Number(PUSHER_APP_PORT),
  wsPath: '',
  channelAuthorization: {
    endpoint: '/api/pusher/auth',
    transport: 'ajax',
    headers: {}
  }
});

// Add connection event handlers
pusher.connection.bind('connecting', () => {
  console.log('Connecting to Pusher...', {
    key: PUSHER_APP_KEY,
    cluster: PUSHER_APP_CLUSTER,
    wsHost: PUSHER_WS_HOST
  });
});

pusher.connection.bind('connected', () => {
  console.log('Connected to Pusher!');
});

pusher.connection.bind('failed', () => {
  console.error('Failed to connect to Pusher!');
});

pusher.connection.bind('disconnected', () => {
  console.log('Disconnected from Pusher');
});

pusher.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err);
});

// Handle browser close/refresh
const handleBeforeUnload = () => {
  console.log('Browser closing, cleaning up Pusher connection...');
  // Disconnect from all channels
  pusher.disconnect();
};

// Add event listener for browser close/refresh
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', handleBeforeUnload);
}

export const subscribeToChannel = (channelName: string, events: Record<string, (data: any) => void>) => {
  console.log(`Subscribing to channel: ${channelName}`);
  const channel = pusher.subscribe(channelName);
  
  // Debug all incoming events on this channel
  channel.bind_global((eventName: string, data: any) => {
    console.log(`Received event '${eventName}' on channel '${channelName}':`, data);
  });

  channel.bind('pusher:subscription_succeeded', () => {
    console.log(`Successfully subscribed to channel: ${channelName}`);
  });

  channel.bind('pusher:subscription_error', (error: any) => {
    console.error(`Error subscribing to channel ${channelName}:`, error);
  });

  Object.entries(events).forEach(([event, callback]) => {
    const fullEventName = event;
    console.log(`Binding to event: ${fullEventName} on channel: ${channelName}`);
    channel.bind(fullEventName, (data: any) => {
      console.log(`Received ${fullEventName}:`, data);
      callback(data);
    });
  });

  return () => {
    console.log(`Unsubscribing from channel: ${channelName}`);
    Object.keys(events).forEach(event => {
      channel.unbind(event);
    });
    pusher.unsubscribe(channelName);
  };
};

export const subscribeToPrivateChannel = (channelName: string, events: Record<string, (data: any) => void>) => {
  const channel = pusher.subscribe(`private-${channelName}`);
  
  Object.entries(events).forEach(([event, callback]) => {
    channel.bind(event, callback);
  });

  return () => {
    Object.keys(events).forEach(event => {
      channel.unbind(event);
    });
    pusher.unsubscribe(`private-${channelName}`);
  };
};

// Cleanup function to remove event listener
export const cleanup = () => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  }
  pusher.disconnect();
};

export default pusher; 