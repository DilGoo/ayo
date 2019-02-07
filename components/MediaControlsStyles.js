// @flow

// eslint ignore next $FlowFixMe
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    //flex: 1,
    //paddingHorizontal: 20,
    //paddingVertical: 13,
    //paddingVertical: 25,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  controlsRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: 'red'
    //alignSelf: 'stretch',
  },
  toolbarRow: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignSelf: 'stretch',
    //backgroundColor: 'red'
  },
  videoTitle: {
    // backgroundColor: 'green',
    // marginTop: 10,
    // flex:1,
    // alignSelf: 'stretch'
  },
  timeRow: {
    alignSelf: 'stretch',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: 35,
    height: 35,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0)',
  },
  playIcon: {
    width: 25,
    height: 30,
    paddingLeft: 10,
    resizeMode: 'contain',
    //backgroundColor: 'red'
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  replayIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    resizeMode: 'stretch',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    //justifyContent: 'flex-end',
    alignItems: 'flex-end',
    //marginBottom: -25,
    //backgroundColor: 'blue',
  },
  progressEndContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 20,
    paddingVertical: 5,
    //backgroundColor: 'orange',
  },
  progressColumnContainer: {
    flex: 1,
    paddingHorizontal: 5,
    //backgroundColor: 'green',
  },
  fullScreenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    //backgroundColor: 'purple'
  },
  progressSlider: {
    alignSelf: 'stretch',
  },
  timerLabelsContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -7,
  },
  timerLabel: {
    fontSize: 12,
    color: 'white',
  },
  track: {
    height: 5,
    borderRadius: 1,
  },
  thumb: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'dimgrey'
  },
  menuTrigger: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    //backgroundColor: 'brown'
  },
  anchorStyle: {
    backgroundColor: 'dimgrey'
  },
});
