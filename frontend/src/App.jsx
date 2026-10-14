import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import DataEntry from './pages/DataEntry/DataEntry';
import LiveMatch from './pages/LiveMatch/LiveMatch';
import AllDataSaved from './pages/AllDataSaved/AllDataSaved';
import EditSavedData from './pages/EditSavedData/EditSavedData';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="data-entry" element={<DataEntry />} />
          <Route path="live-match" element={<LiveMatch />} />
          <Route path="all-data" element={<AllDataSaved />} />
          <Route path="edit-data/:id" element={<EditSavedData />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
