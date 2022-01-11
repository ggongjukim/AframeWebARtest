import OnirixSDK from "https://sdk.onirix.com/0.3.0/ox-sdk.esm.js";


let OX = new OnirixSDK("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk5MTgsInByb2plY3RJZCI6MjIyODQsInJvbGUiOjMsImlhdCI6MTY0MTg4MTQ2Mn0._-YkyA-y8wrltcs_-u5t_BVwOoGd4LzLQuXbiJ6SJiU");

let config = {
    mode: OnirixSDK.TrackingMode.Surface
}

OX.init(config).then(rendererCanvas => {
    // Onirix SDK has been initialized. Now it's time to set up a 3D renderer 
    // with any library (Three, Babylon ...) and subscribe to Onirix events.
}).catch(error => {
    // Check error name and display accordingly
});