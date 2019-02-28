import React, { Component } from 'react';
import {
    BackHandler,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-navigation';

import MediaControls from './components/MediaControls';
import PLAYER_STATES from './components/Constants';
import RelatedVideos from './components/RelatedVideos';

Orientation.lockToPortrait();

// TODO: Portrait videos, need to toggle play pause to play after seeking on android after end
//       hide ios homebar, do not hide controls when captions panel open

const width = Dimensions.get('screen').width;

export default class VideoScreen extends Component {
  videoPlayer;
  scrollView;
  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);
    this.state = {
      currentTime: 0,
      bufferTime: 0,
      duration: 0,
      isFullScreen: false,
      isLoading: true,
      paused: false,
      playerState: PLAYER_STATES.PLAYING,
      text: {
        type: 'disabled',
        value: 'disabled'
      },
      videoStyle: styles.videoView,
      aspectRatio: 16/9,
      viewText: 'loading...',
      thumbUp: null,
      resizeMode: 'contain',
      followed: false
    };

    this._didFocusSubscription = props.navigation.addListener('didFocus', () =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentDidMount(){
    const baseViewCountURI = 'https://twdiusa780.execute-api.us-west-2.amazonaws.com/default/updateViews?ID=';
    fetch(baseViewCountURI + this.props.navigation.getParam('videoID'))
      .then((response) => response.text())
      .then((text) => { 
        this.setState({ viewText: text }); 
      })
      .catch((error) => {
        throw(error);
      });

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', () =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  onBackButtonPressAndroid = () => {
    if (this.state.isFullScreen) {
      this.onFullScreen();
      return true;
    } else {
      return false;
    }
  };

  onSeek = seek => {
    this.videoPlayer.seek(seek);
  };

  onPaused = playerState => {
    if (playerState === PLAYER_STATES.ENDED) {
      this.setState({
        paused: true,
        playerState: PLAYER_STATES.PAUSED
      });
    } else {
      this.setState({
        paused: !this.state.paused,
        playerState,
      });
    }
  };

  onReplay = () => {
    this.setState({ playerState: PLAYER_STATES.PLAYING });
    this.videoPlayer.seek(0);
  };

  onProgress = data => {
    // Video Player will continue progress even if the video already ended
    //if (!isLoading) {
    this.setState({ currentTime: data.currentTime,
                    bufferTime: data.playableDuration,
                    isLoading: false });
    //}
  };

  onBandwidthUpdate = data => {
    // console.log('bitrate: '+data.bitrate);
  }

  onLoad = data => {
    this.setState({ duration: data.duration,
                    isLoading: false,
                    aspectRatio: data.naturalSize.width && data.naturalSize.height
                                  ? 16/9
                                  : data.naturalSize.width / data.naturalSize.height});
  };

  onLoadStart = () => this.setState({ isLoading: true });

  onEnd = () => {
    this.setState({ playerState: PLAYER_STATES.ENDED,
                    currentTime: this.state.duration });
  };

  onError = () => alert('Oh! ', error);

  exitFullScreen = () => {};

  enterFullScreen = () => {};

  onFullScreen = () => {
    if (this.state.isFullScreen) {
      Orientation.lockToPortrait();
      this.props.navigation.setParams({header: undefined}); // setting to undef uses default header
      (Platform.OS == 'android') && this.videoPlayer.dismissFullscreenPlayer();
    } else {
      (Platform.OS == 'android') && this.videoPlayer.presentFullscreenPlayer();
      this.props.navigation.setParams({header: null});
      Orientation.lockToLandscape();
    }
    this.setState(({ isFullScreen }) => ({ isFullScreen: !isFullScreen }));
  };

  onCaptionSelect = value => {
    let subtitleSelector;
    let selectorValue;
    const isPlatformAndroid = (Platform.OS == 'android');
    
    switch (value) {
      case 'disabled':
        subtitleSelector = 'disabled';
        selectorValue = 'disabled';
        break;
      case 'English':
        subtitleSelector = 'language';
        selectorValue = isPlatformAndroid ? 'eng' : 'en'; 
        break;
      case 'Chinese':
        subtitleSelector = 'language';
        selectorValue = 'chi';
        break;
      case 'both':
        subtitleSelector = 'language';
        selectorValue = isPlatformAndroid ? 'por' : 'pt';
        break;
    }

    this.setState({ text: { type: subtitleSelector,
                            value: selectorValue }});

  };

  onBuffer = data => {
    this.setState({ isLoading: data.isBuffering });
    //console.log(data.isBuffering);
  }

  toggleResizeMode = () => {
    this.setState(({ resizeMode }) => {
      let newMode;
      if (resizeMode == 'contain') {
        newMode = 'cover';
      } else {
        newMode = 'contain';
      }

      return { resizeMode : newMode };
    });
  }

  onThumbPress = val => {
    if (val == this.state.thumbUp) {
      this.setState({ thumbUp: null });
    } else {
      this.setState({ thumbUp: val });
    }
  }

  toggleFollow = () => {
    this.setState(({ followed }) => ({ followed : !followed }));
  }

  scrollToComments = () => {
    this.scrollView.scrollToEnd();
  }

  renderToolbar = () => {
    if (this.state.isFullScreen) {
      const { navigation } = this.props;
      const info = (this.props.lang) == 'chinese' ? navigation.getParam('chineseInfo') : navigation.getParam('englishInfo');
      const videoTitle = info.videoTitle;
      return (
        <View style={styles.toolbar}>
          <Text style={styles.fullscreenTitle}>{videoTitle}</Text>
          <TouchableOpacity style={styles.overscan} onPress={this.toggleResizeMode}>
            <Image source={require('./assets/ic_overscan.png')} />
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  };
  onSeeking = currentTime => this.setState({ currentTime });
  render() {
    const { navigation } = this.props;
    const info = (this.props.lang) == 'chinese' ? navigation.getParam('chineseInfo') : navigation.getParam('englishInfo');
    const videoURI = navigation.getParam('video');
    const uploadDate = info.date;
    const videoTitle = info.videoTitle;
    const description = info.description;
    const creator = info.creator;
    const commentsText = (this.props.lang) == 'chinese' 
                                              ? '我们正在努力做评论功能。你们可以先加下我的微信，我会组织一些群一起讨论视频内容并且学习里面地道的英语，有什么问题都可以来问我哦！'
                                              : 'Coming soon. For now add the following WeChat for discussion and tutoring';
    const thumbUpSrc = (this.state.thumbUp) ? require('./assets/ic_thumb_filled.png') : require('./assets/ic_thumb.png');
    const thumbDownSrc = (this.state.thumbUp) == false ? require('./assets/ic_thumb_filled.png') : require('./assets/ic_thumb.png');
    return (
      
      <View style={styles.container}>
      <SafeAreaView style={this.state.isFullScreen ? styles.fullscreenContainer : styles.container}
                    forceInset={{ bottom: this.state.isFullScreen ? 'never' : 'always' }}>
        
        <View style={this.state.isFullScreen 
                      ? styles.fullscreenVideoView 
                      : StyleSheet.flatten([styles.videoView,{height: width/this.state.aspectRatio}])}>
            <Video
            onEnd={this.onEnd}
            onLoad={this.onLoad}
            onBuffer={this.onBuffer}
            onLoadStart={this.onLoadStart}
            onProgress={this.onProgress}
            onBandwidthUpdate={this.onBandwidthUpdate}
            paused={this.state.paused}
            ref={videoPlayer => (this.videoPlayer = videoPlayer)}
            resizeMode={this.state.resizeMode}
            //source={{ uri: 'https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4' }}
            //source={{ uri: 'https://www.3playmedia.com/wp-content/uploads/encoded-captions-demo.m4v' }}
            //source={{ uri: 'https://ph2dw9.oloadcdn.net/dl/l/-0QCi2RsXBGJnCGH/UmLNspHdKgI/encoded-captions-demo.m4v'}}
            //source={{ uri: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8' }}
            //source={{ uri: 'http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8' }}
            //source={{ uri: 'https://str21.vidoza.net/x4lf6zhxsbzegg4nxcquuxctvng5jirexbkullj6qjvdd6z5wooaa6iiplwa/v.mp4'}}
            //source={{ uri: 'https://skate.playercdn.net/73/0/CPX9fPY-e5BX3-J43GRhNg/1548628788/190127/WUBrdCoNxItxf55.mp4' }}
            //source={require('./assets/With2CC.mp4')}
            //source={require('./assets/m3u8.m3u8')}
            //ource={{uri: 'blob:http://v.youku.com/fa134fa4-c438-4a08-a3a6-3b93e7534325'}}
            //source={{uri: 'http://34.220.175.47/With2CC.mp4'}}
            //source={{ uri: 'https://s3-us-west-2.amazonaws.com/ayayo/With2CC.mp4'}}
            //source={{ uri: 'https://d10dv4h5tx8rpj.cloudfront.net/With2CC.mp4'}}
            source={{ uri: videoURI }}
            selectedTextTrack={this.state.text}
            style={styles.mediaPlayer}
            />
            <MediaControls
              duration={this.state.duration}
              isLoading={this.state.isLoading}
              mainColor="white"
              onFullScreen={this.onFullScreen}
              onPaused={this.onPaused}
              onReplay={this.onReplay}
              onSeek={this.onSeek}
              onSeeking={this.onSeeking}
              onCaptionSelect={this.onCaptionSelect}
              playerState={this.state.playerState}
              progress={this.state.currentTime}
              buffer={this.state.bufferTime}
              toolbar={this.renderToolbar()}
            />
        </View>
        {!this.state.isFullScreen &&
          <ScrollView style={styles.scroll}
                      showsVerticalScrollIndicator={false}
                      ref={scrollView => (this.scrollView = scrollView)}>
            <View style={styles.videoTitleBox}>
              <Text style={styles.videoTitle}>{videoTitle}</Text>
            </View>
            <View style={styles.viewsBox}>
              <Text style={styles.viewsText}>{this.props.lang == 'chinese' ? '浏览量:' : 'Views:'} {this.state.viewText}</Text>
            </View>
            <View style={styles.interactionBox}>
              <TouchableOpacity onPress={this.scrollToComments}>
                <View>
                  <View style={styles.iconTextBox}>
                    <Image source={require('./assets/ic_comments.png')} style={styles.commentsPic} />
                    <Text style={styles.commentsText}>No Comments</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.interactionThumbsBox}>
                <TouchableOpacity style={styles.thumbUpTouchBox} onPress={() => this.onThumbPress(true)}>
                  <Image source={thumbUpSrc} style={styles.thumbsUp} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.thumbDownTouchBox} onPress={() => this.onThumbPress(false)}>
                  <Image source={thumbDownSrc} style={styles.thumbsDown} />
                </TouchableOpacity>              
              </View>
            </View>
            <View style={styles.creatorBox}>
              <View style={styles.iconTextBox}>
                <Image source={require('./assets/ic_profile.png')} style={styles.profilePic} />
                <View style={styles.dateBox}>
                  <Text style={styles.creatorText}>{creator}</Text>
                  <Text style={styles.dateText}>{this.props.lang == 'chinese' ? '上传日期:' : 'Upload Date:'} {uploadDate}</Text>
                </View>
              </View>
              <View>
                <TouchableOpacity style={[styles.buttonFollow, this.state.followed && styles.buttonFollowed]} 
                                  onPress={this.toggleFollow}>
                  <View style={styles.followTextView}>
                    <Text style={[styles.followText, this.state.followed && styles.followedText]}>
                      {this.state.followed ? 'FOLLOWED' : '+FOLLOW'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* <View style={styles.dateBox}>
              <Text style={styles.dateText}>{this.props.lang == 'chinese' ? '上传日期:' : 'Upload Date:'} {uploadDate}</Text>
            </View> */}
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>

            <Text style={styles.commentsTitle}>Related Videos</Text>
            <RelatedVideos data={navigation.getParam('related')}/>

            <View style={styles.commentsBox}>
              <Text style={styles.commentsTitle}>{this.props.lang == 'chinese' ? '评论' : 'Comments'}</Text>
              <Text style={styles.comingSoon}>{commentsText}</Text>
            </View>
            <Image source={require('./assets/qrcode.jpg')} style={{resizeMode: 'contain', width:width-20,height:1.2*(width-20)}}/>      
          </ScrollView>
        }
        </SafeAreaView>
      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoView: {
    width: width,
    height: width / (16/9),
  },
  fullscreenVideoView: {
    height: width,
    //width: height,
    flex: 1,
    //alignSelf: 'center'
  },
  toolbar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullscreenTitle: {
    //marginTop: 10,
    //backgroundColor: 'green',
    marginLeft: 25,
    marginTop: 15,
    //borderRadius: 5,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  overscan: {
    marginRight: 25,
    marginTop: 15,
  },
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    //marginBottom: 10,
    color: 'black'
  },
  scroll: {
    marginHorizontal: 10,
    marginTop: 10
  },
  viewsText: {
    paddingTop: 4,
    paddingBottom: 5,
    fontWeight: '100',
    borderBottomColor: 'dimgrey'
  },
  viewsBox: {
    //borderBottomColor: 'lightgrey',
    //borderBottomWidth: 1
  },
  interactionBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
    //backgroundColor: 'lightblue'
  },
  iconTextBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsPic: {
    height: 30,
    width: 30,
  },
  commentsText: {
    fontSize: 15,
    color: 'black',
    marginLeft: 4,
    //backgroundColor: 'red'
  },
  interactionThumbsBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5
  },
  thumbUpTouchBox: {
    marginRight: 3
  },
  thumbDownTouchBox: {
  },
  thumbsUp: {
    margin: 5,
    width: 23,
    height: 28
  },
  thumbsDown: {
    margin: 5,
    width: 23,
    height: 28,
    transform: [{ rotate: '180deg' }]
  },
  creatorBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'lightgrey',
    //borderBottomWidth: StyleSheet.hairlineWidth,
    //borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 7
  },
  profilePic: {
    height: 42,
    width: 42,
  },
  creatorText: {
    fontSize: 15,
    color: 'black',
  },
  buttonFollow: {
    height: 38,
    //borderWidth: 2,
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 2
  },
  buttonFollowed: {
    borderColor: '#777777',
  },
  followTextView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followText: {
    fontSize: 15,
    marginHorizontal: 5,
    color: 'black',
    fontWeight: 'bold'
  },
  followedText: {
    color: '#aaaaaa',
  },
  dateText: {
    //paddingBottom: 7,
    fontSize: 13,
    fontWeight: "100"
  },
  dateBox: {
    paddingLeft: 4,
  },
  descriptionText: {
    fontWeight: '100',
  },
  descriptionBox: {
    paddingTop: 11,
    paddingBottom: 15,
    paddingHorizontal: 5,
    borderColor: 'lightgrey',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  commentsTitle: {
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black'
  },
  comingSoon: {
    fontWeight: '100',
    //fontSize: 13
  }
});