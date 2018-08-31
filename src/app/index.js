import React from 'react';
import { render } from 'react-dom';
import FileBase64 from 'react-file-base64';
import styles from '../styles/index.css'


class App extends React.Component{

  constructor(props){
    super();
    this.state={
      isMediaURL:false,
      selectedOption: 'upload',
      files: [],
      numberOfFaces:0,
      responseInState: null,
      base64Variable: "",
      URL: "",
      faceRegionArray: [],
      boundingBoxArray: [],
      showCanvasFlag:false,
      loaded:true,
      imageAddress:'',
      noFacesFound: false,
    };
    this.handleOptionChange = this.handleOptionChange.bind(this);
  }

  //to handle radio button selections
  handleOptionChange(changeEvent){

    this.setState({
      selectedOption:changeEvent.target.value,
      isMediaURL: !this.state.isMediaURL,
      URL: "",
      base64Variable: "",
      faceRegionArray: [],
      boundingBoxArray: [],
      imageAddress: '',
      numberOfFaces:0
    });

    //disabling the 'FileBase64' button
    var nodes = document.getElementById("filebaseId").getElementsByTagName('*');
    for(var i = 0; i < nodes.length; i++){
      nodes[i].disabled = !this.state.isMediaURL;
    }
  }

  //triggered when user chooses a file
  getFiles(files){

    //removing previously created canvas from DOM
    if(document.getElementById('canvasid')!=null){
      document.body.removeChild(canvasid);
    }

    //using regex to filter out invalid file uploads such as pdfs, docxs
    var pattern1 = new RegExp("data:image/jpeg;base64,");
    var pattern2 = new RegExp("data:image/png;base64,");
    var pattern3 = new RegExp("data:image/img;base64,");
    var pattern4 = new RegExp("data:image/svg;base64,");
    var pattern5 = new RegExp("data:image/jpg;base64,");

    if(pattern1.test(files[0].base64)){
      var imageMedia = files[0].base64.replace('data:image/jpeg;base64,','');
      this.setState({
        files: files,
        base64Variable:imageMedia,
        faceRegionArray: [],
        boundingBoxArray: [],
        imageAddress:files[0].base64
      });
    }

    else if(pattern2.test(files[0].base64)){
      var imageMedia = files[0].base64.replace('data:image/png;base64,','');
      this.setState({
        files: files,
        base64Variable:imageMedia,
        faceRegionArray: [],
        boundingBoxArray: [],
        imageAddress:files[0].base64
      });
    }

    else if(pattern3.test(files[0].base64)){
      var imageMedia = files[0].base64.replace('data:image/img;base64,','');
      this.setState({
        files: files,
        base64Variable:imageMedia,
        faceRegionArray: [],
        boundingBoxArray: [],
        imageAddress:files[0].base64
      });
    }

    else if(pattern4.test(files[0].base64)){
      var imageMedia = files[0].base64.replace('data:image/svg;base64,','');
      this.setState({
        files: files,
        base64Variable:imageMedia,
        faceRegionArray: [],
        boundingBoxArray: [],
        imageAddress:files[0].base64
      });
    }

    else if(pattern5.test(files[0].base64)){
      var imageMedia = files[0].base64.replace('data:image/jpg;base64,','');
      this.setState({
        files: files,
        base64Variable:imageMedia,
        faceRegionArray: [],
        boundingBoxArray: [],
        imageAddress:files[0].base64
      });
    }

    else{
      window.alert("Please try again with an image of valid format!");
      this.setState({
        files:'',
        base64Variable:'',
        faceRegionArray: [],
        boundingBoxArray: [],
        imageAddress:'',
        numberOfFaces:0
      });
      return;
    }
  }

  //called when URL inputbox is being edited
  handleURLChange(event){

    if(document.getElementById('canvasid')!=null){
      document.body.removeChild(canvasid);
    }

    //using regex to only use images from select valid URLs
    var pattern1 = new RegExp("https://");
    var pattern2 = new RegExp("http://");

    if((pattern1.test(event.target.value)) || (pattern2.test(event.target.value)) || (event.target.value=="")){

      this.setState({
        URL: event.target.value,
        faceRegionArray: [],
        boundingBoxArray: [],
        showCanvasFlag:false,
        numberOfFaces:0,
        imageAddress:''
      });
    }

    else{
      window.alert("Please paste a link starting with - https:// or http://");
      return;
    }
  }

  //when user hits predict button
  predict = () => {

    //disable user interaction elements
    document.getElementById("radioid1").setAttribute("disabled","disabled");
    document.getElementById("radioid2").setAttribute("disabled","disabled");
    document.getElementById("buttonid").setAttribute("disabled","disabled");


    if(this.state.isMediaURL){
      document.getElementById("textInputId").setAttribute("disabled","disabled");
    }
    else {
      var element = document.getElementById("filebaseId");
      element .style.visibility = 'hidden';
    }

    this.setState({
      loaded:false
    });

    //decide the imageMedia to populate in the api call
    var imageMedia="";
    if(this.state.isMediaURL == false){
      imageMedia=  this.state.base64Variable;
    }
    else{imageMedia=  this.state.URL;}

    // Require the client
    const Clarifai = require('clarifai');

    // initialize with your api key
    const app = new Clarifai.App({
      apiKey: 'a12da306719d43f391258c3c375ee035'
    });

    app.models.predict('a403429f2ddf4b49b307e318f00e528b', imageMedia).then(
      function(response) {
        var numberOfFacesHolder=""
        var arrayRegion=response.outputs[0].data.regions

        //check if no faces are detected
        if (arrayRegion==undefined) {

          this.setState({
            numberOfFaces:0,
            boundingBoxArray:[],
            showCanvasFlag:true,
            loaded:true,
            noFacesFound: true,

          });
        }
        //check if response status is OK
        else if(response.status.code != "10000"){
          window.alert("We are sorry, something went wrong. Please try again!");
          this.setState({
            numberOfFaces:0,
            boundingBoxArray:[],
            loaded:true,
          });
        }

        else{
          //traversing through the response array to populate the faceRegionArray, boundingBoxArray and numberOfFaces
          response.outputs[0].data.regions.map((faceRegion)=>this.state.faceRegionArray.push(faceRegion));

          numberOfFacesHolder=response.outputs[0].data.regions.length

          for(var i=0; i< response.outputs[0].data.regions.length ; i++){
            this.state.boundingBoxArray.push(this.state.faceRegionArray[i].region_info.bounding_box);
          }

          this.setState({
            numberOfFaces:numberOfFacesHolder,
            boundingBoxArray: this.state.boundingBoxArray,
            showCanvasFlag:true,
            noFacesFound: false,
          });
        }
        //draw boxes around faces
        this.drawBoundingBoxes();
      }.bind(this)

      ,function(err) {
        console.error(err);
        window.alert("We are sorry, something went wrong. Please try again with a different URL!");

        this.setState({
          numberOfFaces:0,
          boundingBoxArray:[],
          loaded:true
        });

        //reactivate the user interaction elements
        document.getElementById("radioid1").removeAttribute("disabled");
        document.getElementById("radioid2").removeAttribute("disabled");
        document.getElementById("buttonid").removeAttribute("disabled");
        if(this.state.isMediaURL){
          document.getElementById("textInputId").removeAttribute("disabled");
        }
        else {
          var element = document.getElementById("filebaseId");
          element.style.visibility = 'visible';
        }

      }.bind(this)
    );
  }

  drawBoundingBoxes(){

    //create canvas and context to outline the faces identified by the model
    var canvas="";

    var domRect = document.getElementById('imageDisplay').getBoundingClientRect();

    canvas = document.createElement('canvas');
    canvas.setAttribute("id", "canvasid");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position='absolute';
    canvas.style.left=0;
    canvas.style.top=0;
    canvas.style.zIndex=100000;
    canvas.style.pointerEvents='none';
    document.body.appendChild(canvas);
    var context = canvas.getContext('2d');


    for(var i=0; i<this.state.boundingBoxArray.length;i++){
      //using the left_col, top_row, right_col, bottom_row values with additional placement modification to position the bounding box for each face
      var x = ((this.state.boundingBoxArray[i].left_col) * (domRect.width)) + (domRect.width) + 105;
      var y = ((this.state.boundingBoxArray[i].top_row) * (domRect.height))  + 160;
      var width = (this.state.boundingBoxArray[i].right_col - this.state.boundingBoxArray[i].left_col) * 500;
      var height = (this.state.boundingBoxArray[i].bottom_row - this.state.boundingBoxArray[i].top_row) * 500;

      //Draw rectangle
      context.rect(x, y, width, height);
      context.lineWidth = 3;
      context.strokeStyle = 'white';
      context.stroke();

      this.setState({
        loaded:true
      });
    }

    //reactivate the user interaction elements
    document.getElementById("radioid1").removeAttribute("disabled");
    document.getElementById("radioid2").removeAttribute("disabled");
    document.getElementById("buttonid").removeAttribute("disabled");
    if(this.state.isMediaURL){
      document.getElementById("textInputId").removeAttribute("disabled");
    }
    else {
      var element = document.getElementById("filebaseId");
      element.style.visibility = 'visible';
    }
  }


  render(){

    var Loader = require('react-loader');

    //display image based on the URL or base64 value present in state
    var imageDisplay= this.state.URL?
    <img src={this.state.URL} id= "imageDisplay" alt="" style={{width: 600, height: 500, position: 'absolute'}} /> :
      <img src={this.state.imageAddress} id= "imageDisplay" alt="" style={{width: 600, height: 500, position: 'absolute'}}/>

      //display appropriate form control based on selected media option
      var uploadOption = this.state.isMediaURL ?
      <div> <input id="textInputId" type="text" name="name" placeholder="Paste URL here" value={this.state.URL} onChange={(event) => this.handleURLChange(event)}/> </div>:
        <div id="filebaseId"> <FileBase64 multiple={ true } onDone={this.getFiles.bind(this)} /> </div> ;

          //only show submit button when image format has been filtered as valid and set in state
          var submitButton = (this.state.URL || this.state.base64Variable) ? <button id="buttonid" onClick={this.predict}>Predict</button> : null;


          return (
            <div>
              <h1 className="heading">Face Detection</h1>
              <div className="container">

                <Loader loaded={this.state.loaded}></Loader>

                <br/>

                <div className="row">
                  <div className="col-6" id="textDisplay">

                    <div className="upload">
                      <label>
                        <input id="radioid1" type="radio" value="upload" checked={this.state.selectedOption === 'upload'} onChange={(this.handleOptionChange.bind(this))}/>
                        {'  '} Upload Image
                      </label>
                      {this.state.isMediaURL ? <div id="filebaseId"> <FileBase64 multiple={true} onDone={this.getFiles.bind(this)} /> </div> : <div id="filebaseId"> <FileBase64 multiple={ true } onDone={this.getFiles.bind(this)} /> </div>}
                    </div>
                    <div className="url">
                      <label>
                        <input id="radioid2" type="radio" value="URL" checked={this.state.selectedOption === 'URL'} onChange={this.handleOptionChange.bind(this)}/>
                        {'  '} Paste URL
                      </label>
                      {this.state.isMediaURL ? <div> <input id="textInputId" type="text" name="name" placeholder="Paste URL here" value={this.state.URL} onChange={(event) => this.handleURLChange(event)}/> </div>:<div> <input id="textInputId" disabled type="text" name="name" placeholder="Paste URL here" value={this.state.URL} onChange={(event) => this.handleURLChange(event)}/> </div> }
                    </div>
                    <br/>
                    {submitButton}
                    <br/><br/>
                    {this.state.noFacesFound ? <h3>No Faces Detected</h3> : <h3>Faces Detected : {this.state.numberOfFaces} </h3>}

                  </div>

                  <div className="col-6" id="imageDisplay">
                    {imageDisplay}
                  </div>

                </div>
              </div>
            </div>
          );
        }
      }

      render(<App/>, window.document.getElementById("app"));
