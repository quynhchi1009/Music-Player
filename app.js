const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_player";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: "IU là đây",
            singer: "Sean, Muộii, Anfang",
            image: "./assets/img/song1.jpeg",
            path: "./assets/music/song1.mp3",
        },
        {
            name: "Sao em phải buồn",
            singer: "Sean",
            image: "./assets/img/song2.jpeg",
            path: "./assets/music/song2.mp3",
        },
        {
            name: "Gió",
            singer: "Jank",
            image: "./assets/img/song3.jpeg",
            path: "./assets/music/Gio-Jank-8738046.mp3",
        },
        {
            name: "Hẹn Em Ở Lần Yêu Thứ 2",
            singer: "Nguyenn, Đặng Tuấn Vũ",
            image: "./assets/img/song4.jpeg",
            path: "./assets/music/HenEmOLanYeuThu2-NguyennDangTuanVu-8865500.mp3",
        },
        {
            name: "Mashup Lỡ Duyên",
            singer: "Rum, NIT",
            image: "./assets/img/song5.jpeg",
            path: "./assets/music/HenEmOLanYeuThu2-NguyennDangTuanVu-8865500.mp3",
        },
        {
            name: "Là Anh (Lofi Ver.)",
            singer: "Phạm Lịch, Quanvrox",
            image: "./assets/img/song6.jpeg",
            path: "./assets/music/LaAnhLofiVer-PhamLichQuanvrox-8870737.mp3",
        },
        {
            name: "Cold Don’t (Lofi Ver.)",
            singer: "Nmọc, Dmean, Astac, V.A",
            image: "./assets/img/song7.jpeg",
            path: "./assets/music/ColdDontLofiVer-NmocDmeanVietNamAstacVietNamQuanvrox-9045987.mp3",
        },
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${
                index === this.currentIndex ? "active" : ""
            }" data-index="${index}">
               <div
                  class="thumb"
                  style="
                     background-image: url('${song.image}');
                  "></div>
               <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
               </div>
               <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
               </div>
            </div>
            `;
        });
        playlist.innerHTML = htmls.join("");
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xử lý CD quay/ dừng quay
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 1000,
                iterations: Infinity, //loop through
            }
        );
        cdThumbAnimate.pause();

        //xử lý phóng to/ thu nhỏ CD
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        //xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        //Xử lý khi tua xong
        progress.onchange = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        //Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        //Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        //Xử lý bât/tắt random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        //xử lý phát lại 1 bài hát
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        //xử lý next song khi audo ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        //lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            if (songNode || e.target.closest(".option")) {
                //xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                //xử lý khi click vào song's option
                if (e.target.closest(".option")) {
                }
            }
        };
    },
    scrollToActiveSong: function () {
        setTimeout(function () {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 300);
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.getConfig.isRandom;
        this.isRepeat = this.getConfig.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        //gán cấu hình từ config vào ứng dụng (đọc từ localStorage -> lưu vào config -> load config -> load từ this.config lưu vào cấu hình)
        this.loadConfig();

        //Dịnh nghĩa các thuộc tính cho obj
        this.defineProperties();

        //Lắng nghe, xử lý các sự kiện (DOM Events)
        this.handleEvents();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //render Playlist
        this.render();

        // Hien thi trang thai ban dau cua Random & Repeat
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();

// 1. Render songs
// 2. Scroll top: Cdwith giảm dần, khi scroll to bottom -> handleEvents
//    - tính cdWidth = cd.offsetWidth
//    - tính khoảng cách từ trên xuống
//    - set cdWith phụ thuốc vào kcach từ trên xuống
// 3. Play/ pause/ seek: HTML Audio/ Video DOM Reference
//    - hiển thị bài hát hiện chạy trong .audio <= define current song
//    - Play song with audio.onplay()
//    - Pause song with audio.onpause()
//    - Seek with progress.onchange()
// 4. CD rotate : animate API
// 5. Next/ Prev: nextSong()/ prevSong()
// 6. Random: playRandomSong()
// 7. Next/ Repeat when ended: audio.onended()
// 8. Active song: add class active to div.song. KHi chuyen bai hat, render lai UI
// 9. Scroll active song into view: scrollToActiveSong()
// 10. Play song when clicked: Dat data-set attribute trong html. Su dung songNode.dataset.index de lay element
