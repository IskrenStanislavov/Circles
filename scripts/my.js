/*jslint browser: true*/
/*global $, jQuery, Zepto, _*/
/*properties
    currentTilesState, currentWinnersState, hide, html, length, log, name, on,
    ready, show, shuffle, toString, toUpperCase, toggleClass, updateTiles
*/

var onload = (function closure($) {
    'use strict';
    var STARTING_BID = 2,
        STARTING_BALANCE = 1000,
        CURRENCY = "$",
        TILE_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7],
        TILE_STYLES = [
            ['tile0winners', 'tile1winners', 'tile2winners', 'tile3winners',
                'tile4winners', 'tile5winners', 'tile6winners', 'tile7winners',
                ],//winners
            ['tile0normal', 'tile1normal', 'tile2normal', 'tile3normal',
                'tile4normal', 'tile5normal', 'tile6normal', 'tile7normal',
                ]//normal tiles
        ],
        getTileClass = (function () {
            return function (state, index) {
                return TILE_STYLES[state][index];
            };
        }()),
        randomizer = function() {
            return _.shuffle(TILE_POSITIONS);
        },
        exchangeButtons = function (showMe, callback) {
            return function () {
                $(this).hide();
                $(showMe).show();
                callback();
            };
        },
        changeStake = function() {
            console.log("change stake");
        },
        toggleAuto = (function() {
            var autoStates = ["turning auto: OFF", "turning auto: ON"],
                currentAutoState = false,
                auto = function() {
                    currentAutoState = !currentAutoState;
                    console.log(autoStates[Number(currentAutoState)]);
                    $(this).toggleClass('on');
                    $('#roll').toggleClass('disable');
                    $('#stop').toggleClass('disable');
                    $('#steak').toggleClass('disable');
                };
            return auto;
        }()),
        MakeTileGroup = function(name) {
            this.name = name;
            this.currentTilesState = undefined;
            this.currentWinnersState = undefined;
            this.updateTiles = function(tileStates, tileWinners) {
                var i = 0, tileName,
                    isOldWinner, oldValue, oldTileClass,
                    isNewWinner, newValue, newTileClass;
                for (i = 0; i < tileStates.length; i += 1) {
                    tileName = '#tile-' + this.name + i.toString(10);
                    if (this.currentTilesState !== undefined) {
                        isOldWinner = this.currentWinnersState[i];
                        oldValue = this.currentTilesState[i];
                        //console.log('unloading old styles');
                        oldTileClass = getTileClass(isOldWinner, oldValue);
                        $(tileName).toggleClass(oldTileClass);
                    }
                    isNewWinner = tileWinners[i];
                    newValue = tileStates[i];
                    newTileClass = getTileClass(isNewWinner, newValue);
                    $(tileName).toggleClass(newTileClass);
                }
                //console.log("updating " + this.name.toUpperCase() + " group");
                this.currentTilesState = tileStates;
                this.currentWinnersState = tileWinners;
                tileStates = null; //cleanup
                tileWinners = null; //cleanup
            };
        },
        leftGroup = new MakeTileGroup("left"),
        midGroup = new MakeTileGroup("mid"),
        rightGroup = new MakeTileGroup("right"),
        checkWinners = function(leftStates, midStates, rightStates) {
            var i = 0,
                result = [];
            if (leftStates.length !== 8) {
                throw "program err: Length should be 8";
            }
            for (i = 0; i < leftStates.length; i += 1) {
                if (leftStates[i] === midStates[i] &&
                        midStates[i] === rightStates[i]) {
                    result[i] = 0;//winner stake
                } else {
                    result[i] = 1;//normal stake
                }
            }
            return result;
        },
        updateTiles = function(leftStates, midStates, rightStates) {
            var whoWins = checkWinners(leftStates, midStates, rightStates);
            leftGroup.updateTiles(leftStates, whoWins);
            midGroup.updateTiles(midStates, whoWins);
            rightGroup.updateTiles(rightStates, whoWins);
        },
        singleRoll = function() {
            var leftState = randomizer(),
                midState = randomizer(),
                rightState = randomizer();
            updateTiles(leftState, midState, rightState);
        },
        startAndStopRolling = (function() {
            var roll = null,
                startRolling = function() {
                    //console.log("start rolling");
                    roll = setInterval(singleRoll, 100);
                },
                stopRolling = function() {
                    //console.log("stop rolling");
                    if (roll) {
                        clearInterval(roll);
                    }
                };
            return [startRolling, stopRolling];
        }()),
        startRolling = startAndStopRolling[0],
        stopRolling = startAndStopRolling[1],
        onload = function () {
            var bid = $("#bid"),
                balance = $("#balance");
            bid.html(STARTING_BID.toString(10) + CURRENCY);
            balance.html(STARTING_BALANCE.toString(10) + CURRENCY);
            $('#roll').on('click', exchangeButtons('#stop', startRolling));
            $('#stop').hide();
            $('#stop').on('click', exchangeButtons('#roll', stopRolling));
            $('#stake').on('click', changeStake);
            $('#auto').on('click', toggleAuto);
            singleRoll();
            return false;
        };
    getTileClass(1, 0);
    return onload;

// XXX: use SVG images
// XXX: do not change the values onReload:use cookies

}(Zepto));
//jQuery.noConflict();
$(document).ready(onload);
