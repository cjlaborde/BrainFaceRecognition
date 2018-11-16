import React, { Component } from 'react'
import Particles from 'react-particles-js'
import Navigation from './Components/Navigation/Navigation'
import Signin from './Components/Signin/Signin'
import Register from './Components/Register/Register'
import FaceRecognition from './Components/FaceRecognition/FaceRecognition'
import Logo from './Components/Logo/Logo'
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
import Rank from './Components/Rank/Rank'
import './App.css'
import 'tachyons'

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    },
    line_linked: {
      color: '#53c83a'
      }
    }
  }

 const initialState =  {
    input: '',
    imageUrl: '',
    box: {},
    // keeps track of where we are on page
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
  } 
class App extends Component {
  constructor() {
    super()
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage')
    // since it's going to return a string, makes sure is read as a Number
    const width = Number(image.width)
    const height = Number(image.height)
    /** 
     *Return Object that fill up the box: {}, state
     *figure out where the 4th dots are around the face then wrap it on a border
     *clarifaiFace.left_col has left col property you can check in console
     *left column the % of the width
     *
     *      topRow: clarifaiFace.top_row * height, to calculate % position in picture
     *     Vid6FaceDetectionBox
     **/
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height) 
    }
  }

  displayFaceBox = (box) => {
    // console.log(box)
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  /**
   * When we click button
   * Calculate face Location
   * With the response of calculateFaceLocation
   * calculateFaceLocation goint to run function
   * that is going to return an object
   * This object needed by the displayFaceBox
   * 
   * .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
   * 
   * this.calculateFaceLocation(response))) takes a response
   * Then calculateFaceLocation(response gets a response
   * that return an object that is going into display faceBOX
   * 
   */

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    // Moved the function to server to have the api key on backend and not on front end
    fetch('https://secret-mesa-16110.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())      // console.log(response.outputs[0].data.regions[0].region_info.bounding_box)
      .then(response => {
        if (response) {
          fetch('https://secret-mesa-16110.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id 
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {
                entries: count}))
              })
              .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route}) 
  }

  render() {
   const { isSignedIn, imageUrl, route, box } = this.state
    return (
      <div className="App">
        <Particles className='particles'
        params={particlesOptions}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
     { route === 'home' 
     ? <div>
     <Logo />
     <Rank name={this.state.user.name} entries={this.state.user.entries} />
     <ImageLinkForm 
       onInputChange={this.onInputChange} 
       onButtonSubmit={this.onButtonSubmit} 
     /> 
     <FaceRecognition box={box} imageUrl={imageUrl} />
   </div>
     : (
       route === 'signin' 
       ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
       : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
      )
    }
    </div>
    );
  }
}

export default App;