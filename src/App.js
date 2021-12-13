import React, { Component } from "react";
import "./App.css";
import Map from "./components/Map";
import ReviewSummary from "./components/ReviewSummary";
import CategorySummary from "./components/CategorySummary";
import neo4j from "neo4j-driver/lib/browser/neo4j-web";
// import { Date } from "neo4j-driver/lib/v1/temporal-types";
// import fetch from 'node-fetch';
import axios from "axios";
//import Dialog from 'react-dialog'
//import moment from "moment";
//import Filter from './components/Filter'
//import Button from '@mui/material/Button';
//import { TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

class App extends Component {
  constructor(props) {
    super(props);
    let focusedInput = null;
	//const uri = 'neo4j+s://adffa398.databases.neo4j.io';
	//const user = 'neo4j';
	const password = 'QHAaLUK1ltd0zae-loZuSqvWQQ8GVZS3IMEBjZL3MM4';
    this.state = {
      focusedInput,
      businesses: [],
   
      reviews: [{ day: "2018-01-01", value: 10 }],
      categoryData: [],
      beds:0,
      type:"All",
      system:"All",
      selectedBusiness: false,
      location:"Delhi, India",
      mapCenter: {
        latitude: 19.0760,
        longitude: 72.8777,
        radius: 3.0,
        zoom: 10
      },
      catdic:[{cat:"Private",count:0,indexValue:"0"},{cat:"Public",count:0,indexValue:"1"}]
    };

    console.log("uri "+process.env.REACT_APP_NEO4J_URI);
    this.driver = neo4j.driver(
      // 'http://localhost:7474',
      // 'bolt://localhost:7687',
	// 'https://adffa398.databases.neo4j.io',
	"bolt://adffa398.databases.neo4j.io",//neo4j+s://adffa398.databases.neo4j.io
      neo4j.auth.basic(
        'neo4j',
        password
      ),
      { encrypted: true }
    );
    this.fetchBusinesses();
    this.fetchCat();
    // this.fetchCategories();
  }

  /*onDatesChange = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      this.setState(
        {
          startDate,
          endDate
        },
        () => {
          this.fetchBusinesses();
          this.fetchCat();
          // this.fetchCategories();
        }
      );
    } else {
      this.setState({
        startDate,
        endDate
      });
    }
  };*/

  onFocusChange = focusedInput => this.setState({ focusedInput });
  handlesearch = async () =>{

    try {
      const response = await axios.get(`http://api.positionstack.com/v1/forward?access_key=c8b3951830ca3db0a04248b76e4a4956&query=${this.state.location}`);
      console.log("location = "+ JSON.stringify(response.data));
      this.setState(
        {
          mapCenter: {
            latitude: response.data.data[0].latitude || 19.0760,
            longitude: response.data.data[0].longitude || 72.8777,
            radius: 3.0,
            zoom: 14
          }
          
          },
          () => {
            this.fetchBusinesses();
            // this.fetchCat();
  
          }
      );
    } catch (error) {
      console.error(error);
    };

   

  };

  businessSelected = b => {
    this.setState({
      selectedBusiness: b
    });
  };

  mapSearchPointChange = viewport => {
    this.setState({
      mapCenter: {
        ...this.state.mapCenter,
        latitude: viewport.latitude,
        longitude: viewport.longitude,
        zoom: viewport.zoom
      }
    });
  };
  fetchCat = () => {
    const { mapCenter } = this.state;
    const session = this.driver.session();

    session
      .run(
        `MATCH (b:Hospital)<-[:HAS_CAT]-(c:HospitalCategory)
        WHERE distance(b.location, point({latitude: $lat, longitude: $lon})) < ($radius * 1000)
        WITH DISTINCT b
        WITH c.name AS cat, COUNT(b) AS num ORDER BY num DESC LIMIT 25
        RETURN COLLECT({id: cat, label: cat, value: toFloat(num)}) AS categoryData
    `,
        {
          lat: mapCenter.latitude,
          lon: mapCenter.longitude,
          radius: mapCenter.radius,
          // start: new Date(
          //   startDate.year(),
          //   startDate.month() + 1,
          //   startDate.date()
          // ),
          // end: new Date(endDate.year(), endDate.month() + 1, endDate.date())
        }
      )
      .then(result => {
        console.log(result);
        const categoryData = result.records[0].get("categoryData");
        this.setState({
          categoryData
        });
        session.close();
      })
      .catch(e => {
        console.log(e);
        session.close();
      });
  };
  fetchCategories = () => {
    const { mapCenter } = this.state;
    const session = this.driver.session();

    session
      .run(
    //     `MATCH (b:Business)<-[:REVIEWS]-(r:Review)
    //     WHERE $start <= r.date <= $end AND distance(b.location, point({latitude: $lat, longitude: $lon})) < ($radius * 1000)
    //     WITH DISTINCT b
    //     OPTIONAL MATCH (b)-[:IN_CATEGORY]->(c:Category)
    //     WITH c.name AS cat, COUNT(b) AS num ORDER BY num DESC LIMIT 25
    //     RETURN COLLECT({id: cat, label: cat, value: toFloat(num)}) AS categoryData
    // `
    `MATCH (b:Hospital)
        WHERE distance(point({latitude:  b.latitude, longitude: b.longitude}), point({latitude: $lat, longitude: $lon})) < ($radius * 1000)
        WITH DISTINCT b
        WITH COUNT(b) AS num ORDER BY num DESC LIMIT 25
        RETURN COLLECT({id: b.id, label: b.name, value: toFloat(num)}) AS categoryData
    `,
        {
          lat: mapCenter.latitude,
          lon: mapCenter.longitude,
          radius: mapCenter.radius,
          // start: new Date(
          //   startDate.year(),
          //   startDate.month() + 1,
          //   startDate.date()
          // ),
          // end: new Date(endDate.year(), endDate.month() + 1, endDate.date())
        }
      )
      .then(result => {
        console.log(result);
        const categoryData = result.records[0].get("categoryData");
        this.setState({
          categoryData
        });
        session.close();
      })
      .catch(e => {
        console.log(e);
        session.close();
      });
  };

  fetchBusinesses = () => {
    const { mapCenter } = this.state;
    const session = this.driver.session();
    console.log("fetchbuisness caleed ; "+  JSON.stringify(mapCenter));
    session
      .run(
        // `
        // MATCH (b:Business)<-[:REVIEWS]-(r:Review)
        // WHERE $start <= r.date <= $end AND distance(b.location, point({latitude: $lat, longitude: $lon})) < ( $radius * 1000)
        // OPTIONAL MATCH (b)-[:IN_CATEGORY]->(c:Category)
        // WITH r,b, COLLECT(c.name) AS categories
        // WITH COLLECT(DISTINCT b {.*, categories}) AS businesses, COLLECT(DISTINCT r) AS reviews
        // UNWIND reviews AS r
        // WITH businesses, r.stars AS stars, COUNT(r) AS num ORDER BY stars
        // WITH businesses, COLLECT({stars: toString(stars), count:toFloat(num)}) AS starsData
        // RETURN businesses, starsData`
        // `MATCH (b:Hospital)
        // WHERE distance(b.location, point({latitude: $lat, longitude: $lon})) < ( $radius * 1000)
        // WITH COLLECT(DISTINCT b ) AS businesses
        // RETURN businesses`
        `MATCH (b:Hospital)
        WHERE b.latitude IS NOT NULL AND distance(point({latitude:  b.latitude, longitude: b.longitude}), point({latitude: $lat, longitude: $lon})) < ( $radius * 1000)
        WITH COLLECT( b {.*}) AS businesses
        RETURN businesses
        `,
        // `MATCH  (h:Hospital) WITH COLLECT( h {.*}) as businesses RETURN businesses`,
        {
          lat: mapCenter.latitude,
          lon: mapCenter.longitude,
          radius: mapCenter.radius,
          // start: new Date(
          //   startDate.year(),
          //   startDate.month() + 1,
          //   startDate.date()
          // ),
          // end: new Date(endDate.year(), endDate.month() + 1, endDate.date())
        }
      )
      .then(result => {
        console.log('result;calted '+JSON.stringify(result));
        const record = result.records[0];
        const businesses = record.get("businesses");
        // const starsData = record.get("starsData");
        console.log('business '+Object.values(businesses));
        
        this.setState({
          businesses,
          // starsData
        });
        this.state.catdic[0].count = 0;
        this.state.catdic[1].count = 0;
      this.state.businesses.map((val)=>{
        console.log("pahra akh meroi");
        if(val.category == "Private") this.state.catdic[0].count = this.state.catdic[0].count+1;
        else this.state.catdic[1].count = this.state.catdic[1].count+1;
        // return {key:index, value:val*val};
      }); 
    console.log("category dic : "+JSON.stringify(this.state.catdic));
        session.close();
      })
      .catch(e => {
        // TODO: handle errors.
        console.log(e);
        session.close();
      });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.state.mapCenter.latitude !== prevState.mapCenter.latitude ||
      this.state.mapCenter.longitude !== prevState.mapCenter.longitude
    ) {
      this.fetchBusinesses();
      this.fetchCat();
      // this.fetchCategories();
    }
    if (
      this.state.selectedBusiness &&
      (!prevState.selectedBusiness ||
        this.state.selectedBusiness.id !== prevState.selectedBusiness.id ||
        false ||
        false)
    ) {
    }
  };

  handleSubmit = () => {};

  handlereset = () => {
    this.setState(
      {
        beds:0,
        type:"All",
        system:"All",

        mapCenter: {
          latitude: 19.0760,
          longitude: 72.8777,
          radius: 3.0,
          zoom: 14
        },

        },
        () => {
          this.fetchBusinesses();
          this.fetchCat();

        }
    );
  };

  radiusChange = e => {
    this.setState(
      {
        mapCenter: {
          ...this.state.mapCenter,
          radius: Number(e.target.value)
        }
      },
      () => {
        this.fetchBusinesses();
        this.fetchCat();
        // this.fetchCategories();
      }
    );
  };

  bedsChange = e => {
    this.setState(
      {
        beds : Number(e.target.value)
        
      },
      () => {
        this.fetchBusinesses();
        this.fetchCat();
        // this.fetchCategories();
      }
    );
  };

  typeChange = e => {
    this.setState(
      {
        type : e.target.value
        
      },
      () => {
        this.fetchBusinesses();
        this.fetchCat();
        // this.fetchCategories();
      }
    );
  };

  systemChange = e => {
    this.setState(
      {
        system : e.target.value
        
      },
      () => {
        this.fetchBusinesses();
        this.fetchCat();
        // this.fetchCategories();
      }
    );
  };

  render() {

    return (
      <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
        <div id="app-maparea">
          <Map
            mapSearchPointChange={this.mapSearchPointChange}
            mapCenter={this.state.mapCenter}
            businesses={this.state.businesses}
            businessSelected={this.businessSelected}
            selectedBusiness={this.state.selectedBusiness}
          />
        </div>

     
        <div className="rightdiv"> 
        <div className="topbox">

          <div className="searchBox">
            <input type="string" name="location" className="inputSearch" placeholder="Enter Location" onChange={(e)=>{this.state.location = e.target.value}} ></input>
            <button onClick={this.handlesearch} className="searchButton">
            <i class="fa fa-search"></i>
            </button>
          </div>

          <div className="search">
          <div>
            <h5 className="inputhead">Query Radius in Km</h5>
            <input
              type="number"
              id="radius-value"
              className="input"
              min="0.1"
              max="1000.0"
              step="0.1"
              value={this.state.mapCenter.radius}
              onChange={this.radiusChange}
            />
              </div>

            <div>
            <h5 className="inputhead">Beds Count</h5>
            <input
              type="number"
              id="beds-value"
              className="input"
              min="0"
              max="10000"
              step="5"
              value={this.state.beds}
              onChange={this.bedsChange}
            />
            </div>

          </div>
          
          <div className="search">
          <div>
            <h5 className="inputhead">Type of Hospital</h5>
            <select value={this.state.type} onChange={this.typeChange} className="input" name="type" id="type">
              <option value="All">All</option>
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
            </div>

            <div>
            <h5 className="inputhead">System Of Medicine</h5>
            <select value={this.state.system} onChange={this.systemChange} className="input" name="system" id="system">
              <option value="All">All</option>
              <option value="Allopathic">Allopathic</option>
              <option value="Ayush/Ayurvedic">Ayush / Ayurvedic</option>
            </select>
            </div>
          </div>

          {/*<div className="search">
            <div>
              <h5 className="inputhead">Latitude</h5>
              <input
                type="number"
                step="any"
                id="coordinates-lat"
                className="input"
                placeholder="Latitude"
                value={this.state.mapCenter.latitude}
                onChange={()=>(true)}
              />
            </div>
              

              
                <div>
                  <h5 className="inputhead">Longitude</h5>
                  <input
                    type="number"
                    step="any"
                    id="coordinates-lng"
                    className="input"
                    placeholder="Longitude"
                    value={this.state.mapCenter.longitude}
                    onChange={()=>true}
                  />
                </div>
              </div>*/}

              <button onClick={this.handlereset} className="reset">
                Reset
              </button>
              
            </div>

              <div className="list">
                {console.log(this.state.businesses)}
                    {
                      !this.state.businesses.length ? <h1>No hospitals</h1> :(
                        <div>
                        <h3 className="showing">Showing {this.state.businesses.length} Hospitals</h3>
                        
                      {this.state.businesses.map((hospital)=>(
                      
                        <div className="namebox">
                          <h3 className="hospitalname">{hospital.name}</h3>
                          <h5 className="hospitaladdress">{hospital.address}</h5>
                          <h5 className="hospitalinfo">{hospital.category}  &#9679;  {hospital.systemofmedicine} &#9679; {hospital.no_beds} Beds</h5>
                        </div>
                      
                    ))
                      }
                    </div>)
                    }
              </div>
          </div>  
      </div>
    );
  }
}

export default App;
