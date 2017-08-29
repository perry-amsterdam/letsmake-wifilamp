import { h, Component } from 'preact'
import style from './style.less'
import { CustomPicker } from 'react-color'
import { Saturation, Hue } from 'react-color/lib/components/common'

const MySatPointer = () => <div className={style.satPointer}/>
const MyHuePointer = () => <div className={style.huePointer}/>

class MySwatch extends Component {
  handleClick = e => {
    e.preventDefault()
    this.props.onClick(this.props.color)
  }

  render = () =>
    (<button className={style.swatch}
      style={{ 'background-color': this.props.color }}
      onClick={this.handleClick}/>)
}

class MyColorPicker extends Component {
  static defaultProps = {
    colors: ['#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF', '#FFFFFF', '#808080'],
  }

  render = () => (
    <div className={style.myPicker}>
      <div className={style.swatchList}>
        {this.props.colors.map((c, index) => (
          <MySwatch
            key={index}
            color={c}
            onClick={this.props.onChange}/>
        )) }
        <div className={style.clear}/>
      </div>
      <div className={style.huePicker}>
        <Hue {...this.props} onChange={this.props.onChange} pointer={MyHuePointer}/>
      </div>
      <div className={style.satPicker}>
        <Saturation {...this.props} onChange={this.props.onChange} pointer={MySatPointer}/>
      </div>
    </div>
  )
}

export default CustomPicker(MyColorPicker)
