'use babel';

import React from 'react';
import {
  SaavnLogo,
  RepeatIcon,
  LeftSong,
  PlaySong,
  PauseSong,
  RightSong,
  EqualZIcon,
  ShuffleIcon
} from './icons.js';

import {
  readFolder,
  readCover
} from './songTool.js';

// import defaultSong from './defaultSong.jpg';

const defaultSong = "https://staticfe.saavn.com/web6/prod/dist/1617275725/_i/default_images/default-song-500x500.jpg";

export default Root = (props) => {
  const [isOnline, setOnline] = React.useState(true);
  const [songs, setSongs] = React.useState([]);
  const [songName, setName] = React.useState("Click on a song to Play");
  const [songIdx, setIndex] = React.useState(-1);
  const [songCover, setCover] = React.useState(defaultSong);
  const [songProg, setProg] = React.useState(0);
  const [songSrc, setSrc] = React.useState("");
  const [song, setSong] = React.useState(new Audio());
  const [isPlaying, setPlay] = React.useState(false);
  const [isShuffled, setShuffle] = React.useState(false);
  const [songOrder, setOrder] = React.useState([]);
  const [isRepeat, setRepeat] = React.useState(false);

  const longTime = (dur)=>{
    var duration = parseInt(dur);

    var tmp = "";
    if (Math.floor(duration / 60) < 10) {
      tmp = "0";
    }
    tmp += Math.floor(duration / 60);

    tmp += ":";
    if (Math.floor(duration % 60) < 10) {
      tmp += "0";
    }
    tmp += Math.floor(duration % 60);

    return tmp;
  }

  const getDuration = (audioPath) => {
    return new Promise((resolve, reject) => {
      var song = new Audio();
      song.src = audioPath;

      song.addEventListener('loadedmetadata', function() {
        resolve(longTime(song.duration));
      }, false);
    });
  }

  const playSong = () => {
    if(song.src==""){
      nextSong();
    }else{
      setPlay(true);
      song.play();
    }

    song.onended = onSongEnd;
  }

  const pauseSong = () => {
    setPlay(false);
    song.pause();
  }

  const switchPlay = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong();
    }
  }

  const loadSongs = () => {
    var dir = atom.config.get("jiosaavn.songsDirectory");
    if(dir==""){
      return;
    }
    // console.log(dir);

    readFolder(dir)
      .then((data) => {
        var totSongs = data.length;
        var songPromise = new Promise((resolve, reject) => {
          var tmpSongs = [];

          data.forEach((item, i) => {
            getDuration(item.src).then(dur => {
              tmpObj = item;
              tmpObj.duration = dur;
              tmpSongs.push(tmpObj);

              if (tmpSongs.length == totSongs) {
                resolve(tmpSongs);
              }
            }).catch(err => {
              console.log("err");
              console.log(err);
            })
          });
        });

        songPromise.then(tmpSongs => {
          tmpSongs.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
          setSongs(tmpSongs);
        }).catch(err => {
          console.log(err);
        });
      })
      .catch(err => {
        console.log("Error");
        console.log(err);
      });
  }

  const clickSong = (ele, nextSong=0) => {
    if(songs.length==0) return;

    if(isShuffled){
      var ix = 0;
      while(ix<songOrder.length){
        if(songOrder[ix]==songIdx) break;
        ix+=1;
      }
    }

    var tmpRepeat = document.getElementById('repeatSong').classList.contains('isRepeat');

    if(nextSong==1){
      var idx = (songIdx+1)%songs.length;
      if(isShuffled){
        idx = songOrder[(ix+1)%songs.length];
      }

      if(tmpRepeat){
        playSong();
        return;
      }

    }else if(nextSong==-1){
      var idx = (songIdx-1 + 5*songs.length)%songs.length;
      if(isShuffled){
        idx = songOrder[(ix-1 + 5*songs.length)%songs.length];
      }

      if(tmpRepeat){
        playSong();
        return;
      }

    }else{
      var idx = parseInt(ele.target.dataset.idx);
    }

    setIndex(idx);
    setName(songs[idx].name);
    setProg(0);
    readCover(songs[idx].src).then(data => {
      if (data == null) {
        setCover(defaultSong);
      } else {
        // console.log(data);
        setCover(data);
      }
    }).catch(err => {
      // console.log(err);
      setCover(defaultSong);
    });

    song.src = songs[idx].src;
    song.oncanplay = () => {
      setSong(song);
      setSrc(song.src);
    };
  }

  const nextSong = (dir)=>{
    clickSong({},1);
  }

  const prevSong = (dir)=>{
    clickSong({},-1);
  }

  const changeTime = () => {
    var tmpTime = parseInt(song.currentTime);
    tmpTime = Math.floor((100 * tmpTime) / song.duration);
    setProg(tmpTime || 0);
  }

  const changeSongTime = (ele) => {
    var tmpProg = parseInt(ele.target.value);
    var tmpTime = Math.floor((tmpProg*song.duration)/100);
    song.currentTime = tmpTime;
    // console.log(tmpTime);
    setProg(tmpProg);
  }

  const onSongEnd = ()=>{
    // console.log("Song Ended");
    nextSong();
  }

  const changeRepeat = ()=>{
    setRepeat(!isRepeat);
  }

  const changeOnline = ()=>{
    pauseSong();
    setOnline(!isOnline);
  }

  const onExit = ()=>{
    song.src="";
  }

  const shuffle = (array) => {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  const changeShuffle = ()=>{
    if(!isShuffled){
      var ln = songs.length,
        tmpOrder = [];

      for (var i = 0; i < ln; i++) {
        if(i!=songIdx){
          tmpOrder.push(i);
        }
      }

      shuffle(tmpOrder);

      if(songIdx>=0){
        tmpOrder.push(songIdx);
      }

      tmpOrder.reverse();
      setOrder(tmpOrder);
    }

    setShuffle(!isShuffled);
  }

  React.useEffect(() => {
    if (songs.length == 0) {
      loadSongs();
      song.ontimeupdate = changeTime;
      song.duration = 0;
    }
  });

  React.useEffect(() => {
    if (songSrc != "") {
      playSong();
    }
  }, [songSrc]);

  return (
    <div className="jiosaavnframe">
      <button onClick={onExit} className="displayNone" id="exitInput"></button>
      <div className="switchCont">
        <div
          onClick={changeOnline}
          className="switchState">
          Go {isOnline?"Offline":"Online"}
        </div>
      </div>
      {isOnline?(
        <iframe className="iframesong"
        src="https://www.jiosaavn.com/embed/playlist/1"
        frameBorder="0"
        allowtransparency="true"
        allow="encrypted-media">
        </iframe>
      ):(
        <div className="saavnapp">
          <div className="playlistplay">
            <div className="currentsong">
              <div className="saavnlogo">
                <a href="https://www.jiosaavn.com/">
                  <span>
                    <SaavnLogo/>
                  </span>
                </a>
              </div>
              <div className="albumsong">
                <div className="songinfo">
                  <div className="songtitle">
                    <span>{songName}</span>
                  </div>
                  <div className="songcover">
                    <img src={songCover} alt="cover"/>
                  </div>
                </div>
                <div className="songprog">
                  <div data-progress={songProg || 0} className="pline"></div>
                  <div data-progress={songProg || 0} className="pball"></div>
                  <input
                    id="songprog"
                    onChange={changeSongTime}
                    type="range"
                    min={0}
                    max={100}
                    value={songProg || 0}/>
                </div>
                <div className="progressTime">
                  {longTime(song.currentTime)}/{longTime(song.duration || 0)}
                </div>
                <div className="songcontrol">
                  <div className="repeatControl">
                    <div onClick={changeRepeat} id="repeatSong" className={isRepeat?"buttonCont isRepeat":"buttonCont"}>
                      <RepeatIcon/>
                    </div>
                  </div>
                  <div className="playcontrol">
                    <div onClick={prevSong} className="buttonCont">
                      <LeftSong/>
                    </div>
                    <div onClick={switchPlay} className="buttonCont">
                      {isPlaying?<PauseSong/>:<PlaySong/>}
                    </div>
                    <div onClick={nextSong} className="buttonCont">
                      <RightSong/>
                    </div>
                  </div>
                  <div className="shufflecontrol">
                    <div className="buttonCont" onClick={changeShuffle}>
                      <ShuffleIcon shuff={isShuffled}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="songlist">
            <div className="songqueue">
              {songs && songs.map((song,i)=>{
                return(
                  <div className="qsong" key={i}>
                    <div className={i==songIdx?"snum playnum":"snum"}>{i==songIdx?(
                      <EqualZIcon isPlaying={isPlaying}/>
                    ):(i+1)}</div>
                    <div className="qsinfo">
                      <div className="qsname"><span className={i==songIdx?"playsong":""}>{song.name}</span></div>
                      <div className="qsdetails"><span>{song.artist}</span></div>
                    </div>
                    <div className="qslength">{song.duration}</div>
                    <div className="songoverlay" onClick={clickSong} data-idx={i}></div>
                  </div>
                )
              })}

              {songs.length==0?(
                <div className="emptycont">
                  <div className="emtitle">Configure your music directory in the settings</div>
                  <div className="emdesc">( Go to settings > packages > jiosaavn )</div>
                </div>
              ):null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// export default class Root extends React.PureComponent {
//   constructor(props) {
//     super(props);
//   }
//
//   render() {
//
//   }
// }
