import { OnInit, AfterViewInit, OnDestroy, EventEmitter, ElementRef } from '@angular/core';
import { SelectorModel } from './wheel-selector.models';
import * as ɵngcc0 from '@angular/core';
export { SelectorModel as PickerDataModel };
export declare class WheelSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
    pickerGroupLayer: any;
    pickerHandleLayer: any;
    data: SelectorModel[];
    change: EventEmitter<any>;
    currentIndexList: number[];
    lastCurrentIndexList: number[];
    groupsRectList: any[];
    touchOrMouse: {
        isTouchable: boolean;
        isMouseDown: boolean;
    };
    draggingInfo: {
        isDragging: boolean;
        groupIndex: any;
        startPageY: any;
    };
    itemPerDegree: number;
    safeDoTimeoutId: any;
    constructor(elementRef: ElementRef);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    setGroupData(gIndex: any, groupData: any): void;
    getInitialCurrentIndexList(): number[];
    safeGetRectsBindEvents(): void;
    getGroupsRectList(): void;
    eventsRegister(): void;
    addEventsForElement(el: any): void;
    triggerMiddleLayerGroupClick(gIndex: any): void;
    triggerAboveLayerClick(ev: any, gIndex: any): void;
    triggerMiddleLayerClick(ev: any, gIndex: any): void;
    triggerBelowLayerClick(ev: any, gIndex: any): void;
    getTouchInfo(ev: any): any;
    getGroupIndexBelongsEvent(ev: any): number;
    handleEventClick(ev: any): void;
    handleStart(ev: any): void;
    handleMove(ev: any): void;
    handleEnd(ev: any): void;
    handleCancel(ev: any): void;
    handleWheel(ev: any): void;
    setCurrentIndexOnWheel(ev: any): void;
    setCurrentIndexOnMove(ev: any): void;
    correctionAfterDragging(ev: any): void;
    correctionCurrentIndex(ev: any, gIndex: any): void;
    isCurrentItem(gIndex: any, iIndex: any): boolean;
    getCurrentIndexList(): number[];
    getGroupClass(gIndex: any): string[];
    getItemClass(gIndex: any, iIndex: any, isDivider?: boolean): any[];
    getItemStyle(gIndex: any, iIndex: any): {
        transform: string;
        opacity: string;
    } | {
        transform: string;
    };
    static ɵfac: ɵngcc0.ɵɵFactoryDef<WheelSelectorComponent, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<WheelSelectorComponent, "ngx-wheel-selector", never, { "data": "data"; }, { "change": "change"; }, never, never>;
}

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hlZWwtc2VsZWN0b3IuY29tcG9uZW50LmQudHMiLCJzb3VyY2VzIjpbIndoZWVsLXNlbGVjdG9yLmNvbXBvbmVudC5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTZWxlY3Rvck1vZGVsIH0gZnJvbSAnLi93aGVlbC1zZWxlY3Rvci5tb2RlbHMnO1xuZXhwb3J0IHsgU2VsZWN0b3JNb2RlbCBhcyBQaWNrZXJEYXRhTW9kZWwgfTtcbmV4cG9ydCBkZWNsYXJlIGNsYXNzIFdoZWVsU2VsZWN0b3JDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gICAgcGlja2VyR3JvdXBMYXllcjogYW55O1xuICAgIHBpY2tlckhhbmRsZUxheWVyOiBhbnk7XG4gICAgZGF0YTogU2VsZWN0b3JNb2RlbFtdO1xuICAgIGNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT47XG4gICAgY3VycmVudEluZGV4TGlzdDogbnVtYmVyW107XG4gICAgbGFzdEN1cnJlbnRJbmRleExpc3Q6IG51bWJlcltdO1xuICAgIGdyb3Vwc1JlY3RMaXN0OiBhbnlbXTtcbiAgICB0b3VjaE9yTW91c2U6IHtcbiAgICAgICAgaXNUb3VjaGFibGU6IGJvb2xlYW47XG4gICAgICAgIGlzTW91c2VEb3duOiBib29sZWFuO1xuICAgIH07XG4gICAgZHJhZ2dpbmdJbmZvOiB7XG4gICAgICAgIGlzRHJhZ2dpbmc6IGJvb2xlYW47XG4gICAgICAgIGdyb3VwSW5kZXg6IGFueTtcbiAgICAgICAgc3RhcnRQYWdlWTogYW55O1xuICAgIH07XG4gICAgaXRlbVBlckRlZ3JlZTogbnVtYmVyO1xuICAgIHNhZmVEb1RpbWVvdXRJZDogYW55O1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpO1xuICAgIG5nT25Jbml0KCk6IHZvaWQ7XG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQ7XG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZDtcbiAgICBzZXRHcm91cERhdGEoZ0luZGV4OiBhbnksIGdyb3VwRGF0YTogYW55KTogdm9pZDtcbiAgICBnZXRJbml0aWFsQ3VycmVudEluZGV4TGlzdCgpOiBudW1iZXJbXTtcbiAgICBzYWZlR2V0UmVjdHNCaW5kRXZlbnRzKCk6IHZvaWQ7XG4gICAgZ2V0R3JvdXBzUmVjdExpc3QoKTogdm9pZDtcbiAgICBldmVudHNSZWdpc3RlcigpOiB2b2lkO1xuICAgIGFkZEV2ZW50c0ZvckVsZW1lbnQoZWw6IGFueSk6IHZvaWQ7XG4gICAgdHJpZ2dlck1pZGRsZUxheWVyR3JvdXBDbGljayhnSW5kZXg6IGFueSk6IHZvaWQ7XG4gICAgdHJpZ2dlckFib3ZlTGF5ZXJDbGljayhldjogYW55LCBnSW5kZXg6IGFueSk6IHZvaWQ7XG4gICAgdHJpZ2dlck1pZGRsZUxheWVyQ2xpY2soZXY6IGFueSwgZ0luZGV4OiBhbnkpOiB2b2lkO1xuICAgIHRyaWdnZXJCZWxvd0xheWVyQ2xpY2soZXY6IGFueSwgZ0luZGV4OiBhbnkpOiB2b2lkO1xuICAgIGdldFRvdWNoSW5mbyhldjogYW55KTogYW55O1xuICAgIGdldEdyb3VwSW5kZXhCZWxvbmdzRXZlbnQoZXY6IGFueSk6IG51bWJlcjtcbiAgICBoYW5kbGVFdmVudENsaWNrKGV2OiBhbnkpOiB2b2lkO1xuICAgIGhhbmRsZVN0YXJ0KGV2OiBhbnkpOiB2b2lkO1xuICAgIGhhbmRsZU1vdmUoZXY6IGFueSk6IHZvaWQ7XG4gICAgaGFuZGxlRW5kKGV2OiBhbnkpOiB2b2lkO1xuICAgIGhhbmRsZUNhbmNlbChldjogYW55KTogdm9pZDtcbiAgICBoYW5kbGVXaGVlbChldjogYW55KTogdm9pZDtcbiAgICBzZXRDdXJyZW50SW5kZXhPbldoZWVsKGV2OiBhbnkpOiB2b2lkO1xuICAgIHNldEN1cnJlbnRJbmRleE9uTW92ZShldjogYW55KTogdm9pZDtcbiAgICBjb3JyZWN0aW9uQWZ0ZXJEcmFnZ2luZyhldjogYW55KTogdm9pZDtcbiAgICBjb3JyZWN0aW9uQ3VycmVudEluZGV4KGV2OiBhbnksIGdJbmRleDogYW55KTogdm9pZDtcbiAgICBpc0N1cnJlbnRJdGVtKGdJbmRleDogYW55LCBpSW5kZXg6IGFueSk6IGJvb2xlYW47XG4gICAgZ2V0Q3VycmVudEluZGV4TGlzdCgpOiBudW1iZXJbXTtcbiAgICBnZXRHcm91cENsYXNzKGdJbmRleDogYW55KTogc3RyaW5nW107XG4gICAgZ2V0SXRlbUNsYXNzKGdJbmRleDogYW55LCBpSW5kZXg6IGFueSwgaXNEaXZpZGVyPzogYm9vbGVhbik6IGFueVtdO1xuICAgIGdldEl0ZW1TdHlsZShnSW5kZXg6IGFueSwgaUluZGV4OiBhbnkpOiB7XG4gICAgICAgIHRyYW5zZm9ybTogc3RyaW5nO1xuICAgICAgICBvcGFjaXR5OiBzdHJpbmc7XG4gICAgfSB8IHtcbiAgICAgICAgdHJhbnNmb3JtOiBzdHJpbmc7XG4gICAgfTtcbn1cbiJdfQ==