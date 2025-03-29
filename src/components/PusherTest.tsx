import { useEffect, useState } from 'react';
import { subscribeToChannel } from '../services/pusher';

interface TestEventData {
  message: string;
  timestamp: string;
}

export default function PusherTest() {
  const [messages, setMessages] = useState<TestEventData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  useEffect(() => {
    console.log('Subscribing to test-channel...');
    
    const unsubscribe = subscribeToChannel('test-channel', {
      'test-event': (data: TestEventData) => {
        console.log('Received test-event:', data);
        setMessages(prev => [...prev, data]);
      }
    });

    // Add connection status message
    setConnectionStatus('Subscribed to test-channel');
    console.log('Subscribed to test-channel');

    return () => {
      console.log('Unsubscribing from test-channel...');
      unsubscribe();
    };
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Pusher Test</h2>
      <div className="mb-4 text-sm text-gray-600">
        Status: {connectionStatus}
      </div>
      <div className="space-y-2">
        {messages.length === 0 ? (
          <div>
            <p className="text-gray-500 mb-2">No messages received yet. Try hitting the test endpoint:</p>
            <div className="bg-gray-100 p-3 rounded">
              <code className="text-sm">GET http://localhost:8000/api/test-event</code>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">Received Messages:</h3>
            {messages.map((msg, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded mb-2">
                <p className="text-gray-800">{msg.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Received at: {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 