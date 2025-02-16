const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
    const start = async () => {
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: './assets/targets/targets.mind' // Cập nhật đường dẫn tới file targets.mind
        });

        const { renderer, scene, camera } = mindarThree;

        // Tạo phần tử video
        const video = document.createElement('video');
        video.src = './assets/videos/demo-video.mp4'; // Cập nhật đường dẫn tới video demo-video.mp4
        video.loop = true; // Bật loop để video tự động lặp lại
        video.muted = true; // Tắt mute để có âm thanh
        video.setAttribute('playsinline', true);
        video.style.display = 'none'; // Ẩn video khỏi DOM

        // Thêm video vào document.body để đảm bảo khả năng phát
        document.body.appendChild(video);

        // Tạo video texture
        const videoTexture = new THREE.VideoTexture(video);

        // Tạo PlaneGeometry để hiển thị video
        const geometry = new THREE.PlaneGeometry(1, 1); // Kích thước video
        const material = new THREE.MeshBasicMaterial({
            map: videoTexture
        });
        const plane = new THREE.Mesh(geometry, material);

        // Gắn Plane vào anchor
        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(plane);

        // Xử lý sự kiện khi phát hiện hoặc mất mục tiêu
        anchor.onTargetFound = () => {
            console.log('Target found!');
            if (video.paused) {
                video.play(); // Tiếp tục phát video từ vị trí hiện tại
            }
        };

        anchor.onTargetLost = () => {
            console.log('Target lost!');
            if (!video.paused) {
                video.pause(); // Tạm dừng video nếu đang phát
            }
        };

        await mindarThree.start();

        // Vòng lặp render
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    };

    start();
});
