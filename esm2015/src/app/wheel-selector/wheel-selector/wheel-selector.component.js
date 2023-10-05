import * as tslib_1 from "tslib";
import { Inject, Component, Input, Output, EventEmitter, ElementRef, ViewChild, ViewChildren } from '@angular/core';
let WheelSelectorComponent = class WheelSelectorComponent {
    constructor(elementRef) {
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
    ngOnInit() {
        this.currentIndexList = this.getInitialCurrentIndexList();
        this.lastCurrentIndexList = [].concat(this.currentIndexList);
        this.groupsRectList = new Array(this.data.length);
        this.eventsRegister();
        window.addEventListener('resize', this.safeGetRectsBindEvents.bind(this));
    }
    ngAfterViewInit() {
        this.getGroupsRectList();
    }
    ngOnDestroy() {
        window.removeEventListener('resize', this.safeGetRectsBindEvents.bind(this));
    }
    setGroupData(gIndex, groupData) {
        if (!this.currentIndexList) {
            this.currentIndexList = this.getInitialCurrentIndexList();
        }
        this.data[gIndex] = groupData;
        const iCI = groupData.currentIndex;
        let movedIndex = 0;
        if (typeof iCI === 'number' && iCI >= 0 && groupData.list && groupData.list.length && iCI <= groupData.list.length - 1) {
            movedIndex = Math.round(iCI);
        }
        this.currentIndexList[gIndex] = movedIndex;
        this.lastCurrentIndexList = [].concat(this.currentIndexList);
    }
    getInitialCurrentIndexList() {
        return this.data.map((item, index) => {
            const iCI = item.currentIndex;
            if (typeof iCI === 'number' && iCI >= 0 && item.list && item.list.length && iCI <= item.list.length - 1) {
                return Math.round(iCI);
            }
            return 0;
        });
    }
    safeGetRectsBindEvents() {
        if (this.safeDoTimeoutId) {
            clearTimeout(this.safeDoTimeoutId);
        }
        this.safeDoTimeoutId = setTimeout(() => {
            this.getGroupsRectList();
        }, 200);
    }
    getGroupsRectList() {
        if (this.pickerGroupLayer) {
            this.pickerGroupLayer.toArray().forEach((item, index) => {
                this.groupsRectList[index] = item.nativeElement.getBoundingClientRect();
            });
        }
    }
    eventsRegister() {
        const handleEventLayer = this.pickerHandleLayer.nativeElement;
        if (handleEventLayer) {
            this.addEventsForElement(handleEventLayer);
        }
    }
    addEventsForElement(el) {
        const _ = this.touchOrMouse.isTouchable;
        const eventHandlerList = [
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
        eventHandlerList.forEach((item, index) => {
            el.removeEventListener(item.name, item.handler, false);
            el.addEventListener(item.name, item.handler.bind(this), false);
        });
    }
    triggerMiddleLayerGroupClick(gIndex) {
        const data = this.data;
        if (typeof gIndex === 'number' && typeof data[gIndex].onClick === 'function') {
            data[gIndex].onClick(gIndex, this.currentIndexList[gIndex]);
        }
    }
    triggerAboveLayerClick(ev, gIndex) {
        const movedIndex = this.currentIndexList[gIndex] + 1;
        this.currentIndexList[gIndex] = movedIndex;
        this.correctionCurrentIndex(ev, gIndex);
    }
    triggerMiddleLayerClick(ev, gIndex) {
        this.triggerMiddleLayerGroupClick(gIndex);
    }
    triggerBelowLayerClick(ev, gIndex) {
        const movedIndex = this.currentIndexList[gIndex] - 1;
        this.currentIndexList[gIndex] = movedIndex;
        this.correctionCurrentIndex(ev, gIndex);
    }
    getTouchInfo(ev) {
        return this.touchOrMouse.isTouchable ? ev.changedTouches[0] || ev.touches[0] : ev;
    }
    getGroupIndexBelongsEvent(ev) {
        const touchInfo = this.getTouchInfo(ev);
        for (let i = 0; i < this.groupsRectList.length; i++) {
            const item = this.groupsRectList[i];
            if (item.left < touchInfo.pageX && touchInfo.pageX < item.right) {
                return i;
            }
        }
        return null;
    }
    handleEventClick(ev) {
        const gIndex = this.getGroupIndexBelongsEvent(ev);
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
    }
    handleStart(ev) {
        if (ev.cancelable) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        const touchInfo = this.getTouchInfo(ev);
        this.draggingInfo.startPageY = touchInfo.pageY;
        if (!this.touchOrMouse.isTouchable) {
            this.touchOrMouse.isMouseDown = true;
        }
    }
    handleMove(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.touchOrMouse.isTouchable || this.touchOrMouse.isMouseDown) {
            this.draggingInfo.isDragging = true;
            this.setCurrentIndexOnMove(ev);
        }
    }
    handleEnd(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!this.draggingInfo.isDragging) {
            this.handleEventClick(ev);
        }
        this.draggingInfo.isDragging = false;
        this.touchOrMouse.isMouseDown = false;
        this.correctionAfterDragging(ev);
    }
    handleCancel(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (this.touchOrMouse.isTouchable || this.touchOrMouse.isMouseDown) {
            this.correctionAfterDragging(ev);
            this.touchOrMouse.isMouseDown = false;
            this.draggingInfo.isDragging = false;
        }
    }
    handleWheel(ev) {
        this.setCurrentIndexOnWheel(ev);
        this.correctionAfterDragging(ev);
    }
    setCurrentIndexOnWheel(ev) {
        const gIndex = this.getGroupIndexBelongsEvent(ev);
        if (typeof gIndex === 'number' && (this.data[gIndex].divider || !this.data[gIndex].list)) {
            return;
        }
        const movedIndex = this.currentIndexList[gIndex] + (ev.deltaY / 53);
        this.currentIndexList[gIndex] = movedIndex;
        this.correctionCurrentIndex(ev, gIndex);
    }
    setCurrentIndexOnMove(ev) {
        const touchInfo = this.getTouchInfo(ev);
        if (this.draggingInfo.groupIndex === null) {
            this.draggingInfo.groupIndex = this.getGroupIndexBelongsEvent(ev);
        }
        const gIndex = this.draggingInfo.groupIndex;
        if (typeof gIndex === 'number' && (this.data[gIndex].divider || !this.data[gIndex].list)) {
            return;
        }
        const moveCount = (this.draggingInfo.startPageY - touchInfo.pageY) / 32;
        const movedIndex = this.currentIndexList[gIndex] + moveCount;
        this.currentIndexList[gIndex] = movedIndex;
        this.draggingInfo.startPageY = touchInfo.pageY;
    }
    correctionAfterDragging(ev) {
        const gIndex = this.draggingInfo.groupIndex;
        this.correctionCurrentIndex(ev, gIndex);
        this.draggingInfo.groupIndex = null;
        this.draggingInfo.startPageY = null;
    }
    correctionCurrentIndex(ev, gIndex) {
        setTimeout(() => {
            if (typeof gIndex === 'number' && this.data[gIndex].divider !== true && this.data[gIndex].list.length > 0) {
                const unsafeGroupIndex = this.currentIndexList[gIndex];
                let movedIndex = unsafeGroupIndex;
                if (unsafeGroupIndex > this.data[gIndex].list.length - 1) {
                    movedIndex = this.data[gIndex].list.length - 1;
                }
                else if (unsafeGroupIndex < 0) {
                    movedIndex = 0;
                }
                movedIndex = Math.round(movedIndex);
                this.currentIndexList[gIndex] = movedIndex;
                if (movedIndex !== this.lastCurrentIndexList[gIndex]) {
                    this.change.emit({ gIndex, iIndex: movedIndex });
                }
                this.lastCurrentIndexList = [].concat(this.currentIndexList);
            }
        }, 100);
    }
    isCurrentItem(gIndex, iIndex) {
        return this.currentIndexList[gIndex] === iIndex;
    }
    getCurrentIndexList() {
        return this.currentIndexList;
    }
    getGroupClass(gIndex) {
        const group = this.data[gIndex];
        const defaultWeightClass = 'weight-' + (group.weight || 1);
        const groupClass = [defaultWeightClass];
        if (group.className) {
            groupClass.push(group.className);
        }
        return groupClass;
    }
    getItemClass(gIndex, iIndex, isDivider = false) {
        const group = this.data[gIndex];
        const itemClass = [];
        if (!isDivider && this.isCurrentItem(gIndex, iIndex)) {
            itemClass.push('smooth-item-selected');
        }
        if (group.textAlign) {
            itemClass.push('text-' + group.textAlign);
        }
        return itemClass;
    }
    getItemStyle(gIndex, iIndex) {
        const gapCount = this.currentIndexList[gIndex] - iIndex;
        if (Math.abs(gapCount) < (90 / this.itemPerDegree)) {
            const rotateStyle = {
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
export { WheelSelectorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hlZWwtc2VsZWN0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGh5cGVyYmxvYi9uZ3gtd2hlZWwtc2VsZWN0b3IvIiwic291cmNlcyI6WyJzcmMvYXBwL3doZWVsLXNlbGVjdG9yL3doZWVsLXNlbGVjdG9yL3doZWVsLXNlbGVjdG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUM2QixNQUFNLEVBQUUsU0FBUyxFQUNuRCxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFDakUsTUFBTSxlQUFlLENBQUE7QUFXdEIsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUF3QmpDLFlBQWdDLFVBQXNCO1FBbEI3QyxTQUFJLEdBQW9CLEVBQUUsQ0FBQztRQUMxQixXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFLOUQsaUJBQVksR0FBRztZQUNiLFdBQVcsRUFBRSxjQUFjLElBQUksTUFBTTtZQUNyQyxXQUFXLEVBQUUsS0FBSztTQUNuQixDQUFDO1FBQ0YsaUJBQVksR0FBRztZQUNiLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1NBQ2pCLENBQUM7UUFDRixrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUNuQixvQkFBZSxHQUFRLElBQUksQ0FBQztRQUcxQixzREFBc0Q7SUFDeEQsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDMUQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFN0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FB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QztJQXlCYSxtQkFBQSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7NkNBQWEsVUFBVTtHQXhCM0Msc0JBQXNCLENBaVVsQztTQWpVWSxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgSW5qZWN0LCBDb21wb25lbnQsXG4gIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgRWxlbWVudFJlZiwgVmlld0NoaWxkLCBWaWV3Q2hpbGRyZW5cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSdcblxuaW1wb3J0IHsgU2VsZWN0b3JNb2RlbCB9IGZyb20gJy4vd2hlZWwtc2VsZWN0b3IubW9kZWxzJ1xuXG5leHBvcnQgeyBTZWxlY3Rvck1vZGVsIGFzIFBpY2tlckRhdGFNb2RlbCB9XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC13aGVlbC1zZWxlY3RvcicsXG4gIHRlbXBsYXRlVXJsOiAnLi93aGVlbC1zZWxlY3Rvci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3doZWVsLXNlbGVjdG9yLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgV2hlZWxTZWxlY3RvckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgQFZpZXdDaGlsZHJlbigncGlja2VyR3JvdXBMYXllcicpXG4gIHBpY2tlckdyb3VwTGF5ZXI7XG4gIEBWaWV3Q2hpbGQoJ3BpY2tlckhhbmRsZUxheWVyJylcbiAgcGlja2VySGFuZGxlTGF5ZXI7XG5cbiAgQElucHV0KCkgZGF0YTogU2VsZWN0b3JNb2RlbFtdID0gW107XG4gIEBPdXRwdXQoKSBjaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgY3VycmVudEluZGV4TGlzdDogbnVtYmVyW107XG4gIGxhc3RDdXJyZW50SW5kZXhMaXN0OiBudW1iZXJbXTtcbiAgZ3JvdXBzUmVjdExpc3Q6IGFueVtdO1xuICB0b3VjaE9yTW91c2UgPSB7XG4gICAgaXNUb3VjaGFibGU6ICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyxcbiAgICBpc01vdXNlRG93bjogZmFsc2VcbiAgfTtcbiAgZHJhZ2dpbmdJbmZvID0ge1xuICAgIGlzRHJhZ2dpbmc6IGZhbHNlLFxuICAgIGdyb3VwSW5kZXg6IG51bGwsXG4gICAgc3RhcnRQYWdlWTogbnVsbFxuICB9O1xuICBpdGVtUGVyRGVncmVlID0gMjM7XG4gIHNhZmVEb1RpbWVvdXRJZDogYW55ID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KEVsZW1lbnRSZWYpIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAvLyBjb25zb2xlLmxvZygncGlja2VyIGRvbScsIGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudClcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuY3VycmVudEluZGV4TGlzdCA9IHRoaXMuZ2V0SW5pdGlhbEN1cnJlbnRJbmRleExpc3QoKTtcbiAgICB0aGlzLmxhc3RDdXJyZW50SW5kZXhMaXN0ID0gW10uY29uY2F0KHRoaXMuY3VycmVudEluZGV4TGlzdCk7XG5cbiAgICB0aGlzLmdyb3Vwc1JlY3RMaXN0ID0gbmV3IEFycmF5KHRoaXMuZGF0YS5sZW5ndGgpO1xuXG4gICAgdGhpcy5ldmVudHNSZWdpc3RlcigpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnNhZmVHZXRSZWN0c0JpbmRFdmVudHMuYmluZCh0aGlzKSk7XG4gIH1cblxuICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5nZXRHcm91cHNSZWN0TGlzdCgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuc2FmZUdldFJlY3RzQmluZEV2ZW50cy5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHNldEdyb3VwRGF0YShnSW5kZXgsIGdyb3VwRGF0YSkge1xuICAgIGlmICghdGhpcy5jdXJyZW50SW5kZXhMaXN0KSB7XG4gICAgICB0aGlzLmN1cnJlbnRJbmRleExpc3QgPSB0aGlzLmdldEluaXRpYWxDdXJyZW50SW5kZXhMaXN0KCk7XG4gICAgfVxuICAgIHRoaXMuZGF0YVtnSW5kZXhdID0gZ3JvdXBEYXRhO1xuICAgIGNvbnN0IGlDSSA9IGdyb3VwRGF0YS5jdXJyZW50SW5kZXg7XG4gICAgbGV0IG1vdmVkSW5kZXggPSAwO1xuICAgIGlmICh0eXBlb2YgaUNJID09PSAnbnVtYmVyJyAmJiBpQ0kgPj0gMCAmJiBncm91cERhdGEubGlzdCAmJiBncm91cERhdGEubGlzdC5sZW5ndGggJiYgaUNJIDw9IGdyb3VwRGF0YS5saXN0Lmxlbmd0aCAtIDEpIHtcbiAgICAgIG1vdmVkSW5kZXggPSBNYXRoLnJvdW5kKGlDSSk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdID0gbW92ZWRJbmRleDtcbiAgICB0aGlzLmxhc3RDdXJyZW50SW5kZXhMaXN0ID0gW10uY29uY2F0KHRoaXMuY3VycmVudEluZGV4TGlzdCk7XG4gIH1cblxuICBnZXRJbml0aWFsQ3VycmVudEluZGV4TGlzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGlDSSA9IGl0ZW0uY3VycmVudEluZGV4O1xuICAgICAgaWYgKHR5cGVvZiBpQ0kgPT09ICdudW1iZXInICYmIGlDSSA+PSAwICYmIGl0ZW0ubGlzdCAmJiBpdGVtLmxpc3QubGVuZ3RoICYmIGlDSSA8PSBpdGVtLmxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChpQ0kpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG4gIH1cblxuICBzYWZlR2V0UmVjdHNCaW5kRXZlbnRzKCkge1xuICAgIGlmICh0aGlzLnNhZmVEb1RpbWVvdXRJZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2FmZURvVGltZW91dElkKTtcbiAgICB9XG4gICAgdGhpcy5zYWZlRG9UaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuZ2V0R3JvdXBzUmVjdExpc3QoKTtcbiAgICB9LCAyMDApO1xuICB9XG5cbiAgZ2V0R3JvdXBzUmVjdExpc3QoKSB7XG4gICAgaWYgKHRoaXMucGlja2VyR3JvdXBMYXllcikge1xuICAgICAgdGhpcy5waWNrZXJHcm91cExheWVyLnRvQXJyYXkoKS5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICB0aGlzLmdyb3Vwc1JlY3RMaXN0W2luZGV4XSA9IGl0ZW0ubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGV2ZW50c1JlZ2lzdGVyKCkge1xuICAgIGNvbnN0IGhhbmRsZUV2ZW50TGF5ZXIgPSB0aGlzLnBpY2tlckhhbmRsZUxheWVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKGhhbmRsZUV2ZW50TGF5ZXIpIHtcbiAgICAgIHRoaXMuYWRkRXZlbnRzRm9yRWxlbWVudChoYW5kbGVFdmVudExheWVyKTtcbiAgICB9XG4gIH1cblxuICBhZGRFdmVudHNGb3JFbGVtZW50KGVsKSB7XG4gICAgY29uc3QgXyA9IHRoaXMudG91Y2hPck1vdXNlLmlzVG91Y2hhYmxlO1xuICAgIGNvbnN0IGV2ZW50SGFuZGxlckxpc3QgPSBbXG4gICAgICB7bmFtZTogXyA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nLCBoYW5kbGVyOiB0aGlzLmhhbmRsZVN0YXJ0fSxcbiAgICAgIHtuYW1lOiBfID8gJ3RvdWNobW92ZScgOiAnbW91c2Vtb3ZlJywgaGFuZGxlcjogdGhpcy5oYW5kbGVNb3ZlfSxcbiAgICAgIHtuYW1lOiBfID8gJ3RvdWNoZW5kJyA6ICdtb3VzZXVwJywgaGFuZGxlcjogdGhpcy5oYW5kbGVFbmR9LFxuICAgICAge25hbWU6IF8gPyAndG91Y2hjYW5jZWwnIDogJ21vdXNlbGVhdmUnLCBoYW5kbGVyOiB0aGlzLmhhbmRsZUNhbmNlbH1cbiAgICBdO1xuICAgIGlmICghXykge1xuICAgICAgZXZlbnRIYW5kbGVyTGlzdC5wdXNoKHtcbiAgICAgICAgbmFtZTogJ3doZWVsJyxcbiAgICAgICAgaGFuZGxlcjogdGhpcy5oYW5kbGVXaGVlbFxuICAgICAgfSk7XG4gICAgfVxuICAgIGV2ZW50SGFuZGxlckxpc3QuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbS5uYW1lLCBpdGVtLmhhbmRsZXIsIGZhbHNlKTtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoaXRlbS5uYW1lLCBpdGVtLmhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgdHJpZ2dlck1pZGRsZUxheWVyR3JvdXBDbGljayhnSW5kZXgpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5kYXRhO1xuICAgIGlmICh0eXBlb2YgZ0luZGV4ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgZGF0YVtnSW5kZXhdLm9uQ2xpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGRhdGFbZ0luZGV4XS5vbkNsaWNrKGdJbmRleCwgdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0pO1xuICAgIH1cbiAgfVxuXG4gIHRyaWdnZXJBYm92ZUxheWVyQ2xpY2soZXYsIGdJbmRleCkge1xuICAgIGNvbnN0IG1vdmVkSW5kZXggPSB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSArIDE7XG4gICAgdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0gPSBtb3ZlZEluZGV4O1xuICAgIHRoaXMuY29ycmVjdGlvbkN1cnJlbnRJbmRleChldiwgZ0luZGV4KTtcbiAgfVxuXG4gIHRyaWdnZXJNaWRkbGVMYXllckNsaWNrKGV2LCBnSW5kZXgpIHtcbiAgICB0aGlzLnRyaWdnZXJNaWRkbGVMYXllckdyb3VwQ2xpY2soZ0luZGV4KTtcbiAgfVxuXG4gIHRyaWdnZXJCZWxvd0xheWVyQ2xpY2soZXYsIGdJbmRleCkge1xuICAgIGNvbnN0IG1vdmVkSW5kZXggPSB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSAtIDE7XG4gICAgdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0gPSBtb3ZlZEluZGV4O1xuICAgIHRoaXMuY29ycmVjdGlvbkN1cnJlbnRJbmRleChldiwgZ0luZGV4KTtcbiAgfVxuXG4gIGdldFRvdWNoSW5mbyhldikge1xuICAgIHJldHVybiB0aGlzLnRvdWNoT3JNb3VzZS5pc1RvdWNoYWJsZSA/IGV2LmNoYW5nZWRUb3VjaGVzWzBdIHx8IGV2LnRvdWNoZXNbMF0gOiBldjtcbiAgfVxuXG4gIGdldEdyb3VwSW5kZXhCZWxvbmdzRXZlbnQoZXYpIHtcbiAgICBjb25zdCB0b3VjaEluZm8gPSB0aGlzLmdldFRvdWNoSW5mbyhldik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmdyb3Vwc1JlY3RMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpdGVtID0gdGhpcy5ncm91cHNSZWN0TGlzdFtpXTtcbiAgICAgIGlmIChpdGVtLmxlZnQgPCB0b3VjaEluZm8ucGFnZVggJiYgdG91Y2hJbmZvLnBhZ2VYIDwgaXRlbS5yaWdodCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBoYW5kbGVFdmVudENsaWNrKGV2KSB7XG4gICAgY29uc3QgZ0luZGV4ID0gdGhpcy5nZXRHcm91cEluZGV4QmVsb25nc0V2ZW50KGV2KTtcbiAgICBzd2l0Y2ggKGV2LnRhcmdldC5kYXRhc2V0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgIHRoaXMudHJpZ2dlckFib3ZlTGF5ZXJDbGljayhldiwgZ0luZGV4KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtaWRkbGUnOlxuICAgICAgICB0aGlzLnRyaWdnZXJNaWRkbGVMYXllckNsaWNrKGV2LCBnSW5kZXgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgIHRoaXMudHJpZ2dlckJlbG93TGF5ZXJDbGljayhldiwgZ0luZGV4KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZVN0YXJ0KGV2KSB7XG4gICAgaWYgKGV2LmNhbmNlbGFibGUpIHtcbiAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG4gICAgY29uc3QgdG91Y2hJbmZvID0gdGhpcy5nZXRUb3VjaEluZm8oZXYpO1xuICAgIHRoaXMuZHJhZ2dpbmdJbmZvLnN0YXJ0UGFnZVkgPSB0b3VjaEluZm8ucGFnZVk7XG4gICAgaWYgKCF0aGlzLnRvdWNoT3JNb3VzZS5pc1RvdWNoYWJsZSkge1xuICAgICAgdGhpcy50b3VjaE9yTW91c2UuaXNNb3VzZURvd24gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZU1vdmUoZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLnRvdWNoT3JNb3VzZS5pc1RvdWNoYWJsZSB8fCB0aGlzLnRvdWNoT3JNb3VzZS5pc01vdXNlRG93bikge1xuICAgICAgdGhpcy5kcmFnZ2luZ0luZm8uaXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICB0aGlzLnNldEN1cnJlbnRJbmRleE9uTW92ZShldik7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlRW5kKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBpZiAoIXRoaXMuZHJhZ2dpbmdJbmZvLmlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuaGFuZGxlRXZlbnRDbGljayhldik7XG4gICAgfVxuICAgIHRoaXMuZHJhZ2dpbmdJbmZvLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnRvdWNoT3JNb3VzZS5pc01vdXNlRG93biA9IGZhbHNlO1xuICAgIHRoaXMuY29ycmVjdGlvbkFmdGVyRHJhZ2dpbmcoZXYpO1xuICB9XG5cbiAgaGFuZGxlQ2FuY2VsKGV2KSB7XG4gICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBpZiAodGhpcy50b3VjaE9yTW91c2UuaXNUb3VjaGFibGUgfHwgdGhpcy50b3VjaE9yTW91c2UuaXNNb3VzZURvd24pIHtcbiAgICAgIHRoaXMuY29ycmVjdGlvbkFmdGVyRHJhZ2dpbmcoZXYpO1xuICAgICAgdGhpcy50b3VjaE9yTW91c2UuaXNNb3VzZURvd24gPSBmYWxzZTtcbiAgICAgIHRoaXMuZHJhZ2dpbmdJbmZvLmlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVXaGVlbChldikge1xuXG4gICAgdGhpcy5zZXRDdXJyZW50SW5kZXhPbldoZWVsKGV2KTtcbiAgICB0aGlzLmNvcnJlY3Rpb25BZnRlckRyYWdnaW5nKGV2KTtcblxuICB9XG5cbiAgc2V0Q3VycmVudEluZGV4T25XaGVlbChldikge1xuXG4gICAgY29uc3QgZ0luZGV4ID0gdGhpcy5nZXRHcm91cEluZGV4QmVsb25nc0V2ZW50KGV2KTtcbiAgICBpZiAodHlwZW9mIGdJbmRleCA9PT0gJ251bWJlcicgJiYgKHRoaXMuZGF0YVtnSW5kZXhdLmRpdmlkZXIgfHwgIXRoaXMuZGF0YVtnSW5kZXhdLmxpc3QpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbW92ZWRJbmRleCA9IHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdICsgKGV2LmRlbHRhWSAvIDUzKTtcbiAgICB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSA9IG1vdmVkSW5kZXg7XG5cbiAgICB0aGlzLmNvcnJlY3Rpb25DdXJyZW50SW5kZXgoZXYsIGdJbmRleCk7XG5cbiAgfVxuXG4gIHNldEN1cnJlbnRJbmRleE9uTW92ZShldikge1xuICAgIGNvbnN0IHRvdWNoSW5mbyA9IHRoaXMuZ2V0VG91Y2hJbmZvKGV2KTtcbiAgICBpZiAodGhpcy5kcmFnZ2luZ0luZm8uZ3JvdXBJbmRleCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5kcmFnZ2luZ0luZm8uZ3JvdXBJbmRleCA9IHRoaXMuZ2V0R3JvdXBJbmRleEJlbG9uZ3NFdmVudChldik7XG4gICAgfVxuICAgIGNvbnN0IGdJbmRleCA9IHRoaXMuZHJhZ2dpbmdJbmZvLmdyb3VwSW5kZXg7XG4gICAgaWYgKHR5cGVvZiBnSW5kZXggPT09ICdudW1iZXInICYmICh0aGlzLmRhdGFbZ0luZGV4XS5kaXZpZGVyIHx8ICF0aGlzLmRhdGFbZ0luZGV4XS5saXN0KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtb3ZlQ291bnQgPSAodGhpcy5kcmFnZ2luZ0luZm8uc3RhcnRQYWdlWSAtIHRvdWNoSW5mby5wYWdlWSkgLyAzMjtcbiAgICBjb25zdCBtb3ZlZEluZGV4ID0gdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0gKyBtb3ZlQ291bnQ7XG4gICAgdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0gPSBtb3ZlZEluZGV4O1xuICAgIHRoaXMuZHJhZ2dpbmdJbmZvLnN0YXJ0UGFnZVkgPSB0b3VjaEluZm8ucGFnZVk7XG4gIH1cblxuICBjb3JyZWN0aW9uQWZ0ZXJEcmFnZ2luZyhldikge1xuICAgIGNvbnN0IGdJbmRleCA9IHRoaXMuZHJhZ2dpbmdJbmZvLmdyb3VwSW5kZXg7XG4gICAgdGhpcy5jb3JyZWN0aW9uQ3VycmVudEluZGV4KGV2LCBnSW5kZXgpO1xuICAgIHRoaXMuZHJhZ2dpbmdJbmZvLmdyb3VwSW5kZXggPSBudWxsO1xuICAgIHRoaXMuZHJhZ2dpbmdJbmZvLnN0YXJ0UGFnZVkgPSBudWxsO1xuICB9XG5cbiAgY29ycmVjdGlvbkN1cnJlbnRJbmRleChldiwgZ0luZGV4KSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGdJbmRleCA9PT0gJ251bWJlcicgJiYgdGhpcy5kYXRhW2dJbmRleF0uZGl2aWRlciAhPT0gdHJ1ZSAmJiB0aGlzLmRhdGFbZ0luZGV4XS5saXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdW5zYWZlR3JvdXBJbmRleCA9IHRoaXMuY3VycmVudEluZGV4TGlzdFtnSW5kZXhdO1xuICAgICAgICBsZXQgbW92ZWRJbmRleCA9IHVuc2FmZUdyb3VwSW5kZXg7XG4gICAgICAgIGlmICh1bnNhZmVHcm91cEluZGV4ID4gdGhpcy5kYXRhW2dJbmRleF0ubGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgbW92ZWRJbmRleCA9IHRoaXMuZGF0YVtnSW5kZXhdLmxpc3QubGVuZ3RoIC0gMTtcbiAgICAgICAgfSBlbHNlIGlmICh1bnNhZmVHcm91cEluZGV4IDwgMCkge1xuICAgICAgICAgIG1vdmVkSW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICAgIG1vdmVkSW5kZXggPSBNYXRoLnJvdW5kKG1vdmVkSW5kZXgpO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSA9IG1vdmVkSW5kZXg7XG4gICAgICAgIGlmIChtb3ZlZEluZGV4ICE9PSB0aGlzLmxhc3RDdXJyZW50SW5kZXhMaXN0W2dJbmRleF0pIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZS5lbWl0KHtnSW5kZXgsIGlJbmRleDogbW92ZWRJbmRleH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFzdEN1cnJlbnRJbmRleExpc3QgPSBbXS5jb25jYXQodGhpcy5jdXJyZW50SW5kZXhMaXN0KTtcbiAgICAgIH1cbiAgICB9LCAxMDApO1xuICB9XG5cbiAgaXNDdXJyZW50SXRlbShnSW5kZXgsIGlJbmRleCkge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbmRleExpc3RbZ0luZGV4XSA9PT0gaUluZGV4XG4gIH1cblxuICBnZXRDdXJyZW50SW5kZXhMaXN0KCkge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRJbmRleExpc3RcbiAgfVxuXG4gIGdldEdyb3VwQ2xhc3MoZ0luZGV4KSB7XG4gICAgY29uc3QgZ3JvdXAgPSB0aGlzLmRhdGFbZ0luZGV4XVxuICAgIGNvbnN0IGRlZmF1bHRXZWlnaHRDbGFzcyA9ICd3ZWlnaHQtJyArIChncm91cC53ZWlnaHQgfHwgMSlcbiAgICBjb25zdCBncm91cENsYXNzID0gW2RlZmF1bHRXZWlnaHRDbGFzc11cbiAgICBpZiAoZ3JvdXAuY2xhc3NOYW1lKSB7XG4gICAgICBncm91cENsYXNzLnB1c2goZ3JvdXAuY2xhc3NOYW1lKVxuICAgIH1cbiAgICByZXR1cm4gZ3JvdXBDbGFzc1xuICB9XG5cbiAgZ2V0SXRlbUNsYXNzKGdJbmRleCwgaUluZGV4LCBpc0RpdmlkZXIgPSBmYWxzZSkge1xuICAgIGNvbnN0IGdyb3VwID0gdGhpcy5kYXRhW2dJbmRleF1cbiAgICBjb25zdCBpdGVtQ2xhc3MgPSBbXVxuICAgIGlmICghaXNEaXZpZGVyICYmIHRoaXMuaXNDdXJyZW50SXRlbShnSW5kZXgsIGlJbmRleCkpIHtcbiAgICAgIGl0ZW1DbGFzcy5wdXNoKCdzbW9vdGgtaXRlbS1zZWxlY3RlZCcpXG4gICAgfVxuICAgIGlmIChncm91cC50ZXh0QWxpZ24pIHtcbiAgICAgIGl0ZW1DbGFzcy5wdXNoKCd0ZXh0LScgKyBncm91cC50ZXh0QWxpZ24pXG4gICAgfVxuICAgIHJldHVybiBpdGVtQ2xhc3NcbiAgfVxuXG4gIGdldEl0ZW1TdHlsZShnSW5kZXgsIGlJbmRleCkge1xuICAgIGNvbnN0IGdhcENvdW50ID0gdGhpcy5jdXJyZW50SW5kZXhMaXN0W2dJbmRleF0gLSBpSW5kZXhcbiAgICBpZiAoTWF0aC5hYnMoZ2FwQ291bnQpIDwgKDkwIC8gdGhpcy5pdGVtUGVyRGVncmVlKSkge1xuICAgICAgY29uc3Qgcm90YXRlU3R5bGUgPSB7XG4gICAgICAgIHRyYW5zZm9ybTogJ3JvdGF0ZVgoJyArIGdhcENvdW50ICogdGhpcy5pdGVtUGVyRGVncmVlICsgJ2RlZykgdHJhbnNsYXRlM2QoMCwgMCwgNS42MjVlbSknLFxuICAgICAgICBvcGFjaXR5OiAoMSAtIE1hdGguYWJzKGdhcENvdW50KSAvICg5MCAvIHRoaXMuaXRlbVBlckRlZ3JlZSkpLnRvU3RyaW5nKClcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5kcmFnZ2luZ0luZm8uaXNEcmFnZ2luZykge1xuICAgICAgICByb3RhdGVTdHlsZVsndHJhbnNpdGlvbiddID0gJ3RyYW5zZm9ybSAxNTBtcyBlYXNlLW91dCdcbiAgICAgIH1cbiAgICAgIHJldHVybiByb3RhdGVTdHlsZVxuICAgIH1cbiAgICBpZiAoZ2FwQ291bnQgPiAwKSB7XG4gICAgICByZXR1cm4ge3RyYW5zZm9ybTogJ3JvdGF0ZVgoOTBkZWcpIHRyYW5zbGF0ZTNkKDAsIDAsIDUuNjI1ZW0pJ31cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt0cmFuc2Zvcm06ICdyb3RhdGVYKC05MGRlZykgdHJhbnNsYXRlM2QoMCwgMCwgNS42MjVlbSknfVxuICAgIH1cbiAgfVxufVxuIl19