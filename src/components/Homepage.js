import React, { Component } from "react";
import "./Homepage.css";
class App extends Component {
  
    render() {
      return (
        <div>
            {/* <NavBar/> */}
            <section id="home">
              <div id="page-title"> Find Hospitals Near You. Instantly. </div>
              <div id="page-subtitle">Data of Over 10000 hospitals available across India.</div>
              <div id="map">
                <a href="/map">Find Hospitals <i class="material-icons">double_arrow</i></a>
              </div>
              <div></div>
            </section>
            <section id="service">
              <div id="service-page">Our Services</div>
              <div id="service-page-sub">User-Friendly Hospital Locator Website</div>
              <div id="flex">
              <div class="cmp">
                <div class="iconpic" id="p1" ></div>
                <div class="service-title">Smooth Search</div>
                <div class="service-subtitle">Hospitals can be searched by entering location or choosing on the map. </div>
              </div>
              <div class="cmp">
                <div class="iconpic" id="p2" ></div>
                <div class="service-title">Large Area</div>
                <div class="service-subtitle">User can decide the radius of area to be searched for hospitals.</div>
              </div>
              <div class="cmp">
                <div class="iconpic" id="p3"></div>
                <div class="service-title">Medical Services</div>
                <div class="service-subtitle">User can choose the medical services, hospital types and check number of beds. </div>
              </div>
              </div>
            </section>
            <section id="about">
              <div id="about-title">About Us</div>
              <div id="container">
                <div class="card">
                  <div class="face"><i class="material-icons">person</i></div>
                  <div class="details">
                    <div class="name">Mohak Chandani</div>
                    <div class="id">191080016</div>
                    <div class="desc">Third Year B.Tech(IT) Engineer</div>
                    <div class="desc">Front End Web Developer</div>
                  </div>
                </div>
                <div class="card">
                  <div class="face"><i class="material-icons">person</i></div>
                  <div class="details">
                    <div class="name">Chahat Bhagele</div>
                    <div class="id">191080008</div>
                    <div class="desc">Third Year B.Tech(IT) Engineer</div>
                    <div class="desc">Java & Android Developer</div>
                  </div>
                </div>
                <div class="card">
                  <div class="face"><i class="material-icons">person</i></div>
                  <div class="details">
                    <div class="name">Vinayak Bodke</div>
                    <div class="id">191080015</div>
                    <div class="desc">Third Year B.Tech(IT) Engineer</div>
                    <div class="desc">Back End Web Developer</div>
                  </div>
                </div>
              </div>
              <div id="social">
                <div class="acc"><a href="#"><i class="fa fa-facebook-official" aria-hidden="true"></i></a></div>
                <div class="acc"><a href="#"><i class="fa fa-instagram" aria-hidden="true"></i></a></div>
                <div class="acc"><a href="#"><i class="fa fa-youtube-play" aria-hidden="true"></i></a></div>
                <div class="acc"><a href="#"><i class="fa fa-linkedin-square" aria-hidden="true"></i></a></div>
                <div class="acc"><a href="#"><i class="fa fa-twitter" aria-hidden="true"></i></a></div>
              </div>
            </section>
          </div>
      );
    }
  }
  
  export default App;
  