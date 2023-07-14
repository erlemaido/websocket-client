import React, { useState, useEffect } from 'react';
import Stomp from 'stompjs';

const WebSocketForm = () => {
  const [bet, setBet] = useState('');
  const [number, setNumber] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/game');
    const client = Stomp.over(socket);
    client.debug = null;

    client.connect({}, () => {
      setStompClient(client);
      client.subscribe('/queue/errors', (message) => {
        console.log('Received error:', message.body);
        setResult(message.body);
      });
      client.subscribe('/topic/result', (message) => {
        console.log('Received message:', message.body);
        setResult(message.body);
      });


    });

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
      socket.close();
    };
  }, []);

  const handleBetChange = (event) => {
    const formattedBet = parseFloat(event.target.value).toFixed(2);
    setBet(formattedBet);
  };

  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  const handleSend = () => {
    const payload = {
      bet: parseFloat(bet).toFixed(2),
      number: parseInt(number),
    };
    stompClient.send('/app/play', {}, JSON.stringify(payload));
  };

  return (
      <div>
        <label>
          Bet:
          <input type="number" step="0.01" value={bet} onChange={handleBetChange} />
        </label>
        <br />
        <label>
          Number:
          <input type="number" value={number} onChange={handleNumberChange} />
        </label>
        <br />
        <button onClick={handleSend} disabled={!stompClient}>
          Play
        </button>
        <div>
          Result: {result}
        </div>
      </div>
  );
};

export default WebSocketForm;