import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Public from './Public'
import Admin from './Admin'
import './index.css'
createRoot(document.getElementById('root')).render(<BrowserRouter><Routes><Route path="/" element={<Public/>}/><Route path="/admin" element={<Admin/>}/></Routes></BrowserRouter>)
