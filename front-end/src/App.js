// src/App.js

import React from 'react';
import './App.css'; // Assuming you have additional global styles here

export default function App() {
  return (
    <div className='bg-black w-screen h-screen grid grid-rows-3 grid-flow-col gap-3 grid grid-columns-3 grid_flow_col gap-3'>
      <div className='bg-red-500 row-span-2 flex items-center place-content-center'> SAT Questions
      </div>
      <div className='bg-blue-500 flex items-center place-content-center'>Answers</div>
      <div className='bg-green-500 flex items-center place-content-center'>Mosters 1</div>
      <div className='bg-yellow-500 flex items-center place-content-center'> Helath bar of mosnter one</div>
      <div className='bg-pink-500 col-span-2 flex items-center place-content-center'>Menu</div>
      <div className='bg-purple-500 flex items-center place-content-center'>Moster 2</div>
      <div className='bg-indigo-500 flex items-center place-content-center'>Helath bar mosnter 2</div>
    </div>
  )
}

