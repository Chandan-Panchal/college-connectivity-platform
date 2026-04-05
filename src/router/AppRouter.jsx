import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";

import CampusNavigation from "../pages/CampusNavigation";

import Navbar from "../components/Navbar";

export default function AppRouter(){

  return(

    <BrowserRouter>

      <Navbar/>

      <Routes>

        <Route

          path="/"

          element={<Home/>}

        />

        <Route

          path="/campus"

          element={<CampusNavigation/>}

        />

      </Routes>

    </BrowserRouter>

  )

}