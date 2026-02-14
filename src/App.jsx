import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Nav from './components/Navbar.jsx'
import CollegeBanner from "./components/CollegeBanner";
import FeatureSection from "./components/FeatureSection";


function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Nav></Nav>
        <CollegeBanner></CollegeBanner>
        <FeatureSection />
    </>
  )
}

export default App
