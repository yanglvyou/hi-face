import Taro from '@tarojs/taro'
import { View, Block, Image, Button } from '@tarojs/components'
import { isIphoneSafeArea } from 'utils/common'
import { getImg } from 'utils/image-utils'
import TaroCropper from 'components/taro-cropper'
import userActions from '@/store/user'

import './styles.styl'

const IS_IPHONEX = isIphoneSafeArea()

export default class MenuChoose extends Taro.Component {
  config = {
    component: true
  }

  static options = {
    addGlobalClass: true
  }

  static defaultProps = {
    isShowMenuMain: false,
    cropperWidth: 600,
    cropperHeight: 600,
    onChoose: () => {},
    onMenuMainTogggle: () => { }
  }

  constructor(props) {
    super(props)
    this.state = {
      isMenuOpen: false,
      originSrc: ''
    }
  }

  onMenuMainTogggle = () => {
    const { onMenuMainTogggle } = this.props
    onMenuMainTogggle()
  }
  onMenuOpenToggle = () => {
    this.setState({
      isMenuOpen: !this.state.isMenuOpen
    })
  }

  onChooseImage = (way) => {
    Taro.chooseImage({
      count: 1,
      sourceType: [way],
    }).then(res => {
      this.setState({
        originSrc: res.tempFilePaths[0]
      });
    }).catch(error => {
      console.log('error :', error);
    })
  }

  onCut = (cutImageSrc) => {
    const { onChoose } = this.props
    onChoose(cutImageSrc)
    this.setState({
      originSrc: ''
    })
  }

  onCancel = () => {
    this.setState({
      originSrc: ''
    })
  }

  //用户按了允许授权按钮
  onGetUserInfo = async (e) => {
    if (e.detail.userInfo) {
      // 授权后默认完成用户登录
      userActions.login()
      Taro.showToast({
        icon: 'none',
        title: '获取头像...'
      })
      try {
        Taro.hideToast()
        let avatarUrl = await getImg(e.detail.userInfo.avatarUrl.replace('/132', '/0'))
        
        if (avatarUrl) {
          this.setState({
            originSrc: avatarUrl
          });
        }

      } catch (error) {
        console.log('avatarUrl download error:', error);
        Taro.showToast({
          icon: 'none',
          title: '获取失败，请使用相册'
        })
      }
    }
  }

  render() {
    const { isMenuShow, cropperWidth, cropperHeight  } = this.props
    const { isMenuOpen, originSrc } = this.state

    return (
      <Block>
        <View className={`menu-choose ${IS_IPHONEX ? 'bottom-safe-area' : ''} ${isMenuShow ? 'menu-show' : ''} ${isMenuOpen ? 'menu-open' : ''}`} onClick={this.onMenuOpenToggle}>
          <Button
            className="menu-item menu-item-avatar"
            type="default"
            openType="getUserInfo"
            onGetUserInfo={this.onGetUserInfo}
          >头像</Button>
          <View className='menu-item menu-item-camera' onClick={this.onChooseImage.bind(this, 'camera')}>
            相机
          </View>
          <View className='menu-item menu-item-album' onClick={this.onChooseImage.bind(this, 'album')}>
            相册
          </View>
          {/* <View className='menu-item menu-item-search'></View> */}
          <View className='menu-choose-btn'></View>
        </View>
        <View className='cropper-wrap' style={{ display: originSrc ? 'block' : 'none' }}>
          <TaroCropper
            src={originSrc}
            cropperWidth={cropperWidth}
            cropperHeight={cropperHeight}
            pixelRatio={2}
            ref={node => this.taroCropperRef = node}
            fullScreen
            fullScreenCss
            onCut={this.onCut}
            hideCancelText={false}
            onCancel={this.onCancel}
          />
        </View>

      </Block>
    )
  }
}