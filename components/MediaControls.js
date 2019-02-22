// @flow

import React, { Component, type Node } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Animated,
  Image,
  TouchableWithoutFeedback,
  // eslint ignore next $FlowFixMe
} from 'react-native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import Slider from 'react-native-slider';
import styles from './MediaControlsStyles';
import { humanizeVideoDuration, noop } from './Utility';
import PLAYER_STATES, { type PlayerState } from './Constants';

const { Popover } = renderers;
const touchableOpacityProps = {
  activeOpacity: 0.6,
};

type Props = {
  toolbar: Node,
  mainColor: string,
  isLoading: boolean,
  progress: number,
  buffer: number,
  duration: number,
  playerState: PlayerState,
  onFullScreen: Function,
  onSettings: Function,
  onPaused: Function,
  onReplay: Function,
  onSeek: Function,
  onSeeking: Function,
  onCaptionSelect: Function,
};

type State = {
  opacity: Object,
  isVisible: boolean,
  isSettingsVisible: boolean,
  captions: String
};

class MediaControls extends Component<Props, State> {
  static defaultProps = {
    isFullScreen: false,
    isLoading: false,
    mainColor: 'rgba(12, 83, 175, 0.9)',
    onFullScreen: noop,
    onSettings: noop,
    onReplay: noop,
    onSeeking: noop,
    onCaptionSelect: noop,
  };

  state = {
    opacity: new Animated.Value(1),
    isVisible: true,
    isSettingsVisible: false,
    selectedCaption: 'disabled'
  };

  componentDidMount() {
    this.fadeOutControls(5000);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.playerState === PLAYER_STATES.ENDED) {
      this.fadeInControls(false);
    }
  }

  onReplay = () => {
    this.fadeOutControls(5000);
    this.props.onReplay();
  };

  onPause = () => {
    const { playerState, onPaused } = this.props;
    const { PLAYING, PAUSED, ENDED } = PLAYER_STATES;
    switch (playerState) {
      case PLAYING: {
        this.cancelAnimation();
        break;
      }
      case PAUSED: {
        this.fadeOutControls(5000);
        break;
      }
      default:
        break;
    }
    let newPlayerState = playerState === PLAYING ? PAUSED : PLAYING;
    if ( playerState === ENDED) { newPlayerState = ENDED };
    return onPaused(newPlayerState);
  };

  setLoadingView = () => <ActivityIndicator size="large" color="#FFF" />;

  setPlayerControls = (playerState: PlayerState) => {
    const icon = this.getPlayerStateIcon(playerState);
    const pressAction =
      playerState === PLAYER_STATES.ENDED ? this.onReplay : this.onPause;
    return (
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: 'rgba(0,0,0,0)' }]}
        onPress={pressAction}
      >
        <Image source={icon} style={styles.playIcon} />
      </TouchableOpacity>
    );
  };

  getPlayerStateIcon = (playerState: PlayerState) => {
    switch (playerState) {
      case PLAYER_STATES.PAUSED:
        // eslint ignore next $FlowFixMe
        return require('../assets/ic_play.png');
      case PLAYER_STATES.PLAYING:
        // eslint ignore next $FlowFixMe
        return require('../assets/ic_pause.png');
      case PLAYER_STATES.ENDED:
        // eslint ignore next $FlowFixMe
        return require('../assets/ic_replay.png');
      default:
        return null;
    }
  };

  cancelAnimation = () => {
    this.state.opacity.stopAnimation(() => {
      this.setState({ isVisible: true });
    });
  };

  toggleControls = () => {
    // value is the last value of the animation when stop animation was called.
    // As this is an opacity effect, I (Charlie) used the value (0 or 1) as a boolean
    this.state.opacity.stopAnimation((value: number) => {
      this.setState({ isVisible: !!value });
      return value ? this.fadeOutControls() : this.fadeInControls();
    });
  };

  fadeOutControls = (delay: number = 0) => {
    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: 300,
      delay,
    }).start(result => {
      /* I noticed that the callback is called twice, when it is invoked and when it completely finished
      This prevents some flickering */
      if (result.finished) this.setState({ isVisible: false });
    });
  };

  fadeInControls = (loop: boolean = true) => {
    this.setState({ isVisible: true });
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 300,
      delay: 0,
    }).start(() => {
      if (loop) {
        this.fadeOutControls(5000);
      }
    });
  };

  dragging = (value: number) => {
    const { onSeeking, playerState } = this.props;
    onSeeking(value);
    if (playerState === PLAYER_STATES.PAUSED) return;

    this.onPause();
  };

  seekVideo = (value: number) => {
    this.props.onSeek(value);
    this.onPause();
  };

  selectCaption(value) {
    this.setState({ selectedCaption: value });
    this.props.onCaptionSelect(value);
    this.fadeOutControls();
    // return false;  // keeps menu open instead of auto closing after selection
  };

  renderControls() {
    const {
      duration,
      isLoading,
      mainColor,
      onFullScreen,
      playerState,
      progress,
      buffer,
      toolbar,
    } = this.props;
    
    // this let us block the controls
    if (!this.state.isVisible) return null;

    // eslint ignore next $FlowFixMe
    const fullScreenImage = require('../assets/ic_fullscreen.png');
    const settingsImage = require('../assets/ic_settings.png');
    return (
      
      <View style={styles.container}>
        <View style={[styles.toolbarRow]}>
            {this.props.toolbar}
        </View>
        <View style={[styles.controlsRow]}>
          {isLoading
            ? this.setLoadingView()
            : this.setPlayerControls(playerState)}
        </View>
        <View style={[styles.progressContainer]}>
          <View style={styles.progressEndContainer}>
            <View style={styles.progressColumnContainer}>
              <View style={[styles.timerLabelsContainer]}>
                <Text style={styles.timerLabel}>
                  {humanizeVideoDuration(progress)}
                </Text>
                <Text style={styles.timerLabel}>
                  {humanizeVideoDuration(duration)}
                </Text>
              </View>
              <Slider
                style={styles.progressSlider}
                onValueChange={this.dragging}
                onSlidingComplete={this.seekVideo}
                maximumValue={Math.floor(duration)}
                value={Math.floor(progress)}
                buffer={Math.floor(buffer)}
                trackStyle={styles.track}
                thumbStyle={[styles.thumb]}
                minimumTrackTintColor='#f9f9f9'
                maximumTrackTintColor='#666666'
                bufferTrackTintColor='#bbbbbb'
              />
            </View>

            <Menu renderer={Popover}
                  onSelect={value => this.selectCaption(value)}
                  rendererProps={{ placement: 'top',
                                  anchorStyle: styles.anchorStyle }}>
            
              <MenuTrigger style={styles.menuTrigger}
                          customStyles={{ TriggerTouchableComponent: TouchableOpacity,
                                          TriggerTouchable: touchableOpacityProps }}>
                <Image source={settingsImage} />
              </MenuTrigger>

              <MenuOptions customStyles={menuOption}>
                <MenuOption value='disabled' text='Off' customStyles={this.state.selectedCaption == 'disabled' ? selectedMenuOption : menuOption} />
                <MenuOption value='English' text='English' customStyles={this.state.selectedCaption == 'English' ? selectedMenuOption : menuOption} />
                <MenuOption value='Chinese' text='Chinese' customStyles={this.state.selectedCaption == 'Chinese' ? selectedMenuOption : menuOption} />
                <MenuOption value='both' text='English & Chinese' customStyles={this.state.selectedCaption == 'both' ? selectedMenuOption : menuOption} />
              </MenuOptions>
            </Menu>
          
            <TouchableOpacity style={styles.fullScreenContainer}
                              onPress={onFullScreen}>
              <Image source={fullScreenImage} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={this.toggleControls}>
        <Animated.View
          style={[styles.container, { opacity: this.state.opacity }]}
        >
          {this.renderControls()}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

const menuOption = {
  optionsContainer: {
    backgroundColor: 'dimgrey',
    padding: 5,
  },
  // optionsWrapper: {
  //   backgroundColor: 'purple',
  // },
  // optionWrapper: {
  //   backgroundColor: 'yellow',
  //   margin: 5,
  // },
  // optionTouchable: {
  //   underlayColor: 'gold',
  //   activeOpacity: 70,
  // },
  optionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  // OptionTouchableComponent: TouchableOpacity,
  // optionTouchable: touchableOpacityProps,
};

const selectedMenuOption = {
  optionsContainer: {
    backgroundColor: 'dimgrey',
    padding: 5,
  },
  // optionsWrapper: {
  //   backgroundColor: 'purple',
  // },
  // optionWrapper: {
  //   backgroundColor: 'yellow',
  //   margin: 5,
  // },
  // optionTouchable: {
  //   underlayColor: 'gold',
  //   activeOpacity: 70,
  // },
  optionText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // OptionTouchableComponent: TouchableOpacity,
  // optionTouchable: touchableOpacityProps,
};

export default MediaControls;
