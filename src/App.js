import React, { Component } from 'react';
import './App.css';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import Rank from './components/rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import SignIn from './components/signin/SignIn';
import Register from './components/register/Register';

const app = new Clarifai.App({
    apiKey: 'a19a14c0f1294ac6890950dd408e96a7'
});

const particleOptions = {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        line_linked: {
            shadow: {
                enable: true,
                color: "#3A9D1",
                blur: 20
            }
        }
    }
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
    }
  }

  calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;

      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);

      return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height)
      }
  }

  displayFaceBox = (box) => {
      console.log('BOX:',  box);
      this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input })
      app.models.predict(
                  Clarifai.FACE_DETECT_MODEL, 
                  this.state.input)
          .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
          .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
      if (route === 'signout') {
          this.setState({isSignedIn: false})
      } else if (route === 'home') {
          this.setState({isSignedIn: true})
      }

      this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
          <Particles 
              className='particles'
              params={particleOptions}
          />

        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        { this.state.route === 'home' 
            ? <div> 
                  <Logo />
                  <Rank />
                  <ImageLinkForm onInputChange={this.onInputChange} 
                                 onButtonSubmit={this.onButtonSubmit}
                  />

                  <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
              </div>
            : (
                this.state.route === 'signin' || this.state.route === 'signout'
                ? <SignIn onRouteChange={this.onRouteChange}/>
                : <Register onRouteChange={this.onRouteChange}/>
            )  
        }
      </div>
    );
  }
}

export default App;
