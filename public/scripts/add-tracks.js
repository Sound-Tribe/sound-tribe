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
        document
          .getElementById("tracks")
          .innerHTML += `<p class="track-num">Num</p><audio controls src="${result.info.secure_url}"></audio><p>End</p>`;
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