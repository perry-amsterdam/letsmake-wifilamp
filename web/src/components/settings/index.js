import { h, Component } from 'preact'
import style from './style.less'
import MyColorPicker from './../picker'
import OnOff from './../onoff'

const toHHMMSS = secs => {
  const sec_num = parseInt(secs, 10)
  const hours = Math.floor(sec_num / 3600) % 24
  const minutes = Math.floor(sec_num / 60) % 60
  const seconds = sec_num % 60
  return [hours, minutes, seconds]
    .map(v => v < 10 ? `0${v}` : v)
    .filter((v, i) => v !== '00' || i > 0)
    .join(':')
}

const DeviceInfo = ({ chipid, fwVersion, uptime, connection }) => (
  <table>
    <tr>
      <th>Chip ID</th>
      <td>{ chipid }</td>
    </tr>
    <tr>
      <th>Firmware version</th>
      <td>{ fwVersion }</td>
    </tr>
    <tr>
      <th>Uptime</th>
      <td>{ toHHMMSS(uptime) }</td>
    </tr>
    <tr>
      <th>Current SSID</th>
      <td>{ connection && connection.ssid }</td>
    </tr>
    <tr>
      <th>AP mode</th>
      <td>{ connection && connection.ap ? 'yes' : 'no' }</td>
    </tr>
    <tr>
      <th>MAC address</th>
      <td>{connection && connection.mac}</td>
    </tr>
  </table>
)


class AdminPass extends Component {
  state = {
    password1: '',
    password2: '',
    valid: true,
  }

  handleChange1 = event => {
    this.setState({ password1: event.target.value })
    this.fireChange()
  }

  handleChange2 = event => {
    this.setState({ password2: event.target.value })
    this.fireChange()
  }

  fireChange = () => {
    const l = this.state.password1.length
    const valid = this.state.password1 === this.state.password2 && ((l >= 4 && l <= 64) || l === 0)
    this.setState({ valid })
    this.props.onChange(valid, valid ? this.state.password1 : '')
  }

  render = (_, { valid, password1 }) => (
    <div>
      <p><input type="password" placeholder="Enter admin password" maxLength="64" onInput={this.handleChange1}/></p>
      <p><input type="password" placeholder="Verify admin password" maxLength="64" onInput={this.handleChange2}/></p>
      { valid ?
        password1.length > 0 && <p className={style.success}>Password is verified and will be changed on save.</p>
        : <p className={style.error}>Password must have between 4 and 64 characters and must match.</p> }
    </div>
  )
}


export default class Settings extends Component {
  state = {
    defaultColor: { r: 255, g: 255, b: 255 },
    defaultOn: true,
    buttonEnabled: true,
    connection: {},
    info: {
      chipid: 0,
      fwVersion: '',
      uptime: 0,
    },
    password: {
      valid: true,
      value: '',
    },

    changed: false,
    loading: false,
    afterReboot: false,
  };

  componentDidMount() {
    this.reload()
  }

  reload = () => {
    this.setState({ loading: true })
    this.props.device.loadFullStatus((error, status) => {
      if (error) {
        this.setState({ loading: false })
        return
      }

      const { chipid, fwVersion, uptime, buttonEnabled } = status

      const def = status.default
      const { r, g, b } = def
      const defaultOn = def.on

      const { ssid, mac, ap } = status.connection
      const connection = { mac, ap, ssid }

      this.setState({ defaultOn, defaultColor: { r, g, b }, buttonEnabled, connection, info: { chipid, fwVersion, uptime }, loading: false, changed: false })
    })
  }

  handleDefaultColor = newColor => {
    const { r, g, b } = newColor.rgb
    const defaultColor = { r, g, b }

    this.setState({ defaultColor, changed: true })
  }

  handleDefaultOn = defaultOn => {
    this.setState({ defaultOn, changed: true })
  }

  handleButtonEnabled = buttonEnabled => {
    this.setState({ buttonEnabled, changed: true })
  }

  handlePassword = (valid, value) => {
    this.setState({ password: { valid, value }, changed: true })
  }

  handleSave = () => {
    if (this.state.loading) { return }

    const params = {
      pass: this.state.password.valid ? this.state.password.value : '',
      r: this.state.defaultColor.r,
      g: this.state.defaultColor.g,
      b: this.state.defaultColor.b,
      on: this.state.defaultOn ? 1 : 0,
      button: this.state.buttonEnabled ? 1 : 0,
    }

    this.setState({ loading: true })
    this.props.device.saveConfig(params, error => {
      if (error) {
        this.setState({ loading: false })
        return
      }

      this.reload()
    })
  }

  handleReboot = () => {
    this.setState({ loading: true })
    this.props.device.reboot(error => {
      this.setState({ loading: false, afterReboot: !error })
    })
  }

  render = (_, { defaultOn, defaultColor, buttonEnabled, info, connection, changed, password, loading, afterReboot }) => {
    if (afterReboot) {
      return (
        <div className={style.settings}>
          <h2>Reboot</h2>
          <p>Device is rebooting right now. Refresh the page after device is ready.</p>
        </div>
      )
    }

    return (
      <div className={style.settings}>
        <h2>State after power-on</h2>
        <OnOff onChange={this.handleDefaultOn} on={defaultOn}/>
        <MyColorPicker onChangeComplete={this.handleDefaultColor} color={defaultColor}/>

        <h2>Touch button enabled</h2>
        <OnOff onChange={this.handleButtonEnabled} on={buttonEnabled}/>

        <h2>Admin password</h2>
        <AdminPass onChange={this.handlePassword}/>

        <h2>Device info</h2>
        <DeviceInfo {...info} connection={connection}/>
        <p>
          <button onClick={this.handleReboot} disabled={loading}>Reboot device</button>
        </p>

        {changed && <button onClick={this.handleSave} disabled={!password.valid || loading} className={style.saveButton}>Save changes</button> }
      </div>
    )
  }
}
