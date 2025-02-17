const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
    console.log('version 1.1!');

    const startMindAR = async () => {
        // Khởi tạo MindAR
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: './assets/targets/targets.mind',
        });

        const { renderer, scene, camera } = mindarThree;

        // Khởi tạo video và texture
        const video = document.createElement('video');
        video.src = './assets/videos/demo-video.mp4';
        video.loop = true;
        video.muted = true; // Bắt buộc để trình duyệt cho phép tự động phát
        video.setAttribute('playsinline', true); // Cho phép phát video trong trình duyệt
        video.style.display = 'none';
        document.body.appendChild(video);

        const videoTexture = new THREE.VideoTexture(video);
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({ map: videoTexture });
        const plane = new THREE.Mesh(geometry, material);

        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(plane);

        // Xử lý sự kiện khi phát hiện target
        anchor.onTargetFound = async () => {
            console.log('Target found!');
            try {
                await video.play();
            } catch (error) {
                console.error('Video play failed:', error);
                alert('Không thể phát video. Vui lòng thử lại!');
            }
        };

        // Xử lý sự kiện khi mất target
        anchor.onTargetLost = () => {
            console.log('Target lost!');
            video.pause();
        };

        // Khởi động MindAR
        console.log('Starting MindAR...');
        await mindarThree.start();
        console.log('MindAR started!');

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    };

    // Xử lý nút bắt đầu
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', async () => {
        startButton.style.display = 'none'; // Ẩn nút sau khi nhấn
        try {
            await startMindAR(); // Khởi động MindAR
        } catch (error) {
            console.error('MindAR failed to start:', error);
            alert('Đã xảy ra lỗi khi khởi động. Vui lòng tải lại trang và thử lại!');
        }
    });
});
