import React, {useEffect, useMemo, useState} from 'react';
import { Circle, GeoJSON, MapContainer, Polyline, Popup, TileLayer, ZoomControl} from 'react-leaflet';
import { Button, Form, InputGroup } from 'react-bootstrap';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faX } from '@fortawesome/free-solid-svg-icons'
import { useMapHook } from '../../context/map-provider';
import Profile from '../Profile';
import 'leaflet/dist/leaflet.css';
import './index.css';


const center = [36.1716, -115.1391];

export default function Map() {
  const {tracking, uid, setEntity, setUid} = useMapHook();

  const [aircraft, setAircraft] = useState([]);
  const [airports, setAirports] = useState([]);
  const [trackMap, setTrackMap] = useState({});
  const [showLayers, setShowLayers] = useState(false);
  const [showAircraft, setShowAircraft] = useState(true);
  const [showAirports, setShowAirports] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Axios.get(`http://localhost:8000/airports`).then(res => {
      setAirports(res.data);
    });
  }, []);

  useEffect(() => {
    console.log("Connecting to websocket");
    const ws = new WebSocket("ws://localhost:8000/redis/rumble");

    ws.onopen = () => {
      console.log("WebSocket connected");
      //ws.send("Hello from client!");
    };

    ws.onmessage = (event) => {
      try {
        const plot = JSON.parse(event.data);
        const latlon = [plot.properties.lat, plot.properties.lon];
        if("icao" in plot.properties) {
          setAircraft((aircraftData) => ({...aircraftData, [plot.properties.icao]: plot}));
          setTrackMap((trackData) => (
            {
              ...trackData, 
              [plot.properties.icao]: plot.properties.icao in trackData ? [...trackData[plot.properties.icao], latlon] : [latlon]
            }
          ));
        }
      } catch (err) {
        console.log(err);
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", JSON.parse(event.data));
    };
  }, []);

  const plotHandlers = useMemo(
    () => ({
      click(e) {
        setUid(e.target.options.data.properties.icao);
        setEntity(e.target.options.data.properties);
      },
    }),
    [],
  );

  const airportHandlers = useMemo(
    () => ({
      click(e) {
        setUid(e.target.options.data.icao);
        setEntity(e.target.options.data);
      },
    }),
    [],
  );

  return (
    <div className="map-view">
      {uid &&
        <Profile /> 
      }
      <div className="map-container" style={{width: uid ? "calc(100vw - 300px)" : "100%"}}>
      <div className="search-pane">
          <InputGroup className="mb-3">
            <Form.Control type="text" name="search" placeholder="search" onChange={(e) => setSearch(e.target.value)} value={search}/>
            <InputGroup.Text onClick={() => setSearch('')}>
              <FontAwesomeIcon icon={faX} />
            </InputGroup.Text>
          </InputGroup>
        </div>
        <div className="map-layers-menu">
          {showLayers &&
            <div id="layerMenu">
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Aircraft"
                checked={showAircraft}
                onClick={() => setShowAircraft(!showAircraft)}
              />
              <Form.Check
                type="switch"
                id="custom-switch"
                label="Airports"
                checked={showAirports}
                onClick={() => setShowAirports(!showAirports)}
              />
            </div>
          }
          <div id="layerButton">
            <Button onClick={() => setShowLayers(!showLayers)}>
              <FontAwesomeIcon icon={faBars} title="Layers" />
            </Button>
          </div>
        </div>
        
        <MapContainer center={center} zoom={10} zoomControl={false}>
          <TileLayer
            url='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'//"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=''
          />
          { uid && uid in trackMap &&
            <Polyline pathOptions={{ color: "#23c1af", weight: 1 }} positions={trackMap[uid]} />
          }
          <ZoomControl position='bottomright' />
          {showAircraft &&
            <GeoJSON data={Object.values(aircraft)}>
              {Object.values(aircraft).map((plot) => {
                return(
                  <Circle
                    data={plot}
                    center={[plot.properties.lat, plot.properties.lon]}
                    pathOptions={{ 
                      fillColor: plot.properties.icao.toLowerCase().includes(search.toLowerCase()) ? "#23c1af" : "#ccc",
                      color: plot.properties.icao.toLowerCase().includes(search.toLowerCase()) ? "#23c1af" : "#ccc",
                      fillOpacity: .5,
                    }}
                    radius={10}
                    eventHandlers={plotHandlers}
                    key={plot.properties.icao}
                  >
                    <Popup>{plot.properties.icao}</Popup>
                  </Circle>
                );
              })
              }
            </GeoJSON>
          }
          { showAirports &&
            <GeoJSON data={airports}>
              {airports.map((airport) => {
                return(
                  <Circle
                    data={airport}
                    center={[airport.lat, airport.lon]}
                    pathOptions={{ fillColor: "#000", fillOpacity: .5, color: "#000"}}
                    radius={120}
                    eventHandlers={airportHandlers}
                    key={airport.icao}
                  >
                    <Popup>{airport.name}</Popup>
                  </Circle>
                );
              })
              }
            </GeoJSON>
          }
        </MapContainer>
      </div>
    </div>
  )
}