const cloudName = 'dxackd82m'; 
const uploadPreset = 'sound-tribe';

// Local uploads
document.getElementById('local-uploads-form').style = 'display: none;';
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
        // console.log("Done! Here is the upload info: ", result.info);
        document
          .getElementById("tracks")
          .innerHTML += `<input style="display: none;" type="text" name="tracks" value="${result.info.secure_url}">
                          <label for="trackNames">Track name:</label>
                          <input type="text" name="trackNames" value="${result.info.original_filename}">
                          <audio controls src="${result.info.secure_url}"></audio>`;
      }
    }
  );
  document.getElementById("upload_widget").addEventListener(
    "click",
    function () {
      document.getElementById('local-uploads-form').style = 'display: block;';
      document.getElementById('spotify-search-form').style = 'display: none;';
      myWidget.open();
    },
    false
  );

  // Spotify Uploads
  document.getElementById('spotify-search-form').style = 'display: none;';
  document.getElementById('add-spotify-btn').addEventListener("click", function () {
    document.getElementById('local-uploads-form').style = 'display: none;';
    document.getElementById('spotify-search-form').style = 'display: block;';
  })