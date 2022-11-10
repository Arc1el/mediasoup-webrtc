if (location.href.substr(0, 5) !== 'https') location.href = 'https' + location.href.substr(4, location.href.length - 4)

const socket = io()

let producer = null

roomidInput.value = "123"
nameInput.value = 'user_' + Math.round(Math.random() * 1000)

socket.request = function request(type, data = {}) {
  return new Promise((resolve, reject) => {
    socket.emit(type, data, (data) => {
      if (data.error) {
        reject(data.error)
      } else {
        resolve(data)
      }
    })
  })
}

let rc = null

function httpGet(theUrl){
  var http = new XMLHttpRequest();
  var url = theUrl;

  http.open("GET", url, true);
  
  http.onreadystatechange = function() {//Call a function when the state changes.
  if(http.readyState == 4 && http.status == 200) {
      res = http.responseText;
      console.log("res : ", res);
      result = JSON.parse(res);

      var table = document.getElementById('table1')
      for (var i=0; i < result.length; i++)
      {
          var row = `<tr>
                      <td>${result[i].date}</td>
                      <td>${result[i].breath}</td>
                      <td>${result[i].temp}</td>
                      <td>${result[i].rfid}</td>
                  </tr>`
          table.innerHTML += row
      }
      console.log("get the table successfully");
      }
  }
  http.send(null);
}


function joinRoom(name, room_id) {
  if (rc && rc.isOpen()) {
    console.log('Already connected to a room')
  } else {
    
    httpGet("https://a54b-223-194-160-130.jp.ngrok.io/api/recent_data");

    initEnumerateDevices()

    rc = new RoomClient(localMedia, remoteVideos, remoteAudios, window.mediasoupClient, socket, room_id, name, roomOpen)

    addListeners()
  }
}

function search_func() {
  rfid = document.getElementById('rfid_input').value;
  aniname = document.getElementById('aniname_input').value;
  pname = document.getElementById('pname_input').value;
  console.log("rfid : ", rfid , "animal name : ", aniname, "parent name : ", pname);


  var http = new XMLHttpRequest();
  var url = "https://a54b-223-194-160-130.jp.ngrok.io/api/get_rfid_info";
  params = '{"rfid" : ' + rfid + '}';
  http.open("POST", url, true);
  http.setRequestHeader("Content-Type", "application/json");
  http.onreadystatechange = function() {//Call a function when the state changes.
  if(http.readyState == 4 && http.status == 200) {
      res = http.responseText;
      console.log("res : ", res);
      var table = document.getElementById('table1')
      table.innerHTML = null;

      }
  }
  http.send(params);
}

function roomOpen() {
  login.className = 'hidden'
  hide(startAudioButton)
  hide(stopAudioButton)
  hide(startVideoButton)
  hide(stopVideoButton)
  hide(startScreenButton)
  hide(stopScreenButton)
  hide(exitButton)
  reveal(devicesButton)
  reveal(mainDiv)
  control.className = ''
  hide(videoMedia)
}

function hide(elem) {
  elem.className = 'hidden'
}

function reveal(elem) {
  elem.className = ''
}

function addListeners() {
  rc.on(RoomClient.EVENTS.startScreen, () => {
    hide(startScreenButton)
    reveal(stopScreenButton)
  })

  rc.on(RoomClient.EVENTS.stopScreen, () => {
    hide(stopScreenButton)
    reveal(startScreenButton)
  })

  rc.on(RoomClient.EVENTS.stopAudio, () => {
    hide(stopAudioButton)
    reveal(startAudioButton)
  })
  rc.on(RoomClient.EVENTS.startAudio, () => {
    hide(startAudioButton)
    reveal(stopAudioButton)
  })

  rc.on(RoomClient.EVENTS.startVideo, () => {
    hide(startVideoButton)
    reveal(stopVideoButton)
  })
  rc.on(RoomClient.EVENTS.stopVideo, () => {
    hide(stopVideoButton)
    reveal(startVideoButton)
  })
  rc.on(RoomClient.EVENTS.exitRoom, () => {
    hide(control)
    hide(devicesList)
    hide(videoMedia)
    hide(devicesButton)
    reveal(login)
  })
}

let isEnumerateDevices = false

function initEnumerateDevices() {
  // Many browsers, without the consent of getUserMedia, cannot enumerate the devices.
  if (isEnumerateDevices) return

  const constraints = {
    audio: true,
    video: true
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      enumerateDevices()
      stream.getTracks().forEach(function (track) {
        track.stop()
      })
    })
    .catch((err) => {
      console.error('Access denied for audio/video: ', err)
    })
}

function enumerateDevices() {
  // Load mediaDevice options
  navigator.mediaDevices.enumerateDevices().then((devices) =>
    devices.forEach((device) => {
      let el = null
      if ('audioinput' === device.kind) {
        el = audioSelect
      } else if ('videoinput' === device.kind) {
        el = videoSelect
      }
      if (!el) return

      let option = document.createElement('option')
      option.value = device.deviceId
      option.innerText = device.label
      el.appendChild(option)
      isEnumerateDevices = true
    })
  )
}
