const fs = require('fs');
const path = require('path');
const jsmediatags = require("jsmediatags");

const readCover = (songdir) => {
  return new Promise((resolve, reject) => {
    jsmediatags.read(songdir, {
      onSuccess: (result) => {
        if (!result.tags.picture) {
          reject(null);
          return;
        }

        const {
          data,
          format
        } = result.tags.picture;

        var base64String = "";
        for (var i = 0; i < data.length; i++) {
          base64String += String.fromCharCode(data[i]);
        }

        var toReturn = "data:" + format + ";base64," + Buffer.from(base64String, 'binary').toString('base64');
        resolve(toReturn);
      },
      onError: (error) => {
        reject(null);
      }
    })
  })
}

const readFolder = (songdir) => {
  var dir = path.join(songdir, "/");

  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, data) => {
      if (err) {
        reject({
          err: err
        });
      }

      new Promise((resolve, reject) => {
        var tmpSongs = [],
            avail = data.length,
            allowedTypes = [".mp3",".wav",".m4a",".flac",".aac"];

        data.forEach((entity, i) => {
          var songPath = path.join(dir, entity),
            songInfo = path.parse(songPath);

          if(!allowedTypes.includes(songInfo.ext)){
            avail-=1;
            return;
          }

          jsmediatags.read(songPath, {
            onSuccess: (res) => {
              var tmpObj = {};
              if (i == 1) {
                // console.log(res.tags.picture);
              }

              tmpObj.src = songPath;
              tmpObj.name = res.tags.title || songInfo.name;
              tmpObj.artist = res.tags.genre || "Unknown Artist";

              tmpSongs.push(tmpObj);
              avail-=1;
              if (avail==0) {
                resolve(tmpSongs);
              }
            },
            onError: (error) => {
              reject(error);
            }
          })
        });

      }).then(songList => {
        resolve(songList);
      }).catch(err => {
        reject(err);
      })
    });
  });
}

// readFolder("D:/Music/sanskrit").then(data => {
//   // console.log(data);
// }).catch(err => {})

// readCover("D:/Music/sanskrit/Baaton Ko Teri.m4a").then(data => {
//   console.log(data);
// }).catch(err => {
//   console.log(err);
// })

module.exports = {
  readFolder,
  readCover
};
