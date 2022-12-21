import './App.css'
import Navbar from './components/Navbar'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dash from './pages/Dash.interview'
import Session from './pages/Session'
import ErrorRoute from './pages/Error.route'

function App () {
  return (
    <div className='App'>
      <Navbar content={''} />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/interview-session' element={<Session />} />
          <Route path='/interview-dash' element={<Dash />} />
          <Route path='*' element={<ErrorRoute />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
