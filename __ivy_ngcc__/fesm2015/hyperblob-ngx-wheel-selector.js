import { __decorate, __metadata, __param } from 'tslib';
import { EventEmitter, ViewChildren, ViewChild, Input, Output, Component, Inject, ElementRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as ɵngcc0 from '@angular/core';
import * as ɵngcc1 from '@angular/common';

const _c0 = ["pickerHandleLayer"];
const _c1 = ["pickerGroupLayer"];
function WheelSelectorComponent_div_1_ng_container_3_div_1_Template(rf, ctx) { if (rf & 1) {
    ɵngcc0.ɵɵelementStart(0, "div", 13);
    ɵngcc0.ɵɵtext(1);
    ɵngcc0.ɵɵelementEnd();
} if (rf & 2) {
    const iIndex_r7 = ɵngcc0.ɵɵnextContext().index;
    const ctx_r11 = ɵngcc0.ɵɵnextContext();
    const gIndex_r3 = ctx_r11.index;
    const group_r2 = ctx_r11.$implicit;
    const ctx_r8 = ɵngcc0.ɵɵnextContext();
    ɵngcc0.ɵɵproperty("ngClass", ctx_r8.getItemClass(gIndex_r3, iIndex_r7, true));
    ɵngcc0.ɵɵadvance(1);
    ɵngcc0.ɵɵtextInterpolate1(" ", group_r2.text, " ");
} }
function WheelSelectorComponent_div_1_ng_container_3_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    ɵngcc0.ɵɵelementStart(0, "div", 14);
    ɵngcc0.ɵɵtext(1);
    ɵngcc0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r14 = ɵngcc0.ɵɵnextContext();
    const iIndex_r7 = ctx_r14.index;
    const item_r6 = ctx_r14.$implicit;
    const gIndex_r3 = ɵngcc0.ɵɵnextContext().index;
    const ctx_r10 = ɵngcc0.ɵɵnextContext();
    ɵngcc0.ɵɵproperty("ngClass", ctx_r10.getItemClass(gIndex_r3, iIndex_r7))("ngStyle", ctx_r10.getItemStyle(gIndex_r3, iIndex_r7));
    ɵngcc0.ɵɵadvance(1);
    ɵngcc0.ɵɵtextInterpolate1(" ", item_r6.value || item_r6, " ");
} }
function WheelSelectorComponent_div_1_ng_container_3_Template(rf, ctx) { if (rf & 1) {
    ɵngcc0.ɵɵelementContainerStart(0);
    ɵngcc0.ɵɵtemplate(1, WheelSelectorComponent_div_1_ng_container_3_div_1_Template, 2, 2, "div", 11);
    ɵngcc0.ɵɵtemplate(2, WheelSelectorComponent_div_1_ng_container_3_ng_template_2_Template, 2, 3, "ng-template", null, 12, ɵngcc0.ɵɵtemplateRefExtractor);
    ɵngcc0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const _r9 = ɵngcc0.ɵɵreference(3);
    const group_r2 = ɵngcc0.ɵɵnextContext().$implicit;
    ɵngcc0.ɵɵadvance(1);
    ɵngcc0.ɵɵproperty("ngIf", group_r2.divider)("ngIfElse", _r9);
} }
function WheelSelectorComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    ɵngcc0.ɵɵelementStart(0, "div", 7, 8);
    ɵngcc0.ɵɵelementStart(2, "div", 9);
    ɵngcc0.ɵɵtemplate(3, WheelSelectorComponent_div_1_ng_container_3_Template, 4, 2, "ng-container", 10);
    ɵngcc0.ɵɵelementEnd();
    ɵngcc0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r2 = ctx.$implicit;
    const gIndex_r3 = ctx.index;
    const ctx_r0 = ɵngcc0.ɵɵnextContext();
    ɵngcc0.ɵɵproperty("ngClass", ctx_r0.getGroupClass(gIndex_r3));
    ɵngcc0.ɵɵadvance(3);
    ɵngcc0.ɵɵproperty("ngForOf", group_r2.list);
} }
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
WheelSelectorComponent.ɵfac = function WheelSelectorComponent_Factory(t) { return new (t || WheelSelectorComponent)(ɵngcc0.ɵɵdirectiveInject(ElementRef)); };
WheelSelectorComponent.ɵcmp = ɵngcc0.ɵɵdefineComponent({ type: WheelSelectorComponent, selectors: [["ngx-wheel-selector"]], viewQuery: function WheelSelectorComponent_Query(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵviewQuery(_c0, true);
        ɵngcc0.ɵɵviewQuery(_c1, true);
    } if (rf & 2) {
        var _t;
        ɵngcc0.ɵɵqueryRefresh(_t = ɵngcc0.ɵɵloadQuery()) && (ctx.pickerHandleLayer = _t.first);
        ɵngcc0.ɵɵqueryRefresh(_t = ɵngcc0.ɵɵloadQuery()) && (ctx.pickerGroupLayer = _t);
    } }, inputs: { data: "data" }, outputs: { change: "change" }, decls: 7, vars: 1, consts: [[1, "ng-data-picker", "flex-box"], ["class", "picker-group", 3, "ngClass", 4, "ngFor", "ngForOf"], [1, "picker-handle-layer", "flex-box", "dir-column"], ["pickerHandleLayer", ""], ["data-type", "top", 1, "picker-top", "weight-1"], ["data-type", "middle", 1, "picker-middle"], ["data-type", "bottom", 1, "picker-bottom", "weight-1"], [1, "picker-group", 3, "ngClass"], ["pickerGroupLayer", ""], [1, "picker-list"], [4, "ngFor", "ngForOf"], ["class", "picker-item divider", 3, "ngClass", 4, "ngIf", "ngIfElse"], ["ngIfElse", ""], [1, "picker-item", "divider", 3, "ngClass"], [1, "picker-item", 3, "ngClass", "ngStyle"]], template: function WheelSelectorComponent_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵelementStart(0, "div", 0);
        ɵngcc0.ɵɵtemplate(1, WheelSelectorComponent_div_1_Template, 4, 2, "div", 1);
        ɵngcc0.ɵɵelementStart(2, "div", 2, 3);
        ɵngcc0.ɵɵelement(4, "div", 4);
        ɵngcc0.ɵɵelement(5, "div", 5);
        ɵngcc0.ɵɵelement(6, "div", 6);
        ɵngcc0.ɵɵelementEnd();
        ɵngcc0.ɵɵelementEnd();
    } if (rf & 2) {
        ɵngcc0.ɵɵadvance(1);
        ɵngcc0.ɵɵproperty("ngForOf", ctx.data);
    } }, directives: [ɵngcc1.NgForOf, ɵngcc1.NgClass, ɵngcc1.NgIf, ɵngcc1.NgStyle], styles: [".ng-data-picker[_ngcontent-%COMP%]{font-size:1rem;height:10em;position:relative;background-color:#fff;overflow:hidden}.ng-data-picker.black[_ngcontent-%COMP%]{color:#fff}.ng-data-picker[_ngcontent-%COMP%]   .picker-item[_ngcontent-%COMP%]{position:absolute;top:0;left:0;overflow:hidden;width:100%;text-overflow:ellipsis;white-space:nowrap;display:block;text-align:center;will-change:transform;contain:strict;height:2em;line-height:2;font-size:1em}.ng-data-picker[_ngcontent-%COMP%]   .picker-list[_ngcontent-%COMP%]{height:6.25em;position:relative;top:4em}.ng-data-picker[_ngcontent-%COMP%]   .picker-handle-layer[_ngcontent-%COMP%]{position:absolute;width:100%;height:calc(100% + 2px);left:0;right:0;top:-1px;bottom:-1px}.ng-data-picker[_ngcontent-%COMP%]   .picker-handle-layer[_ngcontent-%COMP%]   .picker-top[_ngcontent-%COMP%]{border-bottom:.55px solid rgba(74,73,89,.5);background:linear-gradient(to bottom,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.ng-data-picker[_ngcontent-%COMP%]   .picker-handle-layer[_ngcontent-%COMP%]   .picker-middle[_ngcontent-%COMP%]{height:2em}.ng-data-picker[_ngcontent-%COMP%]   .picker-handle-layer[_ngcontent-%COMP%]   .picker-bottom[_ngcontent-%COMP%]{border-top:.55px solid rgba(74,73,89,.5);background:linear-gradient(to top,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.flex-box[_ngcontent-%COMP%]{display:flex}.flex-box.dir-column[_ngcontent-%COMP%]{flex-direction:column}.flex-box.dir-row[_ngcontent-%COMP%]{flex-direction:row}.flex-box[_ngcontent-%COMP%]   .weight-1[_ngcontent-%COMP%]{flex:1}.flex-box[_ngcontent-%COMP%]   .weight-2[_ngcontent-%COMP%]{flex:2}.flex-box[_ngcontent-%COMP%]   .weight-3[_ngcontent-%COMP%]{flex:3}.flex-box[_ngcontent-%COMP%]   .weight-4[_ngcontent-%COMP%]{flex:4}.flex-box[_ngcontent-%COMP%]   .weight-5[_ngcontent-%COMP%]{flex:5}.flex-box[_ngcontent-%COMP%]   .weight-6[_ngcontent-%COMP%]{flex:6}.flex-box[_ngcontent-%COMP%]   .weight-7[_ngcontent-%COMP%]{flex:7}.flex-box[_ngcontent-%COMP%]   .weight-8[_ngcontent-%COMP%]{flex:8}.flex-box[_ngcontent-%COMP%]   .weight-9[_ngcontent-%COMP%]{flex:9}.flex-box[_ngcontent-%COMP%]   .weight-10[_ngcontent-%COMP%]{flex:10}.flex-box[_ngcontent-%COMP%]   .weight-11[_ngcontent-%COMP%]{flex:11}.flex-box[_ngcontent-%COMP%]   .weight-12[_ngcontent-%COMP%]{flex:12}"] });
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
WheelSelectorComponent = __decorate([ __param(0, Inject(ElementRef)),
    __metadata("design:paramtypes", [ElementRef])
], WheelSelectorComponent);

let WheelSelectorModule = class WheelSelectorModule {
};
WheelSelectorModule.ɵmod = ɵngcc0.ɵɵdefineNgModule({ type: WheelSelectorModule });
WheelSelectorModule.ɵinj = ɵngcc0.ɵɵdefineInjector({ factory: function WheelSelectorModule_Factory(t) { return new (t || WheelSelectorModule)(); }, imports: [[
            CommonModule
        ]] });
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(WheelSelectorComponent, [{
        type: Component,
        args: [{
                selector: 'ngx-wheel-selector',
                template: "<div class=\"ng-data-picker flex-box\">\n\n  <!-- picker-group-layer -->\n  <div #pickerGroupLayer *ngFor=\"let group of data; let gIndex = index\"\n    class=\"picker-group\" [ngClass]=\"getGroupClass(gIndex)\">\n\n    <div class=\"picker-list\">\n      <ng-container *ngFor=\"let item of group.list; let iIndex = index\">\n        <div *ngIf=\"group.divider else ngIfElse\"\n          class=\"picker-item divider\" [ngClass]=\"getItemClass(gIndex, iIndex, true)\">\n          {{ group.text }}\n        </div>\n  \n        <ng-template #ngIfElse>\n          <div \n            class=\"picker-item\" [ngClass]=\"getItemClass(gIndex, iIndex)\" [ngStyle]=\"getItemStyle(gIndex, iIndex)\">\n            {{ item.value || item }}\n          </div>\n        </ng-template>\n      </ng-container>\n    </div>\n\n  </div>\n\n  <div #pickerHandleLayer class=\"picker-handle-layer flex-box dir-column\">\n    <div data-type=\"top\" class=\"picker-top weight-1\"></div>\n    <div data-type=\"middle\" class=\"picker-middle\"></div>\n    <div data-type=\"bottom\" class=\"picker-bottom weight-1\"></div>\n  </div>\n\n</div>",
                styles: [".ng-data-picker{font-size:1rem;height:10em;position:relative;background-color:#fff;overflow:hidden}.ng-data-picker.black{color:#fff}.ng-data-picker .picker-item{position:absolute;top:0;left:0;overflow:hidden;width:100%;text-overflow:ellipsis;white-space:nowrap;display:block;text-align:center;will-change:transform;contain:strict;height:2em;line-height:2;font-size:1em}.ng-data-picker .picker-list{height:6.25em;position:relative;top:4em}.ng-data-picker .picker-handle-layer{position:absolute;width:100%;height:calc(100% + 2px);left:0;right:0;top:-1px;bottom:-1px}.ng-data-picker .picker-handle-layer .picker-top{border-bottom:.55px solid rgba(74,73,89,.5);background:linear-gradient(to bottom,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.ng-data-picker .picker-handle-layer .picker-middle{height:2em}.ng-data-picker .picker-handle-layer .picker-bottom{border-top:.55px solid rgba(74,73,89,.5);background:linear-gradient(to top,#fff 2%,rgba(255,255,255,.1) 100%);-webkit-transform:translate3d(0,0,5.625em);transform:translate3d(0,0,5.625em)}.flex-box{display:flex}.flex-box.dir-column{flex-direction:column}.flex-box.dir-row{flex-direction:row}.flex-box .weight-1{flex:1}.flex-box .weight-2{flex:2}.flex-box .weight-3{flex:3}.flex-box .weight-4{flex:4}.flex-box .weight-5{flex:5}.flex-box .weight-6{flex:6}.flex-box .weight-7{flex:7}.flex-box .weight-8{flex:8}.flex-box .weight-9{flex:9}.flex-box .weight-10{flex:10}.flex-box .weight-11{flex:11}.flex-box .weight-12{flex:12}"]
            }]
    }], function () { return [{ type: ɵngcc0.ElementRef, decorators: [{
                type: Inject,
                args: [ElementRef]
            }] }]; }, { data: [{
            type: Input
        }], change: [{
            type: Output
        }], pickerGroupLayer: [{
            type: ViewChildren,
            args: ['pickerGroupLayer']
        }], pickerHandleLayer: [{
            type: ViewChild,
            args: ['pickerHandleLayer']
        }] }); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵngcc0.ɵɵsetNgModuleScope(WheelSelectorModule, { declarations: function () { return [WheelSelectorComponent]; }, imports: function () { return [CommonModule]; }, exports: function () { return [WheelSelectorComponent]; } }); })();
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(WheelSelectorModule, [{
        type: NgModule,
        args: [{
                imports: [
                    CommonModule
                ],
                declarations: [WheelSelectorComponent],
                exports: [WheelSelectorComponent]
            }]
    }], null, null); })();

/**
 * Generated bundle index. Do not edit.
 */

export { WheelSelectorComponent, WheelSelectorModule };

//# sourceMappingURL=hyperblob-ngx-wheel-selector.js.map