module.exports = isAudioFile = (url) => {
    const audioFileExtensions = [".mp3", ".wav", ".aac", ".flac", ".wma", ".m4a", ".ogg", ".amr"];
    const fileExtension = url.substr(url.lastIndexOf("."));
    return audioFileExtensions.includes(fileExtension);
}