import * as tslib_1 from "tslib";
import { Inject, Component, Input, Output, EventEmitter, ElementRef, ViewChild, ViewChildren } from '@angular/core';
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
    tslib_1.__decorate([
        ViewChildren('pickerGroupLayer'),
        tslib_1.__metadata("design:type", Object)
    ], WheelSelectorComponent.prototype, "pickerGroupLayer", void 0);
    tslib_1.__decorate([
        ViewChild('pickerHandleLayer'),
        tslib_1.__metadata("design:type", Object)
    ], WheelSelectorComponent.prototype, "pickerHandleLayer", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Array)
    ], WheelSelectorComponent.prototype, "data", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", EventEmitter)
    ], WheelSelectorComponent.prototype, "change", void 0);
    WheelSelectorComponent = tslib_1.__decorate([
        Component({
            selector: 'ngx-wheel-selector',
            template: "<div class=\"ng-data-picker flex-box\">\n\n  <!-- picker-group-layer -->\n  <div #pickerGroupLayer *ngFor=\"let group of data; let gIndex = index\"\n    class=\"picker-group\" [ngClass]=\"getGroupClass(gIndex)\">\n\n    <div class=\"picker-list\">\n      <ng-container *ngFor=\"let item of group.list; let iIndex = index\">\n        <div *ngIf=\"group.divider else ngIfElse\"\n          class=\"picker-item divider\" [ngClass]=\"getItemClass(gIndex, iIndex, true)\">\n          {{ group.text }}\n        </div>\n  \n        <ng-template #ngIfElse>\n          <div \n            class=\"picker-item\" [ngClass]=\"getItemClass(gIndex, iIndex)\" [ngStyle]=\"getItemStyle(gIndex, iIndex)\">\n            {{ item.value || item }}\n          </div>\n        </ng-template>\n      </ng-container>\n    </div>\n\n  </div>\n\n  <div #pickerHandleLayer class=\"picker-handle-layer flex-box dir-column\">\n    <div data-type=\"top\" class=\"picker-top weight-1\"></div>\n    <div data-type=\"middle\" class=\"picker-middle\"></div>\n    <div data-type=\"bottom\" class=\"picker-bottom weight-1\"></div>\n  </div>\n\n</div>",
            styles: [".ng-data-picker{font-size:1rem;height:10em;position:relative;background-color:#fff;overflow:hidden}.ng-data-picker.black{color:#fff}.ng-data-picker .picker-item{position:absolute;top:0;left:0;overflow:hidden;width:100%;text-overflow:ellipsis;white-space:nowrap;display:block;text-align:center;will-change:transform;contain:strict;height:2em;line-height:2;font-size:1em}.ng-data-picker .picker-list{height:6.25em;position:relative;top:4em}.ng-data-picker .picker-handle-layer{position:absolute;width:100%;height:calc(100% + 2px);left:0;right:0;top:-1px;bottom:-1px}.ng-data-picker .picker-handle-layer .picker-top{border-bottom:.55px solid rgba(74,73,89,.5);background:linear-gradient(to bottom,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.ng-data-picker .picker-handle-layer .picker-middle{height:2em}.ng-data-picker .picker-handle-layer .picker-bottom{border-top:.55px solid rgba(74,73,89,.5);background:linear-gradient(to top,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.flex-box{display:flex}.flex-box.dir-column{flex-direction:column}.flex-box.dir-row{flex-direction:row}.flex-box .weight-1{flex:1}.flex-box .weight-2{flex:2}.flex-box .weight-3{flex:3}.flex-box .weight-4{flex:4}.flex-box .weight-5{flex:5}.flex-box .weight-6{flex:6}.flex-box .weight-7{flex:7}.flex-box .weight-8{flex:8}.flex-box .weight-9{flex:9}.flex-box .weight-10{flex:10}.flex-box .weight-11{flex:11}.flex-box .weight-12{flex:12}"]
        }),
        tslib_1.__param(0, Inject(ElementRef)),
        tslib_1.__metadata("design:paramtypes", [ElementRef])
    ], WheelSelectorComponent);
    return WheelSelectorComponent;
}());
export { WheelSelectorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hlZWwtc2VsZWN0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGh5cGVyYmxvYi9uZ3gtd2hlZWwtc2VsZWN0b3IvIiwic291cmNlcyI6WyJzcmMvYXBwL3doZWVsLXNlbGVjdG9yL3doZWVsLXNlbGVjdG9yL3doZWVsLXNlbGVjdG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUM2QixNQUFNLEVBQUUsU0FBUyxFQUNuRCxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFDakUsTUFBTSxlQUFlLENBQUE7QUFXdEI7SUF3QkUsZ0NBQWdDLFVBQXNCO1FBbEI3QyxTQUFJLEdBQW9CLEVBQUUsQ0FBQztRQUMxQixXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFLOUQsaUJBQVksR0FBRztZQUNiLFdBQVcsRUFBRSxjQUFjLElBQUksTUFBTTtZQUNyQyxXQUFXLEVBQUUsS0FBSztTQUNuQixDQUFDO1FBQ0YsaUJBQVksR0FBRztZQUNiLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1NBQ2pCLENBQUM7UUFDRixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNuQixvQkFBZSxHQUFRLElBQUksQ0FBQztRQUcxQixzREFBc0Q7SUFDeEQsQ0FBQztJQUVELHlDQUFRLEdBQVI7UUFDRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDMUQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFN0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxELElBQUksQ0FBQyxjQUFjLEVBQUUs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Q0FBQyxtQkFBbUIsQ0FBQzs7cUVBQ2I7SUFFVDtRQUFSLEtBQUssRUFBRTs7d0RBQTRCO0lBQzFCO1FBQVQsTUFBTSxFQUFFOzBDQUFTLFlBQVk7MERBQWdDO0lBUG5ELHNCQUFzQjtRQUxsQyxTQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLG1tQ0FBOEM7O1NBRS9DLENBQUM7UUF5QmEsbUJBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO2lEQUFhLFVBQVU7T0F4QjNDLHNCQUFzQixDQWlVbEM7SUFBRCw2QkFBQztDQUFBLEFBalVELElBaVVDO1NBalVZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBJbmplY3QsIENvbXBvbmVudCxcbiAgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmLCBWaWV3Q2hpbGQsIFZpZXdDaGlsZHJlblxufSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuXG5pbXBvcnQgeyBTZWxlY3Rvck1vZGVsIH0gZnJvbSAnLi93aGVlbC1zZWxlY3Rvci5tb2RlbHMnXG5cbmV4cG9ydCB7IFNlbGVjdG9yTW9kZWwgYXMgUGlja2VyRGF0YU1vZGVsIH1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmd4LXdoZWVsLXNlbGVjdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3doZWVsLXNlbGVjdG9yLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vd2hlZWwtc2VsZWN0b3IuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBXaGVlbFNlbGVjdG9yQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICBAVmlld0NoaWxkcmVuKCdwaWNrZXJHcm91cExheWVyJylcbiAgcGlja2VyR3JvdXBMYXllcjtcbiAgQFZpZXdDaGlsZCgncGlja2VySGFuZGxlTGF5ZXInKVxuICBwaWNrZXJIYW5kbGVMYXllcjtcblxuICBASW5wdXQoKSBkYXRhOiBTZWxlY3Rvck1vZGVsW10gPSBbXTtcbiAgQE91dHB1dCgpIGNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBjdXJyZW50SW5kZXhMaXN0OiBudW1iZXJbXTtcbiAgbGFzdEN1cnJlbnRJbmRleExpc3Q6IG51bWJlcltdO1xuICBncm91cHNSZWN0TGlzdDogYW55W107XG4gIHRvdWNoT3JNb3VzZSA9IHtcbiAgICBpc1RvdWNoYWJsZTogJ29udG91Y2hzdGFydCcgaW4gd2luZG93LFxuICAgIGlzTW91c2VEb3duOiBmYWxzZVxuICB9O1xuICBkcmFnZ2luZ0luZm8gPSB7XG4gICAgaXNEcmFnZ2luZzogZmFsc2UsXG4gICAgZ3JvdXBJbmRleDogbnVsbCxcbiAgICBzdGFydFBhZ2VZOiBudWxsXG4gIH07XG4gIGl0ZW1QZXJEZWdyZWUgPSAyMztcbiAgc2FmZURvVGltZW91dElkOiBhbnkgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRWxlbWVudFJlZikgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xuICAgIC8vIGNvbnNvbGUubG9nKCdwaWNrZXIgZG9tJywgZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5jdXJyZW50SW5kZXhMaXN0ID0gdGhpcy5nZXRJbml0aWFsQ3VycmVudEluZGV4TGlzdCgpO1xuICAgIHRoaXMubGFzdEN1cnJlbnRJbmRleExpc3QgPSBbXS5jb25jYXQodGhpcy5jdXJyZW50SW5kZXhMaXN0KTtcblxuICAgIHRoaXMuZ3JvdXBzUmVjdExpc3QgPSBuZXcgQXJyYXkodGhpcy5kYXRhLmxlbmd0aCk7XG5cbiAgICB0aGlzLmV2ZW50c1JlZ2lzdGVyKCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuc2FmZUdldFJlY3RzQmluZEV2ZW50cy5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLmdldEdyb3Vwc1JlY3RMaXN0KCk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5zYWZlR2V0UmVjdHNCaW5kRXZlbnRzLmJpbmQodGhpcykpO1xuICB9XG5cbiAgc2V0R3JvdXBEYXRhKGdJbmRleCwgZ3JvdXBEYXRhKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRJbmRleExpc3QpIHtcbiAgICAgIHRoaXMuY3VycmVudEluZGV4TGlzdCA9IHRoaXMuZ2V0SW5pdGlhbEN1cnJlbnRJbmRleExpc3QoKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhW2dJbmRleF0gPSBncm91cERhdGE7XG4gICAgY29uc3QgaUNJID0gZ3JvdXBEYXRhLmN1cnJlbnRJbmRleDtcbiAgICBsZXQgbW92ZWRJbmRleCA9IDA7XG4gICAgaWYgKHR5cGVvZiBpQ0kgPT09ICdudW1iZXInICYmIGlDSSA+PSAwICYmIGdyb3VwRGF0YS5saXN0ICYmIGdyb3VwRGF0YS5saXN0Lmxlbmd0aCAmJiBpQ0kgPD0gZ3JvdXBEYXRhLmxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgbW92ZWRJbmRleCA9IE1hdGgucm91bmQoaUNJKTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0gPSBtb3ZlZEluZGV4O1xuICAgIHRoaXMubGFzdEN1cnJlbnRJbmRleExpc3QgPSBbXS5jb25jYXQodGhpcy5jdXJyZW50SW5kZXhMaXN0KTtcbiAgfVxuXG4gIGdldEluaXRpYWxDdXJyZW50SW5kZXhMaXN0KCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgaUNJID0gaXRlbS5jdXJyZW50SW5kZXg7XG4gICAgICBpZiAodHlwZW9mIGlDSSA9PT0gJ251bWJlcicgJiYgaUNJID49IDAgJiYgaXRlbS5saXN0ICYmIGl0ZW0ubGlzdC5sZW5ndGggJiYgaUNJIDw9IGl0ZW0ubGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGlDSSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gMDtcbiAgICB9KTtcbiAgfVxuXG4gIHNhZmVHZXRSZWN0c0JpbmRFdmVudHMoKSB7XG4gICAgaWYgKHRoaXMuc2FmZURvVGltZW91dElkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5zYWZlRG9UaW1lb3V0SWQpO1xuICAgIH1cbiAgICB0aGlzLnNhZmVEb1RpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5nZXRHcm91cHNSZWN0TGlzdCgpO1xuICAgIH0sIDIwMCk7XG4gIH1cblxuICBnZXRHcm91cHNSZWN0TGlzdCgpIHtcbiAgICBpZiAodGhpcy5waWNrZXJHcm91cExheWVyKSB7XG4gICAgICB0aGlzLnBpY2tlckdyb3VwTGF5ZXIudG9BcnJheSgpLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIHRoaXMuZ3JvdXBzUmVjdExpc3RbaW5kZXhdID0gaXRlbS5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZXZlbnRzUmVnaXN0ZXIoKSB7XG4gICAgY29uc3QgaGFuZGxlRXZlbnRMYXllciA9IHRoaXMucGlja2VySGFuZGxlTGF5ZXIubmF0aXZlRWxlbWVudDtcbiAgICBpZiAoaGFuZGxlRXZlbnRMYXllcikge1xuICAgICAgdGhpcy5hZGRFdmVudHNGb3JFbGVtZW50KGhhbmRsZUV2ZW50TGF5ZXIpO1xuICAgIH1cbiAgfVxuXG4gIGFkZEV2ZW50c0ZvckVsZW1lbnQoZWwpIHtcbiAgICBjb25zdCBfID0gdGhpcy50b3VjaE9yTW91c2UuaXNUb3VjaGFibGU7XG4gICAgY29uc3QgZXZlbnRIYW5kbGVyTGlzdCA9IFtcbiAgICAgIHtuYW1lOiBfID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bicsIGhhbmRsZXI6IHRoaXMuaGFuZGxlU3RhcnR9LFxuICAgICAge25hbWU6IF8gPyAndG91Y2htb3ZlJyA6ICdtb3VzZW1vdmUnLCBoYW5kbGVyOiB0aGlzLmhhbmRsZU1vdmV9LFxuICAgICAge25hbWU6IF8gPyAndG91Y2hlbmQnIDogJ21vdXNldXAnLCBoYW5kbGVyOiB0aGlzLmhhbmRsZUVuZH0sXG4gICAgICB7bmFtZTogXyA/ICd0b3VjaGNhbmNlbCcgOiAnbW91c2VsZWF2ZScsIGhhbmRsZXI6IHRoaXMuaGFuZGxlQ2FuY2VsfVxuICAgIF07XG4gICAgaWYgKCFfKSB7XG4gICAgICBldmVudEhhbmRsZXJMaXN0LnB1c2goe1xuICAgICAgICBuYW1lOiAnd2hlZWwnLFxuICAgICAgICBoYW5kbGVyOiB0aGlzLmhhbmRsZVdoZWVsXG4gICAgICB9KTtcbiAgICB9XG4gICAgZXZlbnRIYW5kbGVyTGlzdC5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtLm5hbWUsIGl0ZW0uaGFuZGxlciwgZmFsc2UpO1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihpdGVtLm5hbWUsIGl0ZW0uaGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cblxuICB0cmlnZ2VyTWlkZGxlTGF5ZXJHcm91cENsaWNrKGdJbmRleCkge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgaWYgKHR5cGVvZiBnSW5kZXggPT09ICdudW1iZXInICYmIHR5cGVvZiBkYXRhW2dJbmRleF0ub25DbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZGF0YVtnSW5kZXhdLm9uQ2xpY2soZ0luZGV4LCB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSk7XG4gICAgfVxuICB9XG5cbiAgdHJpZ2dlckFib3ZlTGF5ZXJDbGljayhldiwgZ0luZGV4KSB7XG4gICAgY29uc3QgbW92ZWRJbmRleCA9IHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdICsgMTtcbiAgICB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSA9IG1vdmVkSW5kZXg7XG4gICAgdGhpcy5jb3JyZWN0aW9uQ3VycmVudEluZGV4KGV2LCBnSW5kZXgpO1xuICB9XG5cbiAgdHJpZ2dlck1pZGRsZUxheWVyQ2xpY2soZXYsIGdJbmRleCkge1xuICAgIHRoaXMudHJpZ2dlck1pZGRsZUxheWVyR3JvdXBDbGljayhnSW5kZXgpO1xuICB9XG5cbiAgdHJpZ2dlckJlbG93TGF5ZXJDbGljayhldiwgZ0luZGV4KSB7XG4gICAgY29uc3QgbW92ZWRJbmRleCA9IHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdIC0gMTtcbiAgICB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSA9IG1vdmVkSW5kZXg7XG4gICAgdGhpcy5jb3JyZWN0aW9uQ3VycmVudEluZGV4KGV2LCBnSW5kZXgpO1xuICB9XG5cbiAgZ2V0VG91Y2hJbmZvKGV2KSB7XG4gICAgcmV0dXJuIHRoaXMudG91Y2hPck1vdXNlLmlzVG91Y2hhYmxlID8gZXYuY2hhbmdlZFRvdWNoZXNbMF0gfHwgZXYudG91Y2hlc1swXSA6IGV2O1xuICB9XG5cbiAgZ2V0R3JvdXBJbmRleEJlbG9uZ3NFdmVudChldikge1xuICAgIGNvbnN0IHRvdWNoSW5mbyA9IHRoaXMuZ2V0VG91Y2hJbmZvKGV2KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JvdXBzUmVjdExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdyb3Vwc1JlY3RMaXN0W2ldO1xuICAgICAgaWYgKGl0ZW0ubGVmdCA8IHRvdWNoSW5mby5wYWdlWCAmJiB0b3VjaEluZm8ucGFnZVggPCBpdGVtLnJpZ2h0KSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50Q2xpY2soZXYpIHtcbiAgICBjb25zdCBnSW5kZXggPSB0aGlzLmdldEdyb3VwSW5kZXhCZWxvbmdzRXZlbnQoZXYpO1xuICAgIHN3aXRjaCAoZXYudGFyZ2V0LmRhdGFzZXQudHlwZSkge1xuICAgICAgY2FzZSAndG9wJzpcbiAgICAgICAgdGhpcy50cmlnZ2VyQWJvdmVMYXllckNsaWNrKGV2LCBnSW5kZXgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21pZGRsZSc6XG4gICAgICAgIHRoaXMudHJpZ2dlck1pZGRsZUxheWVyQ2xpY2soZXYsIGdJbmRleCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYm90dG9tJzpcbiAgICAgICAgdGhpcy50cmlnZ2VyQmVsb3dMYXllckNsaWNrKGV2LCBnSW5kZXgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlU3RhcnQoZXYpIHtcbiAgICBpZiAoZXYuY2FuY2VsYWJsZSkge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgICBjb25zdCB0b3VjaEluZm8gPSB0aGlzLmdldFRvdWNoSW5mbyhldik7XG4gICAgdGhpcy5kcmFnZ2luZ0luZm8uc3RhcnRQYWdlWSA9IHRvdWNoSW5mby5wYWdlWTtcbiAgICBpZiAoIXRoaXMudG91Y2hPck1vdXNlLmlzVG91Y2hhYmxlKSB7XG4gICAgICB0aGlzLnRvdWNoT3JNb3VzZS5pc01vdXNlRG93biA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTW92ZShldikge1xuICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgaWYgKHRoaXMudG91Y2hPck1vdXNlLmlzVG91Y2hhYmxlIHx8IHRoaXMudG91Y2hPck1vdXNlLmlzTW91c2VEb3duKSB7XG4gICAgICB0aGlzLmRyYWdnaW5nSW5mby5pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuc2V0Q3VycmVudEluZGV4T25Nb3ZlKGV2KTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVFbmQoZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICghdGhpcy5kcmFnZ2luZ0luZm8uaXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5oYW5kbGVFdmVudENsaWNrKGV2KTtcbiAgICB9XG4gICAgdGhpcy5kcmFnZ2luZ0luZm8uaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIHRoaXMudG91Y2hPck1vdXNlLmlzTW91c2VEb3duID0gZmFsc2U7XG4gICAgdGhpcy5jb3JyZWN0aW9uQWZ0ZXJEcmFnZ2luZyhldik7XG4gIH1cblxuICBoYW5kbGVDYW5jZWwoZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLnRvdWNoT3JNb3VzZS5pc1RvdWNoYWJsZSB8fCB0aGlzLnRvdWNoT3JNb3VzZS5pc01vdXNlRG93bikge1xuICAgICAgdGhpcy5jb3JyZWN0aW9uQWZ0ZXJEcmFnZ2luZyhldik7XG4gICAgICB0aGlzLnRvdWNoT3JNb3VzZS5pc01vdXNlRG93biA9IGZhbHNlO1xuICAgICAgdGhpcy5kcmFnZ2luZ0luZm8uaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZVdoZWVsKGV2KSB7XG5cbiAgICB0aGlzLnNldEN1cnJlbnRJbmRleE9uV2hlZWwoZXYpO1xuICAgIHRoaXMuY29ycmVjdGlvbkFmdGVyRHJhZ2dpbmcoZXYpO1xuXG4gIH1cblxuICBzZXRDdXJyZW50SW5kZXhPbldoZWVsKGV2KSB7XG5cbiAgICBjb25zdCBnSW5kZXggPSB0aGlzLmdldEdyb3VwSW5kZXhCZWxvbmdzRXZlbnQoZXYpO1xuICAgIGlmICh0eXBlb2YgZ0luZGV4ID09PSAnbnVtYmVyJyAmJiAodGhpcy5kYXRhW2dJbmRleF0uZGl2aWRlciB8fCAhdGhpcy5kYXRhW2dJbmRleF0ubGlzdCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtb3ZlZEluZGV4ID0gdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0gKyAoZXYuZGVsdGFZIC8gNTMpO1xuICAgIHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdID0gbW92ZWRJbmRleDtcblxuICAgIHRoaXMuY29ycmVjdGlvbkN1cnJlbnRJbmRleChldiwgZ0luZGV4KTtcblxuICB9XG5cbiAgc2V0Q3VycmVudEluZGV4T25Nb3ZlKGV2KSB7XG4gICAgY29uc3QgdG91Y2hJbmZvID0gdGhpcy5nZXRUb3VjaEluZm8oZXYpO1xuICAgIGlmICh0aGlzLmRyYWdnaW5nSW5mby5ncm91cEluZGV4ID09PSBudWxsKSB7XG4gICAgICB0aGlzLmRyYWdnaW5nSW5mby5ncm91cEluZGV4ID0gdGhpcy5nZXRHcm91cEluZGV4QmVsb25nc0V2ZW50KGV2KTtcbiAgICB9XG4gICAgY29uc3QgZ0luZGV4ID0gdGhpcy5kcmFnZ2luZ0luZm8uZ3JvdXBJbmRleDtcbiAgICBpZiAodHlwZW9mIGdJbmRleCA9PT0gJ251bWJlcicgJiYgKHRoaXMuZGF0YVtnSW5kZXhdLmRpdmlkZXIgfHwgIXRoaXMuZGF0YVtnSW5kZXhdLmxpc3QpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1vdmVDb3VudCA9ICh0aGlzLmRyYWdnaW5nSW5mby5zdGFydFBhZ2VZIC0gdG91Y2hJbmZvLnBhZ2VZKSAvIDMyO1xuICAgIGNvbnN0IG1vdmVkSW5kZXggPSB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSArIG1vdmVDb3VudDtcbiAgICB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSA9IG1vdmVkSW5kZXg7XG4gICAgdGhpcy5kcmFnZ2luZ0luZm8uc3RhcnRQYWdlWSA9IHRvdWNoSW5mby5wYWdlWTtcbiAgfVxuXG4gIGNvcnJlY3Rpb25BZnRlckRyYWdnaW5nKGV2KSB7XG4gICAgY29uc3QgZ0luZGV4ID0gdGhpcy5kcmFnZ2luZ0luZm8uZ3JvdXBJbmRleDtcbiAgICB0aGlzLmNvcnJlY3Rpb25DdXJyZW50SW5kZXgoZXYsIGdJbmRleCk7XG4gICAgdGhpcy5kcmFnZ2luZ0luZm8uZ3JvdXBJbmRleCA9IG51bGw7XG4gICAgdGhpcy5kcmFnZ2luZ0luZm8uc3RhcnRQYWdlWSA9IG51bGw7XG4gIH1cblxuICBjb3JyZWN0aW9uQ3VycmVudEluZGV4KGV2LCBnSW5kZXgpIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgZ0luZGV4ID09PSAnbnVtYmVyJyAmJiB0aGlzLmRhdGFbZ0luZGV4XS5kaXZpZGVyICE9PSB0cnVlICYmIHRoaXMuZGF0YVtnSW5kZXhdLmxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB1bnNhZmVHcm91cEluZGV4ID0gdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF07XG4gICAgICAgIGxldCBtb3ZlZEluZGV4ID0gdW5zYWZlR3JvdXBJbmRleDtcbiAgICAgICAgaWYgKHVuc2FmZUdyb3VwSW5kZXggPiB0aGlzLmRhdGFbZ0luZGV4XS5saXN0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBtb3ZlZEluZGV4ID0gdGhpcy5kYXRhW2dJbmRleF0ubGlzdC5sZW5ndGggLSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHVuc2FmZUdyb3VwSW5kZXggPCAwKSB7XG4gICAgICAgICAgbW92ZWRJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbW92ZWRJbmRleCA9IE1hdGgucm91bmQobW92ZWRJbmRleCk7XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdID0gbW92ZWRJbmRleDtcbiAgICAgICAgaWYgKG1vdmVkSW5kZXggIT09IHRoaXMubGFzdEN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSkge1xuICAgICAgICAgIHRoaXMuY2hhbmdlLmVtaXQoe2dJbmRleCwgaUluZGV4OiBtb3ZlZEluZGV4fSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0Q3VycmVudEluZGV4TGlzdCA9IFtdLmNvbmNhdCh0aGlzLmN1cnJlbnRJbmRleExpc3QpO1xuICAgICAgfVxuICAgIH0sIDEwMCk7XG4gIH1cblxuICBpc0N1cnJlbnRJdGVtKGdJbmRleCwgaUluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdID09PSBpSW5kZXhcbiAgfVxuXG4gIGdldEN1cnJlbnRJbmRleExpc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEluZGV4TGlzdFxuICB9XG5cbiAgZ2V0R3JvdXBDbGFzcyhnSW5kZXgpIHtcbiAgICBjb25zdCBncm91cCA9IHRoaXMuZGF0YVtnSW5kZXhdXG4gICAgY29uc3QgZGVmYXVsdFdlaWdodENsYXNzID0gJ3dlaWdodC0nICsgKGdyb3VwLndlaWdodCB8fCAxKVxuICAgIGNvbnN0IGdyb3VwQ2xhc3MgPSBbZGVmYXVsdFdlaWdodENsYXNzXVxuICAgIGlmIChncm91cC5jbGFzc05hbWUpIHtcbiAgICAgIGdyb3VwQ2xhc3MucHVzaChncm91cC5jbGFzc05hbWUpXG4gICAgfVxuICAgIHJldHVybiBncm91cENsYXNzXG4gIH1cblxuICBnZXRJdGVtQ2xhc3MoZ0luZGV4LCBpSW5kZXgsIGlzRGl2aWRlciA9IGZhbHNlKSB7XG4gICAgY29uc3QgZ3JvdXAgPSB0aGlzLmRhdGFbZ0luZGV4XVxuICAgIGNvbnN0IGl0ZW1DbGFzcyA9IFtdXG4gICAgaWYgKCFpc0RpdmlkZXIgJiYgdGhpcy5pc0N1cnJlbnRJdGVtKGdJbmRleCwgaUluZGV4KSkge1xuICAgICAgaXRlbUNsYXNzLnB1c2goJ3Ntb290aC1pdGVtLXNlbGVjdGVkJylcbiAgICB9XG4gICAgaWYgKGdyb3VwLnRleHRBbGlnbikge1xuICAgICAgaXRlbUNsYXNzLnB1c2goJ3RleHQtJyArIGdyb3VwLnRleHRBbGlnbilcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW1DbGFzc1xuICB9XG5cbiAgZ2V0SXRlbVN0eWxlKGdJbmRleCwgaUluZGV4KSB7XG4gICAgY29uc3QgZ2FwQ291bnQgPSB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSAtIGlJbmRleFxuICAgIGlmIChNYXRoLmFicyhnYXBDb3VudCkgPCAoOTAgLyB0aGlzLml0ZW1QZXJEZWdyZWUpKSB7XG4gICAgICBjb25zdCByb3RhdGVTdHlsZSA9IHtcbiAgICAgICAgdHJhbnNmb3JtOiAncm90YXRlWCgnICsgZ2FwQ291bnQgKiB0aGlzLml0ZW1QZXJEZWdyZWUgKyAnZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCA1LjYyNWVtKScsXG4gICAgICAgIG9wYWNpdHk6ICgxIC0gTWF0aC5hYnMoZ2FwQ291bnQpIC8gKDkwIC8gdGhpcy5pdGVtUGVyRGVncmVlKSkudG9TdHJpbmcoKVxuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nSW5mby5pc0RyYWdnaW5nKSB7XG4gICAgICAgIHJvdGF0ZVN0eWxlWyd0cmFuc2l0aW9uJ10gPSAndHJhbnNmb3JtIDE1MG1zIGVhc2Utb3V0J1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJvdGF0ZVN0eWxlXG4gICAgfVxuICAgIGlmIChnYXBDb3VudCA+IDApIHtcbiAgICAgIHJldHVybiB7dHJhbnNmb3JtOiAncm90YXRlWCg5MGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgNS42MjVlbSknfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge3RyYW5zZm9ybTogJ3JvdGF0ZVgoLTkwZGVnKSB0cmFuc2xhdGUzZCgwLCAwLCA1LjYyNWVtKSd9XG4gICAgfVxuICB9XG59XG4iXX0=