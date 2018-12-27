function initClient(departmentId, done) {
	console.log("Init AgoraRTC client with App ID: " + appId);
	client = AgoraRTC.createClient({
		mode: 'interop'
	});
	client.init(appId, function () {
		console.log("AgoraRTC client initialized");
		client.join(channel_key, departmentId, null, function (uid) {
			console.log("User " + uid + " join channel successfully");
			done(client, uid);
		});
	}, function (err) {
		console.log("AgoraRTC client init failed", err);
	});

	client.on('error', function (err) {
		console.log("Got error msg:", err.reason);
		if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
			client.renewChannelKey(channelKey, function () {
				console.log("Renew channel key successfully");
			}, function (err) {
				console.log("Renew channel key failed: ", err);
			});
		}
	});

	client.on('stream-added', function (evt) {
		var stream = evt.stream;
		console.log("New stream added: " + stream.getId());
		console.log("Subscribe ", stream);
		client.subscribe(stream, function (err) {
			console.log("Subscribe stream failed", err);
		});
	});

	client.on('stream-subscribed', function (evt) {
		var stream = evt.stream;
		console.log("Subscribe remote stream successfully: " + stream.getId());
		// if ($('div#video #agora_remote' + stream.getId()).length === 0) {
		// 	$('div#video').append('<div id="agora_remote' + stream.getId() + '" style="float:left; width:810px;height:607px;display:inline-block;"></div>');
		// }
		getVideoFrame(stream.getId());
		stream.play('video-' + stream.getId());
	});

	client.on('stream-removed', function (evt) {
		var stream = evt.stream;
		stream.stop();
		removeVideoFrame(stream.getId());
		console.log("Remote stream is removed " + stream.getId());
	});

	client.on('peer-leave', function (evt) {
		var stream = evt.stream;
		if (stream) {
			stream.stop();
			removeVideoFrame(stream.getId());
			console.log(evt.uid + " leaved from this channel");
		}
	});

}

function init() {
	initClient(departmentId, function(client, uid) {
	});
	// getLocalStreams(function (localStreams) {
	// 	initClient(function (client, uid) {
	// 		publishAllStreams(client, localStreams);
	// 	});
	// });
}

init();