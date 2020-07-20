export class FloatingNumbersPlugin {

    constructor(scene, pluginManager) {


        /**
         * A handy reference to the Plugin Manager that is responsible for this plugin.
         * Can be used as a route to gain access to game systems and  events.
         *
         * @name Phaser.Plugins.BasePlugin#pluginManager
         * @type {Phaser.Plugins.PluginManager}
         * @protected
         * @since 3.8.0
         */
        this.pluginManager = pluginManager;

        /**
         * A reference to the Game instance this plugin is running under.
         *
         * @name Phaser.Plugins.BasePlugin#game
         * @type {Phaser.Game}
         * @protected
         * @since 3.8.0
         */
        this.game = pluginManager.game;

        /**
         * A reference to the Scene that has installed this plugin.
         * Only set if it's a Scene Plugin, otherwise `null`.
         * This property is only set when the plugin is instantiated and added to the Scene, not before.
         * You cannot use it during the `init` method, but you can during the `boot` method.
         *
         * @name Phaser.Plugins.BasePlugin#scene
         * @type {?Phaser.Scene}
         * @protected
         * @since 3.8.0
         */
        this.scene = scene;

        /**
         * A reference to the Scene Systems of the Scene that has installed this plugin.
         * Only set if it's a Scene Plugin, otherwise `null`.
         * This property is only set when the plugin is instantiated and added to the Scene, not before.
         * You cannot use it during the `init` method, but you can during the `boot` method.
         *
         * @name Phaser.Plugins.BasePlugin#systems
         * @type {?Phaser.Scenes.Systems}
         * @protected
         * @since 3.8.0
         */
        this.systems = scene.sys;

        /**
         * The Sticks that this plugin is responsible for.
         * @type {Set}
         */
        this.sticks = null;

        /**
         * The Buttons that this plugin is responsible for.
         * @type {Set}
         */
        this.buttons = null;

        /**
         * Internal var to track the Input pointer total.
         * @type {integer}
         * @private
         */
        this._pointerTotal = 0;

        scene.sys.events.once('boot', this.boot, this);

        this.tooltipCollection = {};

        this.configObj = {
            "align": "center", //left, right, center
            "textOptions": {},
            "offsetX": 0,
            "offsetY": 0,
            "animation": "up", // explode, smoke, custom, directional: up, down, left, right, fade, physics
            "timeToLive": 400,
            "animationDistance": 50,
            "animationEase": "Sine.easeOut",
            "fixedToCamera": false,
            "text": "",
            "store": false,
            "textType": "normal", // normal, bitmaptext
            "parentObject": null,
            "target": this.scene,
            "pointX": [],
            "pointY": []
        };

        /*
        {
                fontFamily: 'shrewsbury',
                fontSize: 42,
                color: Styles.getColor("gold", "string"),
                strokeThickness: 2,
                fontWeight: "bold",
                stroke: Styles.getColor("black", "string"),
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    color: '#000',
                    blur: 4,
                    stroke: true,
                    fill: false
                },
            }
        */
    }

    /**
     *
     *
     * @param {*} config
     * @memberof FloatingNumbersPlugin
     */
    createFloatingText(config) {

        let _config = Object.assign(this.configObj, config);
        let textObj = {};
        console.log(_config);
        // check text type //
        if (_config.textType === "normal") {
            textObj = this.scene.add.text(0, 0, _config.text, _config.textOptions);

            if (_config.parentObject !== null) {
                // check alignment //
                if (_config.align === "center") {
                    Phaser.Display.Align.In.Center(textObj, _config.parentObject, _config.offsetX, _config.offsetY);
                } else if (_config.align === "left") {
                    Phaser.Display.Align.In.LeftCenter(textObj, _config.parentObject, _config.offsetX, _config.offsetY);
                } else if (_config.align === "right") {
                    Phaser.Display.Align.In.RightCenter(textObj, _config.parentObject, _config.offsetX, _config.offsetY);
                } else if (_config.align === "top-center") {
                    Phaser.Display.Align.In.TopCenter(textObj, _config.parentObject, _config.offsetX, _config.offsetY);
                }
            }

            textObj.isAnimating = false;

            console.log(_config.parentObject.x, _config.parentObject.y, textObj.x, textObj.y);
            // TODO: add more options

            if (_config.store === false) {
                this.scene.children.bringToTop(textObj);
                this.animateText(_config, textObj);
            } else {
                return textObj;
            }
        }
    }

    /**
     *
     *
     * @param {*} config
     * @memberof FloatingNumbersPlugin
     */
    animateText(config, textObj) {


        var path = { t: 0, vec: new Phaser.Math.Vector2() };

        console.log("Animating with: ", config);

        /////
        if (textObj.isAnimating === false) {
            textObj.isAnimating = true;
            if (config.animation === "physics") {


            } else if (config.animation === "custom") {

                if (config.pointX.length > 0 && config.pointY.length > 0) {
                    var startPoint = new Phaser.Math.Vector2(config.pointX[0], config.pointY[0]);
                    var controlPoint1 = new Phaser.Math.Vector2(config.pointX[1], config.pointY[1]);
                    var controlPoint2 = new Phaser.Math.Vector2(config.pointX[2], config.pointY[2]);
                    var endPoint = new Phaser.Math.Vector2(config.pointX[3], config.pointY[3]);
                    var curve = new Phaser.Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);

                    this.scene.tweens.add({
                        targets: path,
                        t: 1,
                        ease: config.animationEase,
                        duration: config.timeToLive,
                        yoyo: false,
                        callbackScope: this,
                        onUpdate: function() {
                            let position = curve.getPoint(path.t, path.vec);
                            textObj.x = position.x;
                            textObj.y = position.y;
                        }
                    });
                }

            } else if (config.animation === "explode") {
                this.scene.tweens.add({
                    targets: textObj,
                    scale: config.animationDistance,
                    ease: config.animationEase,
                    duration: config.timeToLive,
                    yoyo: false,
                    callbackScope: this,
                    onComplete: function() {
                        this.scene.tweens.add({
                            targets: textObj,
                            alpha: 0,
                            ease: config.animationEase,
                            duration: config.timeToLive,
                            yoyo: false,
                            callbackScope: this,
                            onComplete: function() {
                                textObj.destroy();
                            }
                        });
                    }
                });

            } else if (config.animation === "fade") {
                textObj.alpha = 0;
                this.scene.tweens.add({
                    targets: textObj,
                    alpha: 1,
                    ease: config.animationEase,
                    duration: config.timeToLive,
                    yoyo: false,
                    callbackScope: this,
                    onComplete: function() {
                        this.scene.tweens.add({
                            targets: textObj,
                            alpha: 0,
                            ease: config.animationEase,
                            duration: config.timeToLive,
                            yoyo: false,
                            callbackScope: this,
                            onComplete: function() {
                                textObj.destroy();
                            }
                        });
                    }
                });

            } else if (config.animation === "smoke") {

                let invert = Math.round(Math.random() * 10);
                let invertOffset = 1;

                if (invert > 5) {
                    invertOffset = invertOffset * -1;
                }

                var startPoint = new Phaser.Math.Vector2(textObj.x + (25 * invertOffset), textObj.y - 25);
                var controlPoint1 = new Phaser.Math.Vector2(textObj.x - (50 * invertOffset), textObj.y - 50);
                var controlPoint2 = new Phaser.Math.Vector2(textObj.x + (75 * invertOffset), textObj.y - 75);
                var endPoint = new Phaser.Math.Vector2(textObj.x - (25 * invertOffset), textObj.y - 100);
                var curve = new Phaser.Curves.CubicBezier(startPoint, controlPoint1, controlPoint2, endPoint);

                this.scene.tweens.add({
                    targets: path,
                    t: 1,
                    ease: config.animationEase,
                    duration: config.timeToLive,
                    yoyo: false,
                    callbackScope: this,
                    onComplete: function() {
                        this.scene.tweens.add({
                            targets: textObj,
                            alpha: 0,
                            ease: config.animationEase,
                            duration: config.timeToLive,
                            yoyo: false,
                            callbackScope: this,
                            onComplete: function() {
                                textObj.destroy();
                            }
                        });
                    },
                    onUpdate: function() {
                        let position = curve.getPoint(path.t, path.vec);
                        textObj.x = position.x;
                        textObj.y = position.y;
                    }
                });

            } else if (config.animation === "left") {
                this.scene.tweens.add({
                    targets: textObj,
                    y: textObj.x - config.animationDistance,
                    ease: config.animationEase,
                    duration: config.timeToLive,
                    yoyo: false,
                    callbackScope: this,
                    onComplete: function() {
                        this.scene.tweens.add({
                            targets: textObj,
                            alpha: 0,
                            ease: config.animationEase,
                            duration: config.timeToLive,
                            yoyo: false,
                            callbackScope: this,
                            onComplete: function() {
                                textObj.destroy();
                            }
                        });
                    }
                });

            } else if (config.animation === "right") {
                this.scene.tweens.add({
                    targets: textObj,
                    y: textObj.x + config.animationDistance,
                    ease: config.animationEase,
                    duration: config.timeToLive,
                    yoyo: false,
                    callbackScope: this,
                    onComplete: function() {
                        this.scene.tweens.add({
                            targets: textObj,
                            alpha: 0,
                            ease: config.animationEase,
                            duration: config.timeToLive,
                            yoyo: false,
                            callbackScope: this,
                            onComplete: function() {
                                textObj.destroy();
                            }
                        });
                    }
                });

            } else if (config.animation === "up") {

                this.scene.tweens.add({
                    targets: textObj,
                    y: textObj.y - config.animationDistance,
                    ease: config.animationEase,
                    duration: config.timeToLive,
                    yoyo: false,
                    callbackScope: this,
                    onComplete: function() {
                        this.scene.tweens.add({
                            targets: textObj,
                            alpha: 0,
                            ease: config.animationEase,
                            duration: config.timeToLive,
                            yoyo: false,
                            callbackScope: this,
                            onComplete: function() {
                                textObj.destroy();
                            }
                        });
                    }
                });
            } else if (config.animation === "down") {
                this.scene.tweens.add({
                    targets: textObj,
                    y: textObj.y + config.animationDistance,
                    ease: config.animationEase,
                    duration: config.timeToLive,
                    yoyo: false,
                    callbackScope: this,
                    onComplete: function() {
                        this.scene.tweens.add({
                            targets: textObj,
                            alpha: 0,
                            ease: config.animationEase,
                            duration: config.timeToLive,
                            yoyo: false,
                            callbackScope: this,
                            onComplete: function() {
                                textObj.destroy();
                            }
                        });
                    }
                });
            }
        }
    }

    /**
     * The boot method.
     *
     * @private
     */
    boot() {
        this.systems.events.once('destroy', this.destroy, this);

        //  Because they may load the plugin via the Loader
        if (this.systems.settings.active) {
            this.start();
        } else {
            this.systems.events.on('start', this.start, this);
        }
    }

    start() {


        this.systems.events.on('update', this.update, this);
        this.systems.events.once('shutdown', this.shutdown, this);
    }

    /**
     * Called automatically by the Phaser Plugin Manager.
     *
     * Updates all Stick and Button objects.
     *
     * @param {integer} time - The current game timestep.
     */
    update(time) {

    }

    /**
     * Shuts down the event listeners for this plugin.
     */
    shutdown() {
        const eventEmitter = this.systems.events;

        eventEmitter.off('update', this.update, this);
        eventEmitter.off('shutdown', this.shutdown, this);
    }

    /**
     * Removes and calls `destroy` on all Stick and Button objects in this plugin.
     */
    destroy() {
        this.shutdown();

        // clean up //

    }

    test() {
        console.log("test!");
    }

    hideTooltip(id, animate) {

        if (animate) {
            let isTweening = this.scene.tweens.isTweening(this.tooltipCollection[id]);
            if (isTweening) {
                this.scene.tweens.killTweensOf(this.tooltipCollection[id]);
            }

            this.tween = this.scene.tweens.add({
                targets: this.tooltipCollection[id],
                alpha: 0,
                ease: 'Power1',
                duration: 250,
                delay: 0,
                onComplete: o => {
                    //this.tween = null;
                },
            });

        } else {
            this.tooltipCollection[id].visible = false;
        }
    }

    showTooltip(id, animate) {

        if (animate) {
            this.tooltipCollection[id].alpha = 0;
            this.tooltipCollection[id].visible = true;
            this.scene.children.bringToTop(this.tooltipCollection[id]);

            let isTweening = this.scene.tweens.isTweening(this.tooltipCollection[id]);
            if (isTweening) {
                this.scene.tweens.killTweensOf(this.tooltipCollection[id]);
            }

            this.tween = this.scene.tweens.add({
                targets: this.tooltipCollection[id],
                alpha: 1,
                ease: 'Power1',
                duration: 500,
                delay: 0,
                onComplete: o => {
                    //this.tween = null;
                },
            });
        } else {
            this.tooltipCollection[id].visible = true;
            this.scene.children.bringToTop(this.tooltipCollection[id]);
        }
    }

    /**
     *
     *
     * @param {*} options
     * @memberof FloatingTextUI
     */
    createTooltip(options) {

        let background;

        let container = this.scene.add.container(options.x, options.y);
        let content = this.createLabel(container, options.x, options.y, options);


        if (options.hasBackground) {
            background = this.createBackground(container, content, options.x, options.y, options.background.width, options.background.height, options);

            content.x = background.rect.centerX - content.displayWidth * 0.5;
            content.y = background.rect.centerY - content.displayHeight * 0.5;
        }


        container.add(content);

        container.x = options.x;
        container.y = options.y;
        console.log(options, container, background);

        this.tooltipCollection[options.id] = container;

        return container;

    }

    /**
     *
     *
     * @param {*} x
     * @param {*} y
     * @param {*} options
     * @memberof FloatingTextUI
     */
    createLabel(container, x, y, options) {

        let text = this.scene.add.text(x, y, options.text.text, {
            fontFamily: options.text.fontFamily || 'new_rockerregular',
            fontSize: options.text.fontSize || 19,
            color: options.text.textColor || "#ffffff",
            fontStyle: options.text.fontStyle || '',
            align: options.text.align || 'center'
        });

        console.log(options);


        if (options.hasShadow) {
            let shadowColor = options.text.shadowColor || "#1e1e1e";
            let blur = options.text.blur || 1;
            let shadowStroke = options.text.shadowStroke || false;
            let shadowFill = options.text.shadowFill || true;
            text.setShadow(0, 0, shadowColor, blur, shadowStroke, shadowFill);
        }

        return text;
    }

}
module.exports = FloatingNumbersPlugin;