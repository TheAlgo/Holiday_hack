if (!AgoraRTC.checkSystemRequirements()) {
	alert("Your browser does not support WebRTC!");
}

/* simulated data to proof setLogLevel() */
AgoraRTC.Logger.error('this is error');
AgoraRTC.Logger.warning('this is warning');
AgoraRTC.Logger.info('this is info');
AgoraRTC.Logger.debug('this is debug');

var channel_key = null;
// var channel_value = "1001";
var appId = "731a9f30d6c5463c9710216fa61de348";

function createLocalStream(streamId, cameraId, onInit) {
	var localStream = AgoraRTC.createStream({
		streamID: streamId,
		audio: false,
		cameraId: cameraId,
		// microphoneId: microphone,
		video: true,
		screen: false
	});
	localStream.setVideoProfile('720p_3');
	localStream.on("accessAllowed", function () {
		console.log("accessAllowed");
	});
	localStream.on("accessDenied", function () {
		console.log("accessDenied");
	});
	localStream.init(function () {
		console.log("getUserMedia successfully");
		// localStream.play('video' + displayId);
		getVideoFrame(streamId);
		localStream.play("video-"+streamId);
		if (onInit) onInit();
	}, function (err) {
		console.log("getUserMedia failed", err);
	});

	return localStream;
}

function getVideoFrame(videoId) {
	if($("#videos .video-box#video-"+videoId).length === 0) {
		$("#video-box-template").clone().attr("id", "video-"+videoId).appendTo("#videos");
	}

	return ("#videos .video-box#video-"+videoId);
}

function removeVideoFrame(videoId) {
	$("#videos .video-box#video-"+videoId).remove();
}

function generateUID() {
	return Math.ceil(Math.random() * 100000000);
}

function getLocalStreams(done) {
	AgoraRTC.getDevices(function (all_devices) {
		console.log(all_devices);
		var cameras = all_devices.filter(function (device) {
			return device.kind == "videoinput";
		});
		doneCount = 0;
		var localStreams = [];
		cameras.forEach(function (camera) {
			localStreams.push(createLocalStream(generateUID(), camera.deviceId, function () {
				doneCount++;
				if (doneCount >= cameras.length) {
					done(localStreams);
				}
			}));
		});
	});
}

function publishStream(client, localStream) {
	client.publish(localStream, function (err) {
		console.log("Publish local stream error: " + err);
	});

	client.on('stream-published', function (evt) {
		console.log("Publish local stream successfully");
	});
}

function publishAllStreams(client, localStreams) {
	console.log("localStreams : ", localStreams);
	localStreams.forEach(function (localStream) {
		publishStream(client, localStream);
	});
}