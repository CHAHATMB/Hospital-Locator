import React, { Component } from "react";
import "./App.css";
import Map from "./components/Map";
import ReviewSummary from "./components/ReviewSummary";
import CategorySummary from "./components/CategorySummary";
import neo4j from "neo4j-driver/lib/browser/neo4j-web";
// import { Date } from "neo4j-driver/lib/v1/temporal-types";
import moment from "moment";
import Filter from './components/Filter'

/*import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';*/

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
      starsData: [],
      reviews: [{ day: "2018-01-01", value: 10 }],
      categoryData: [],
      selectedBusiness: false,
      mapCenter: {
        latitude: 19.0760,
        longitude: 72.8777,
        radius: 3.0,
        zoom: 14
      }
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
        console.log('business '+JSON.stringify(businesses));
        
        this.setState({
          businesses,
          // starsData
        });
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
        mapCenter: {
          latitude: 19.0760,
          longitude: 72.8777,
          radius: 3.0,
          zoom: 14
        }
        
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


  render() {
    return (
      <div>
    
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
            {/*<select className="input" id="radius-suffix">
              <option value="km">km</option>
            </select>*/}
          

          <div className="Cordinates">
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
              </div>

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
                          <h5 className="hospitalinfo">{hospital.category}  &#9679;  {hospital.systemofmedicine}</h5>
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
