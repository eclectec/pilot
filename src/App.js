import {
  BrowserRouter as Router, Routes, Route
} from 'react-router-dom';
import Header from './components/Header';
import Map from './components/Map';
import { MapProvider } from './context/map-provider';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <MapProvider>
      <Header/>
      <Routes>
        <Route path="/" element={<Map />}>
          <Route path="*" element={<Map />} />
        </Route>
      </Routes>
      </MapProvider>
    </Router>
  );
}

export default App;
