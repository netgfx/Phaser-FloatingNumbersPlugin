# FloatingNumbersPlugin
A Floating numbers plugin for Phaser v3

![grab-landing-page](https://github.com/winnie1312/grab/blob/master/grab-landingpage-winnie.gif)

## Initialize

### On scene preload:
- `import FloatingNumbersPlugin from "../components/FloatingNumbersPlugin";`
- `this.load.scenePlugin('floatingNumbersPlugin', FloatingNumbersPlugin, 'floatingNumbersPlugin', 'floatingNumbers');`

## Call and create floating text (example)

```
this.floatingNumbers.createFloatingText({
    textOptions: {
        fontFamily: 'shrewsbury',
        fontSize: 42,
        color: "#ff0000",
        strokeThickness: 2,
        fontWeight: "bold",
        stroke: "#000000",
        shadow: {
            offsetX: 0,
            offsetY: 0,
            color: '#000',
            blur: 4,
            stroke: true,
            fill: false
        }
    },
    text: "10",
    align: "top-center",
    parentObject: <any-game-object>,
    animation: "smoke",
    animationEase: "Linear"

});
```
---
<br>

## Options

```
{
    "align": "center", //left, right, center
    "textOptions": {},
    "offsetX": 0,
    "offsetY": 0,
    "animation": "up", // explode, smoke, custom, directional: updown, left, right, fade
    "timeToLive": 400,
    "animationDistance": 50,
    "animationEase": "Sine.easeOut",
    "fixedToCamera": false,
    "text": "",
    "store": false,
    "textType": "normal", // normal, bitmaptext
    "parentObject": null,
    "target": this.scene,
    "pointX": [], // for custom animation cubic bezier curve
    "pointY": [] // for custom animation cubic bezier curve
};
```

