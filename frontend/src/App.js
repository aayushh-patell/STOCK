import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import { Box } from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import { ChakraProvider } from '@chakra-ui/react'

function App() {
    const [trades, setTrades] = useState([]);
  
    useEffect(() => {
      fetch(`${process.env.REACT_APP_API_URL}/api/trades`)
        .then(response => response.json())
        .then(data => setTrades(data.trades));
    }, []);
  
    const data = {
      labels: trades.map(trade => trade.date),
      datasets: [{
        label: 'Stock Trades',
        data: trades.map(trade => trade.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  
    return (
      <ChakraProvider>
        <Box p={4}>
          <Bar data={data} />
        </Box>
      </ChakraProvider>
    );
}
  
export default App;