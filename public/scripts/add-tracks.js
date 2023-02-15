const cloudName = 'dxackd82m'; 
const uploadPreset = 'sound-tribe';

isAudioFile = (url) => {
  const audioFileExtensions = [".mp3", ".wav", ".aac", ".flac", ".wma", ".m4a", ".ogg", ".amr"];
  const fileExtension = url.substr(url.lastIndexOf("."));
  return audioFileExtensions.includes(fileExtension);
}

// Local uploads
document.getElementById('local-uploads-form').style = 'display: none;';
document.getElementById("cloudinary-error").style = 'display: none;';
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
      styles: {
        palette: {
            window: "#FBFCFF",
            sourceBg: "#FBFCFF",
            windowBorder: "#3A4F41",
            tabIcon: "#7FB685",
            inactiveTabIcon: "#1B2D2A",
            menuIcons: "#1B2D2A",
            link: "#7FB685",
            action: "#7FB685",
            inProgress: "#1EA896",
            complete: "#7FB685",
            error: "#AF3800",
            textDark: "#000000",
            textLight: "#FFFFFF"
        },
        fonts: {
            default: null,
            "'Poppins', sans-serif": {
                url: "https://fonts.googleapis.com/css?family=Poppins",
                active: true
            }
        }
    } 
    },
    (error, result) => {
      if (!isAudioFile(result.info.path)) {
        document.getElementById("cloudinary-error").style = 'display: block;';
        document.getElementById("cloudinary-error").innerHTML = 'You uploaded an unsupported file type.';
        document.getElementById('local-uploads-form').style = 'display: none;';
      } else if (!error && result && result.event === "success") {
        // console.log("Done! Here is the upload info: ", result.info.path);
        document.getElementById("cloudinary-error").style = 'display: none;';
        document.getElementById('local-uploads-form').style = 'display: flex;';
        document
          .getElementById("tracks")
          .innerHTML += `<div class="track-card"><input style="display: none;" type="text" name="tracksForm" value="${result.info.secure_url}">
                          <label for="trackNamesForm">Track name:</label>
                          <input type="text" name="trackNamesForm" value="${result.info.original_filename}" required="true">
                          <audio controls src="${result.info.secure_url}"></audio></div>`;
      } else {
        document.getElementById("cloudinary-error").style = 'display: block;';
        document.getElementById("cloudinary-error").innerHTML = 'Something went wrong. Try again';
        document.getElementById('local-uploads-form').style = 'display: none;';
      }
    }
  );
  document.getElementById("upload_widget").addEventListener(
    "click",
    function () {
      document.getElementById('local-uploads-form').style = 'display: flex;';
      document.getElementById('spotify-search-form').style = 'display: none;';
      myWidget.open();
    },
    false
  );

  // Spotify Uploads
  document.getElementById('spotify-search-form').style = 'display: none;';
  document.getElementById('add-spotify-btn').addEventListener("click", function () {
    document.getElementById('local-uploads-form').style = 'display: none;';
    document.getElementById('spotify-search-form').style = 'display: flex;';
  })