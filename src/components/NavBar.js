import React from "react";
import './NavBar.css';
const NavBar = ()=>{
    return (
        <div id="head">
            <div id="nav">
                <div id="logo"></div>
                <a class="navItem" href="#home"><i class="material-icons">home</i> Home</a>
                <a class="navItem" href="https://hospital-locator-maps.herokuapp.com/"><i class="material-icons">public</i> Maps</a>
                <a class="navItem" href="#service"><i class="material-icons">medical_services</i> Services</a>
                <a class="navItem" href="#about"> <i class="material-icons">groups</i> About Us</a>
            </div>
        </div>
    );
}
export default NavBar;