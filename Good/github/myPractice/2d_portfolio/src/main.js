import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";

k.loadSprite("spritesheet", "./spritesheet.png", { 
    //we assume direct assess to the public folder in vite
    sliceX: 39,
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
        // speed is in framerate, loop is default false
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
        // we only use right-side one, 
        // when we wanna use left-side one, just simply flip it
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
    },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => { // await is permitted in the async function
    const mapData = await (await fetch("./map.json")).json();
    // await here because this must be done first before running the following code
    const layers = mapData.layers;
    const map = k.make([
        k.sprite("map"), 
        k.pos(0), // k.pos(x, y) this object start position will be at (x, y)
        k.scale(scaleFactor) // k.scale() scale up or down this object
    ]);
    // this is just making not displaying 
    // k.add(map) is really displaying

    const player = k.make([
        k.sprite("spirtesheet", {anim : "idle-down"}), // set the default animation to facing-down
        k.area({ // hitbox
            shape: new k.Rect(k.vec2(0,3), 10, 10) // width & height = 10 
            // the 1-th parameter is the hitbox's related position to the player itself
        }),
        k.body(), // make the object solid/collidible
        k.anchor("center"), // default is topleft
        k.pos(),
        k.scale(scaleFactor),
        {   // property, this is like typedef in c
            // later we can use player.speed to access the value
            speed: 250,
            direction: "down",
            isInDialogue: false, // if in-dialgoue, we should prevent the player from moving.
        },
        "player", // give a tag to check possible name or object collision
    ]);

    for (const layer of layers) {
        if (layer.name === "boundaries") { // to check name tag
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height)
                    }),
                    k.body({
                        isStatic: true 
                        // static means we can't pass or overlap this object
                    }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);
                if (boundary.name) { 
                    // Any value that is not false, undefined, null, 0, -0, NaN, 
                    // or the empty string (""), or including a false 
                    // is considered truth when used as the condition
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        // TODO
                    });
                }
            }
        }
    }
});

k.go("main");