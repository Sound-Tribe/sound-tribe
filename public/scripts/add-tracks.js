// require('dotenv').config();
// const cloudinary = require('cloudinary').v2;

const cloudName = 'dxackd82m'; 
const uploadPreset = 'sound-tribe';

const myWidget = cloudinary.createUploadWidget(
    {
      cloudName: cloudName,
      uploadPreset: uploadPreset,
      sources: [
        "local",
        "url",
        "camera"
        ],
      multiple: true,
      theme: "office", 
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        console.log("Done! Here is the upload info: ", result.info);
        // console.log(result.info)
        document
          .getElementById("tracks")
          .innerHTML += `<p class="track-num">Num</p><img src="${result.info.secure_url}" alt="">`
      }
    }
  );
  
  document.getElementById("upload_widget").addEventListener(
    "click",
    function () {
      myWidget.open();
    },
    false
  );