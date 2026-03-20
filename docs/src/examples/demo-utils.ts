export async function getWebcamVideo(
	videoConstraints: MediaTrackConstraints | true = true,
): Promise<HTMLVideoElement> {
	const video = document.createElement('video');
	video.autoplay = true;
	video.muted = true;
	video.playsInline = true;

	const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
	video.srcObject = stream;
	await new Promise<void>(resolve => {
		video.onloadedmetadata = () => resolve();
	});

	return video;
}

export function stopVideoStream(video: HTMLVideoElement | null) {
	if (!video) return;

	if (video.srcObject instanceof MediaStream) {
		video.srcObject.getTracks().forEach(track => track.stop());
	}

	video.srcObject = null;
	video.remove();
}
