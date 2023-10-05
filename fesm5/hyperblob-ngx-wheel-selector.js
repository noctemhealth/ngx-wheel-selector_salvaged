import { __decorate, __metadata, __param } from 'tslib';
import { ViewChildren, ViewChild, Input, Output, EventEmitter, Component, Inject, ElementRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

var WheelSelectorComponent = /** @class */ (function () {
    function WheelSelectorComponent(elementRef) {
        this.data = [];
        this.change = new EventEmitter();
        this.touchOrMouse = {
            isTouchable: 'ontouchstart' in window,
            isMouseDown: false
        };
        this.draggingInfo = {
            isDragging: false,
            groupIndex: null,
            startPageY: null
        };
        this.itemPerDegree = 23;
        this.safeDoTimeoutId = null;
        // console.log('picker dom', elementRef.nativeElement)
    }
    WheelSelectorComponent.prototype.ngOnInit = function () {
        this.currentIndexList = this.getInitialCurrentIndexList();
        this.lastCurrentIndexList = [].concat(this.currentIndexList);
        this.groupsRectList = new Array(this.data.length);
        this.eventsRegister();
        window.addEventListener('resize', this.safeGetRectsBindEvents.bind(this));
    };
    WheelSelectorComponent.prototype.ngAfterViewInit = function () {
        this.getGroupsRectList();
    };
    WheelSelectorComponent.prototype.ngOnDestroy = function () {
        window.removeEventListener('resize', this.safeGetRectsBindEvents.bind(this));
    };
    WheelSelectorComponent.prototype.setGroupData = function (gIndex, groupData) {
        if (!this.currentIndexList) {
            this.currentIndexList = this.getInitialCurrentIndexList();
        }
        this.data[gIndex] = groupData;
        var iCI = groupData.currentIndex;
        var movedIndex = 0;
        if (typeof iCI === 'number' && iCI >= 0 && groupData.list && groupData.list.length && iCI <= groupData.list.length - 1) {
            movedIndex = Math.round(iCI);
        }
        this.currentIndexList[gIndex] = movedIndex;
        this.lastCurrentIndexList = [].concat(this.currentIndexList);
    };
    WheelSelectorComponent.prototype.getInitialCurrentIndexList = function () {
        return this.data.map(function (item, index) {
            var iCI = item.currentIndex;
            if (typeof iCI === 'number' && iCI >= 0 && item.list && item.list.length && iCI <= item.list.length - 1) {
                return Math.round(iCI);
            }
            return 0;
        });
    };
    WheelSelectorComponent.prototype.safeGetRectsBindEvents = function () {
        var _this = this;
        if (this.safeDoTimeoutId) {
            clearTimeout(this.safeDoTimeoutId);
        }
        this.safeDoTimeoutId = setTimeout(function () {
            _this.getGroupsRectList();
        }, 200);
    };
    WheelSelectorComponent.prototype.getGroupsRectList = function () {
        var _this = this;
        if (this.pickerGroupLayer) {
            this.pickerGroupLayer.toArray().forEach(function (item, index) {
                _this.groupsRectList[index] = item.nativeElement.getBoundingClientRect();
            });
        }
    };
    WheelSelectorComponent.prototype.eventsRegister = function () {
        var handleEventLayer = this.pickerHandleLayer.nativeElement;
        if (handleEventLayer) {
            this.addEventsForElement(handleEventLayer);
        }
    };
    WheelSelectorComponent.prototype.addEventsForElement = function (el) {
        var _this = this;
        var _ = this.touchOrMouse.isTouchable;
        var eventHandlerList = [
            { name: _ ? 'touchstart' : 'mousedown', handler: this.handleStart },
            { name: _ ? 'touchmove' : 'mousemove', handler: this.handleMove },
            { name: _ ? 'touchend' : 'mouseup', handler: this.handleEnd },
            { name: _ ? 'touchcancel' : 'mouseleave', handler: this.handleCancel }
        ];
        if (!_) {
            eventHandlerList.push({
                name: 'wheel',
                handler: this.handleWheel
            });
        }
        eventHandlerList.forEach(function (item, index) {
            el.removeEventListener(item.name, item.handler, false);
            el.addEventListener(item.name, item.handler.bind(_this), false);
        });
    };
    WheelSelectorComponent.prototype.triggerMiddleLayerGroupClick = function (gIndex) {
        var data = this.data;
        if (typeof gIndex === 'number' && typeof data[gIndex].onClick === 'function') {
            data[gIndex].onClick(gIndex, this.currentIndexList[gIndex]);
        }
    };
    WheelSelectorComponent.prototype.triggerAboveLayerClick = function (ev, gIndex) {
        var movedIndex = this.currentIndexList[gIndex] + 1;
        this.currentIndexList[gIndex] = movedIndex;
        this.correctionCurrentIndex(ev, gIndex);
    };
    WheelSelectorComponent.prototype.triggerMiddleLayerClick = function (ev, gIndex) {
        this.triggerMiddleLayerGroupClick(gIndex);
    };
    WheelSelectorComponent.prototype.triggerBelowLayerClick = function (ev, gIndex) {
        var movedIndex = this.currentIndexList[gIndex] - 1;
        this.currentIndexList[gIndex] = movedIndex;
        this.correctionCurrentIndex(ev, gIndex);
    };
    WheelSelectorComponent.prototype.getTouchInfo = function (ev) {
        return this.touchOrMouse.isTouchable ? ev.changedTouches[0] || ev.touches[0] : ev;
    };
    WheelSelectorComponent.prototype.getGroupIndexBelongsEvent = function (ev) {
        var touchInfo = this.getTouchInfo(ev);
        for (var i = 0; i < this.groupsRectList.length; i++) {
            var item = this.groupsRectList[i];
            if (item.left < touchInfo.pageX && touchInfo.pageX < item.right) {
                return i;
            }
        }
        return null;
    };
    WheelSelectorComponent.prototype.handleEventClick = function (ev) {
        var gIndex = this.getGroupIndexBelongsEvent(ev);
        switch (ev.target.dataset.type) {
            case 'top':
                this.triggerAboveLayerClick(ev, gIndex);
                break;
            case 'middle':
                this.triggerMiddleLayerClick(ev, gIndex);
                break;
            case 'bottom':
                this.triggerBelowLayerClick(ev, gIndex);
                break;
            default:
        }
    };
    WheelSelectorComponent.prototype.handleStart = function (ev) {
        if (ev.cancelable) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        var touchInfo = this.getTouchInfo(ev);
        this.draggingInfo.startPageY = touchInfo.pageY;
        if (!this.touchOrMouse.isTouchable) {
            this.touchOrMouse.isMouseDown = true;
        }
    };
    WheelSelectorComponent.prototype.handleMove = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.touchOrMouse.isTouchable || this.touchOrMouse.isMouseDown) {
            this.draggingInfo.isDragging = true;
            this.setCurrentIndexOnMove(ev);
        }
    };
    WheelSelectorComponent.prototype.handleEnd = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!this.draggingInfo.isDragging) {
            this.handleEventClick(ev);
        }
        this.draggingInfo.isDragging = false;
        this.touchOrMouse.isMouseDown = false;
        this.correctionAfterDragging(ev);
    };
    WheelSelectorComponent.prototype.handleCancel = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.touchOrMouse.isTouchable || this.touchOrMouse.isMouseDown) {
            this.correctionAfterDragging(ev);
            this.touchOrMouse.isMouseDown = false;
            this.draggingInfo.isDragging = false;
        }
    };
    WheelSelectorComponent.prototype.handleWheel = function (ev) {
        this.setCurrentIndexOnWheel(ev);
        this.correctionAfterDragging(ev);
    };
    WheelSelectorComponent.prototype.setCurrentIndexOnWheel = function (ev) {
        var gIndex = this.getGroupIndexBelongsEvent(ev);
        if (typeof gIndex === 'number' && (this.data[gIndex].divider || !this.data[gIndex].list)) {
            return;
        }
        var movedIndex = this.currentIndexList[gIndex] + (ev.deltaY / 53);
        this.currentIndexList[gIndex] = movedIndex;
        this.correctionCurrentIndex(ev, gIndex);
    };
    WheelSelectorComponent.prototype.setCurrentIndexOnMove = function (ev) {
        var touchInfo = this.getTouchInfo(ev);
        if (this.draggingInfo.groupIndex === null) {
            this.draggingInfo.groupIndex = this.getGroupIndexBelongsEvent(ev);
        }
        var gIndex = this.draggingInfo.groupIndex;
        if (typeof gIndex === 'number' && (this.data[gIndex].divider || !this.data[gIndex].list)) {
            return;
        }
        var moveCount = (this.draggingInfo.startPageY - touchInfo.pageY) / 32;
        var movedIndex = this.currentIndexList[gIndex] + moveCount;
        this.currentIndexList[gIndex] = movedIndex;
        this.draggingInfo.startPageY = touchInfo.pageY;
    };
    WheelSelectorComponent.prototype.correctionAfterDragging = function (ev) {
        var gIndex = this.draggingInfo.groupIndex;
        this.correctionCurrentIndex(ev, gIndex);
        this.draggingInfo.groupIndex = null;
        this.draggingInfo.startPageY = null;
    };
    WheelSelectorComponent.prototype.correctionCurrentIndex = function (ev, gIndex) {
        var _this = this;
        setTimeout(function () {
            if (typeof gIndex === 'number' && _this.data[gIndex].divider !== true && _this.data[gIndex].list.length > 0) {
                var unsafeGroupIndex = _this.currentIndexList[gIndex];
                var movedIndex = unsafeGroupIndex;
                if (unsafeGroupIndex > _this.data[gIndex].list.length - 1) {
                    movedIndex = _this.data[gIndex].list.length - 1;
                }
                else if (unsafeGroupIndex < 0) {
                    movedIndex = 0;
                }
                movedIndex = Math.round(movedIndex);
                _this.currentIndexList[gIndex] = movedIndex;
                if (movedIndex !== _this.lastCurrentIndexList[gIndex]) {
                    _this.change.emit({ gIndex: gIndex, iIndex: movedIndex });
                }
                _this.lastCurrentIndexList = [].concat(_this.currentIndexList);
            }
        }, 100);
    };
    WheelSelectorComponent.prototype.isCurrentItem = function (gIndex, iIndex) {
        return this.currentIndexList[gIndex] === iIndex;
    };
    WheelSelectorComponent.prototype.getCurrentIndexList = function () {
        return this.currentIndexList;
    };
    WheelSelectorComponent.prototype.getGroupClass = function (gIndex) {
        var group = this.data[gIndex];
        var defaultWeightClass = 'weight-' + (group.weight || 1);
        var groupClass = [defaultWeightClass];
        if (group.className) {
            groupClass.push(group.className);
        }
        return groupClass;
    };
    WheelSelectorComponent.prototype.getItemClass = function (gIndex, iIndex, isDivider) {
        if (isDivider === void 0) { isDivider = false; }
        var group = this.data[gIndex];
        var itemClass = [];
        if (!isDivider && this.isCurrentItem(gIndex, iIndex)) {
            itemClass.push('smooth-item-selected');
        }
        if (group.textAlign) {
            itemClass.push('text-' + group.textAlign);
        }
        return itemClass;
    };
    WheelSelectorComponent.prototype.getItemStyle = function (gIndex, iIndex) {
        var gapCount = this.currentIndexList[gIndex] - iIndex;
        if (Math.abs(gapCount) < (90 / this.itemPerDegree)) {
            var rotateStyle = {
                transform: 'rotateX(' + gapCount * this.itemPerDegree + 'deg) translate3d(0, 0, 5.625em)',
                opacity: (1 - Math.abs(gapCount) / (90 / this.itemPerDegree)).toString()
            };
            if (!this.draggingInfo.isDragging) {
                rotateStyle['transition'] = 'transform 150ms ease-out';
            }
            return rotateStyle;
        }
        if (gapCount > 0) {
            return { transform: 'rotateX(90deg) translate3d(0, 0, 5.625em)' };
        }
        else {
            return { transform: 'rotateX(-90deg) translate3d(0, 0, 5.625em)' };
        }
    };
    __decorate([
        ViewChildren('pickerGroupLayer'),
        __metadata("design:type", Object)
    ], WheelSelectorComponent.prototype, "pickerGroupLayer", void 0);
    __decorate([
        ViewChild('pickerHandleLayer'),
        __metadata("design:type", Object)
    ], WheelSelectorComponent.prototype, "pickerHandleLayer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], WheelSelectorComponent.prototype, "data", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], WheelSelectorComponent.prototype, "change", void 0);
    WheelSelectorComponent = __decorate([
        Component({
            selector: 'ngx-wheel-selector',
            template: "<div class=\"ng-data-picker flex-box\">\n\n  <!-- picker-group-layer -->\n  <div #pickerGroupLayer *ngFor=\"let group of data; let gIndex = index\"\n    class=\"picker-group\" [ngClass]=\"getGroupClass(gIndex)\">\n\n    <div class=\"picker-list\">\n      <ng-container *ngFor=\"let item of group.list; let iIndex = index\">\n        <div *ngIf=\"group.divider else ngIfElse\"\n          class=\"picker-item divider\" [ngClass]=\"getItemClass(gIndex, iIndex, true)\">\n          {{ group.text }}\n        </div>\n  \n        <ng-template #ngIfElse>\n          <div \n            class=\"picker-item\" [ngClass]=\"getItemClass(gIndex, iIndex)\" [ngStyle]=\"getItemStyle(gIndex, iIndex)\">\n            {{ item.value || item }}\n          </div>\n        </ng-template>\n      </ng-container>\n    </div>\n\n  </div>\n\n  <div #pickerHandleLayer class=\"picker-handle-layer flex-box dir-column\">\n    <div data-type=\"top\" class=\"picker-top weight-1\"></div>\n    <div data-type=\"middle\" class=\"picker-middle\"></div>\n    <div data-type=\"bottom\" class=\"picker-bottom weight-1\"></div>\n  </div>\n\n</div>",
            styles: [".ng-data-picker{font-size:1rem;height:10em;position:relative;background-color:#fff;overflow:hidden}.ng-data-picker.black{color:#fff}.ng-data-picker .picker-item{position:absolute;top:0;left:0;overflow:hidden;width:100%;text-overflow:ellipsis;white-space:nowrap;display:block;text-align:center;will-change:transform;contain:strict;height:2em;line-height:2;font-size:1em}.ng-data-picker .picker-list{height:6.25em;position:relative;top:4em}.ng-data-picker .picker-handle-layer{position:absolute;width:100%;height:calc(100% + 2px);left:0;right:0;top:-1px;bottom:-1px}.ng-data-picker .picker-handle-layer .picker-top{border-bottom:.55px solid rgba(74,73,89,.5);background:linear-gradient(to bottom,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.ng-data-picker .picker-handle-layer .picker-middle{height:2em}.ng-data-picker .picker-handle-layer .picker-bottom{border-top:.55px solid rgba(74,73,89,.5);background:linear-gradient(to top,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.flex-box{display:flex}.flex-box.dir-column{flex-direction:column}.flex-box.dir-row{flex-direction:row}.flex-box .weight-1{flex:1}.flex-box .weight-2{flex:2}.flex-box .weight-3{flex:3}.flex-box .weight-4{flex:4}.flex-box .weight-5{flex:5}.flex-box .weight-6{flex:6}.flex-box .weight-7{flex:7}.flex-box .weight-8{flex:8}.flex-box .weight-9{flex:9}.flex-box .weight-10{flex:10}.flex-box .weight-11{flex:11}.flex-box .weight-12{flex:12}"]
        }),
        __param(0, Inject(ElementRef)),
        __metadata("design:paramtypes", [ElementRef])
    ], WheelSelectorComponent);
    return WheelSelectorComponent;
}());

var WheelSelectorModule = /** @class */ (function () {
    function WheelSelectorModule() {
    }
    WheelSelectorModule = __decorate([
        NgModule({
            imports: [
                CommonModule
            ],
            declarations: [WheelSelectorComponent],
            exports: [WheelSelectorComponent]
        })
    ], WheelSelectorModule);
    return WheelSelectorModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { WheelSelectorComponent, WheelSelectorModule };
//# sourceMappingURL=hyperblob-ngx-wheel-selector.js.map
