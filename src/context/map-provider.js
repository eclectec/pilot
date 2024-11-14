import React, { createContext, useReducer, useContext, useState } from "react";

// Define initial state
const initialState = { 
  uid: "billy", 
  tracking: [] 
};

// Create context
const MapContext = createContext();

// Provider with reducer
export const MapProvider = ({ children }) => {
  const [entity, setEnt] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [uid, setId] = useState(null);

  const addToTracking = (id) => setTracking([...tracking, id]);
  const setEntity = (entity) => setEnt(entity);
  const setUid = (id) => setId(id);

  return (
    <MapContext.Provider value={{ entity, tracking, uid, addToTracking, setEntity, setUid }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapHook = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapHook must be used within a MapProvider");
  }
  return context;
};
