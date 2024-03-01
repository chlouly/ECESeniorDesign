// src/App.js

import React from 'react';
import './App.css'; // Assuming you have additional global styles here

export default function App() {
  return (
    <div className='bg-black w-screen h-screen grid grid-rows-3 grid-flow-col grid grid-cols-3 grid_flow_col gap-2'>
      <div className='bg-red-500 row-span-2 flex items-center place-content-center'> SAT Questions</div>
      <div className='bg-blue-500 flex items-center place-content-center'>Answers</div>
      <div className="flex items-center justify-center">
        <a href="#">
          <div className="w-full h-full">
            <img className="rounded-lg w-full h-full object-cover" src={require('./baby_yoda.png')} alt="image description" />
          </div>
        </a>
      </div>
      <div className="flex items-center justify-center">
        <a href="#">
          <div className="w-full h-full">
            <h1 className="text-3xl font-bold text-white">Health bar (baby_yoda)</h1>
            <img className="rounded-lg w-full h-full object-cover" src={require('./health.jpg')} alt="image description" />
          </div>
        </a>
      </div>
      <div className="flex items-center justify-center">
        <a href="#">
          <div className="w-full h-full">
            <img className="rounded-lg w-sceen h-full object-cover" src={require('./Menu.png')} alt="image description" />
          </div>
        </a>
      </div>
      <div className="flex items-center justify-center">
        <a href="#">
          <div className="w-full h-full">
            <img className="rounded-lg w-full h-full object-cover" src={require('./et-feat.jpg')} alt="image description" />
          </div>
        </a>
      </div>
      <div className="flex items-center justify-center">
        <a href="#">
          <div className="w-full h-full">
            <h1 className="text-3xl font-bold text-white">Health bar (ET)</h1>
            <img className="rounded-lg w-full h-full object-cover" src={require('./health.jpg')} alt="image description" />
          </div>
        </a>
      </div>
    </div>
  )
}


