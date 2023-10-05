[![NPM](https://nodei.co/npm/ngx-wheel-selector.png)](https://nodei.co/npm/ngx-wheel-selector/)

# ngx-wheel-selector
A Wheel Selector (or Data Picker) for Angular 7+

This project is based on [hiyali's](https://github.com/hiyali) [data-picker](https://github.com/hiyali/ng-data-picker)

## Examples

Examples and demos can be consulted in it's [original repo](https://github.com/hiyali/ng-data-picker)

> We are working on our own examples and a documentation page

## Install


```shell
npm i  @hyperblob/ngx-wheel-selector
```
> Note that instalation and implementation may change

## Usage

### Quick look

#### app.module.ts
```typescript
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { DataPickerComponent } from 'ng-data-picker'

@NgModule({
  ...
  imports: [
    WheelSelectorModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA // for third party component
  ],
  ...
})
```

#### app.component.ts
```typescript
export class AppComponent {
  data = [
    {
      list: ['sun', 'earth', 'moon']
    }
  ]

  change ({ gIndex, iIndex }) {
    console.log(gIndex, iIndex)
  }
}
```

#### app.component.html
```html
<ngx-wheel-selector [data]="data" (change)="change($event)"></ngx-wheel-selector>
```

## ⚙️ Props

Data input must be an array of configurations called "Groups", see below:

| name                       | type       | default       | explain                          |
| :------------------------- | :--------- | :------------ | :------------------------------- |
| `change`                   | `Function` | ({gIndex,iIndex})=>{} | Callback after which group's current index changed, pass two arguments, group index `gIndex` and item index `iIndex` |
| `data`                     | `Array`    | []            | Picker initial data              |
| `data[i].currentIndex`     | `Number`   | 0             | Current index of this group's list |
| `data[i].weight`           | `Number`   | 1             | Group weights in parent width `1..12` |
| `data[i].list`             | `Array`    | -             | List of the group                |
| `data[i].list[j]`          | `String` or `Object` | -   | Item in the list of group, use `value` key when it is a object item |
| `data[i].onClick`          | `Function` | -             | Click event on the middle layer of this group, pass two arguments that group index `gIndex` and selected index `iIndex` of this group |
| `data[i].textAlign`        | `String`   | -             | `start` `center` `end` `justify` `left` `right` `nowrap` `wrap` |
| `data[i].className`        | `String`   | -             | Your custom class name for this group |
| `data[i].divider`          | `Boolean`  | false         | If it is true, then `onClick` `list` `currentIndex` will not be used |
| `data[i].text`             | `String`   | -             | Just use this text when `divider` is true |

## 🔨 Instance methods

| name                       | type       | explain                          |
| :------------------------- | :--------- | :------------------------------- |
| `setGroupData`             | `Function` (gIndex,gData)=>void | Dynamically set a group data with two arguments `(gIndex, gData)`, group index and group data (see props `data[i]`) |
| `getCurrentIndexList`      | `Function` ()=>[] | Return a `Array` of the groups current index list (has divider current index, and it is default to `0`) |
| `getGroupsRectList`        | `Function` ()=>void | Get some info for gesture, you can call this function when the component displayed if the component is hidden when it's initialization |

## Development

```shell
npm start # development
npm run build:prod # build for production
npm run prepare # build for third party
```

## License

MIT

