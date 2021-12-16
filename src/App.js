import React, { Component } from "react";
import "./App.css";
import MapPreview from "./components/MapPreview";
import Homepage from "./components/Homepage";
import NavBar from "./components/NavBar";
// import neo4j from "neo4j-driver/lib/browser/neo4j-web";
// import axios from "axios";


class App extends Component {
  render()
  {
    return (
      <div>
        <NavBar/>
        <Homepage/>
        {/* <MapPreview/> */}
      </div>
    );
  }
}

export default App;