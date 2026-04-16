(function () {
    "use strict";

    const CAT_SIZE = 256;
    const SPRITE_DIR = "./assets/cat-sprites/";
    const SPEED = 2;
    const ACCELERATION = 0.95;
    const IDLE_TIMEOUT = 2000;
    const SLEEP_TIMEOUT = 10000;
    const GROOM_CHANCE = 0.003;

    const MOUSE_STOP_DELAY = 100;
    const STATE = {IDLE: "idle", WALK: "walk", SLEEP: "sleep", GROOM: "groom", WAKE: "wake", SIT: "sit"};

    let state = STATE.IDLE;
    let catX = window.innerWidth -200;
    let catY = window.innerHeight -200;
    let velocityX = 0;
    let velocityY = 0;
    let mouseX = catX;
    let mouseY = catY;
    let frame = 0;
    let lastMoved = Date.now();
    let mouseMoved = Date.now();
    let groomFrame = 0;
    let wakeFrame = 0;
    let zOpacity = 0;
    let zY = 0;
    let isSitting = false;
    let walkRotation = 0;
    let shouldMirror = false;

    const canvas = document.createElement("canvas");
    canvas.width = CAT_SIZE;
    canvas.height = CAT_SIZE;
    Object.assign(canvas.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: CAT_SIZE + "px",
        height: CAT_SIZE + "px",
        zIndex: "999999",
        imageRendering: "pixelated",
        cursor: "pointer",
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;

    const imageCache = {};

    function preloadImages(names) {
        names.forEach(function (name) {
            const img = new Image();
            img.src = SPRITE_DIR + name + ".png";
            imageCache[name] = img;
        });
    }

    function getImage(name) {
        return imageCache[name] || null;
    }

    preloadImages([
        "idle1", "idle2", "idle3", "idle4",
        "walk_right1", "walk_right2", "walk_right3", "walk_right4", "walk_right5", "walk_right6", "walk_right7", "walk_right8",
        "sleep1", "sleep2", "sleep3", "sleep4",
        "sit1",
        "groom1", "groom2", "groom3", "groom4",
    ]);

    function dist(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    function getWalkDirectionAndRotation(angle) {
        const deg = (angle * 180 / Math.PI + 360) % 360;
        let rotationDeg;
        if (deg < 90 || deg >= 270) {
            rotationDeg = deg;
        } else if (deg >= 90 && deg < 270) {
            rotationDeg = 180 - deg;
        }

        return {rotationDeg: rotationDeg, shouldMirror: (deg >= 90 && deg < 270)};
    }

    function moveCat() {
        if (isSitting) return false;
        if (Date.now() - mouseMoved < MOUSE_STOP_DELAY) return false;

        const d = dist(catX, catY, mouseX, mouseY);
        if (d > 10) {
            const angle = Math.atan2(mouseY - catY, mouseX - catX);
            const targetVelX = Math.cos(angle) * SPEED;
            const targetVelY = Math.sin(angle) * SPEED;

            velocityX += (targetVelX - velocityX) * (1 - ACCELERATION);
            velocityY += (targetVelY - velocityY) * (1 - ACCELERATION);

            catX += velocityX;
            catY += velocityY;

            const dirInfo = getWalkDirectionAndRotation(angle);
            walkRotation = dirInfo.rotationDeg * Math.PI / 180;
            shouldMirror = dirInfo.shouldMirror;

            return true;
        }
        velocityX *= ACCELERATION;
        velocityY *= ACCELERATION;
        return false;
    }

    function getAnimationFrame(st, f) {
        const frameMap = {
            idle: ["idle1", "idle2", "idle3", "idle4"],
            walk: ["walk_right1", "walk_right2", "walk_right3", "walk_right4", "walk_right5", "walk_right6", "walk_right7", "walk_right8"],
            sleep: ["sleep1"],
            sit: ["sit1"],
            groom: ["groom1", "groom2", "groom3", "groom4"],
            wake: ["idle1"],
        };
        const frames = frameMap[st] || ["idle1"];
        const idx = Math.floor((f / 20) % frames.length);
        return frames[idx];
    }

    function drawCat(st, f) {
        ctx.clearRect(0, 0, CAT_SIZE, CAT_SIZE);
        ctx.save();

        let spriteName;

        spriteName = getAnimationFrame(st, f);

        const img = getImage(spriteName);

        if (!img || !img.complete) {
            ctx.fillStyle = "#ddd";
            ctx.fillRect(0, 0, CAT_SIZE, CAT_SIZE);
            ctx.restore();
            return;
        }
        
        const cx = CAT_SIZE / 2;
        ctx.translate(cx, cx);
        if (shouldMirror) ctx.scale(-1, 1);
        if (st === STATE.WALK) {
            ctx.rotate(walkRotation);
        }
        ctx.translate(-cx, -cx);

        ctx.drawImage(img, 0, 0, CAT_SIZE, CAT_SIZE);

        if (st === STATE.SLEEP && zOpacity > 0) {
            ctx.globalAlpha = zOpacity;
            ctx.fillStyle = "#7090c8";
            ctx.font = "bold 11px monospace";
            ctx.fillText("z", CAT_SIZE / 2 + 17, CAT_SIZE / 2 - 6 + zY);
            ctx.font = "bold 8px monospace";
            ctx.fillText("z", CAT_SIZE / 2 + 24, CAT_SIZE / 2 - 16 + zY);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    function positionCanvas() {
        var hw = CAT_SIZE / 2;
        var hh = CAT_SIZE / 2;
        var x = Math.max(0, Math.min(window.innerWidth - CAT_SIZE, catX - hw));
        var y = Math.max(0, Math.min(window.innerHeight - CAT_SIZE, catY - hh));
        canvas.style.left = x + "px";
        canvas.style.top = y + "px";
    }

    function loop() {
        frame++;

        var now = Date.now();
        var moving = moveCat();

        if (state === STATE.SIT) {
            // Sitting: don't change state
        } else if (state === STATE.SLEEP) {
            zY = -Math.sin(frame * 0.04) * 3;
            zOpacity = Math.min(1, zOpacity + 0.02);
            if (now - mouseMoved < 500) {
                state = STATE.WAKE;
                wakeFrame = 0;
                zOpacity = 0;
            }
        } else if (state === STATE.WAKE) {
            wakeFrame++;
            if (wakeFrame > 50) state = STATE.IDLE;
        } else if (state === STATE.GROOM) {
            groomFrame++;
            if (groomFrame > 130) {
                state = STATE.IDLE;
                groomFrame = 0;
            }
            if (moving) {
                state = STATE.WALK;
                groomFrame = 0;
            }
        } else if (moving) {
            state = STATE.WALK;
            lastMoved = now;
        } else {
            if (state === STATE.WALK) state = STATE.IDLE;
            if (state === STATE.IDLE) {
                if (now - lastMoved > SLEEP_TIMEOUT) {
                    state = STATE.SLEEP;
                    zOpacity = 0;
                } else if (now - lastMoved > IDLE_TIMEOUT && Math.random() < GROOM_CHANCE) {
                    state = STATE.GROOM;
                    groomFrame = 0;
                }
            }
        }

        positionCanvas();

        if (state === STATE.WALK) {
            drawCat(STATE.WALK, frame);
        } else {
            drawCat(state, frame);
        }
        requestAnimationFrame(loop);
    }

    document.addEventListener("mousemove", function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseMoved = Date.now();
        if (state !== STATE.SIT) lastMoved = Date.now();
    }, {passive: true});

    canvas.addEventListener("click", function () {
        if (state === STATE.SIT) {
            state = STATE.WAKE;
            wakeFrame = 0;
            isSitting = false;
            zOpacity = 0;
            lastMoved = Date.now();
            mouseMoved = Date.now();
        } else {
            state = STATE.SIT;
            isSitting = true;
            zOpacity = 0;
        }
    });

    window.addEventListener("resize", positionCanvas, {passive: true});

    requestAnimationFrame(loop);
})();








