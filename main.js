const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Version 2.5 - Fix Video Color Issues!');

    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id') || 'demo';

    // 🔹 Sử dụng tài nguyên từ S3
    const CLOUD_FRONT_URL = "https://d3ia91dr6eizuz.cloudfront.net";
    const imageTargetSrc = `${CLOUD_FRONT_URL}/targets/${contentId}.mind`;
    const videoSrc = `${CLOUD_FRONT_URL}/videos/${contentId}.mp4`;

    const startMindAR = async () => {
        try {
            console.log("🟢 Đang tải MindAR với target:", imageTargetSrc);

            const mindarThree = new window.MINDAR.IMAGE.MindARThree({
                container: document.body,
                imageTargetSrc: imageTargetSrc,
                uiScanning: false,
                maxTrack: 1, // Chỉ track 1 target để giảm tải CPU
                filterMinCF: 0.0001,
                filterBeta: 0.001
            });

            const { renderer, scene, camera } = mindarThree;

            // 🚀 **Chỉnh toneMapping để tránh ảnh hưởng màu sắc**
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.NoToneMapping; // Không áp tone màu

            // 🚀 **Tạo video player**
            const video = document.createElement('video');
            video.loop = true;
            video.muted = true;
            video.setAttribute('playsinline', true);
            video.setAttribute('crossorigin', 'anonymous');
            video.setAttribute('preload', 'auto');
            video.style.display = 'none';
            document.body.appendChild(video);

            let isVideoLoaded = false;

            // 🛠 **Tải video & tối ưu chất lượng**
            const loadVideo = async () => {
                if (!isVideoLoaded) {
                    video.src = videoSrc;
                    isVideoLoaded = true;

                    try {
                        await video.decode();
                        console.log('🟢 Video đã được giải mã trước');
                    } catch (error) {
                        console.error('🔴 Lỗi khi giải mã video:', error);
                    }
                }
            };

            // 🖼 **Tạo texture với màu sắc chính xác**
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.colorSpace = THREE.SRGBColorSpace; // 🔥 Giữ màu sắc gốc
            videoTexture.encoding = THREE.sRGBEncoding; // 🔥 Giữ màu sắc không bị trắng
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.generateMipmaps = false; // 🔥 Tránh làm mờ hoặc sai màu
            videoTexture.premultiplyAlpha = false; // 🔥 Ngăn lỗi trắng hơn bình thường

            // 🚀 **Tạo vật thể hiển thị video**
            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshBasicMaterial({
                map: videoTexture,
                transparent: false, // 🔥 Để false để tránh lỗi màu trắng
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(geometry, material);

            const anchor = mindarThree.addAnchor(0);
            anchor.group.add(plane);

            anchor.onTargetFound = async () => {
                console.log(`🟢 Target ${contentId} found!`);
                loadVideo();
                try {
                    await video.play();
                } catch (error) {
                    console.error('🔴 Lỗi khi phát video:', error);
                    alert('Không thể phát video. Vui lòng thử lại!');
                }
            };

            anchor.onTargetLost = () => {
                console.log(`🟠 Target ${contentId} lost!`);
                video.pause();
            };

            console.log('🟢 Bắt đầu MindAR...');
            await mindarThree.start();
            console.log('🟢 MindAR đã khởi động!');

            // 🚀 **Tối ưu hóa vòng lặp render để giảm tải CPU**
            let lastRenderTime = 0;
            const renderLoop = (time) => {
                if (time - lastRenderTime > 16) { // Giữ FPS 60
                    renderer.render(scene, camera);
                    videoTexture.needsUpdate = true;
                    lastRenderTime = time;
                }
                requestAnimationFrame(renderLoop);
            };
            requestAnimationFrame(renderLoop);

        } catch (error) {
            console.error("🔴 Lỗi khi tải MindAR hoặc video:", error);
            alert(`Lỗi khi tải nội dung: ${error.message}`);
        }
    };

    // Bắt đầu khi nhấn nút
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', async () => {
        startButton.style.display = 'none';
        await startMindAR();
    });
});
