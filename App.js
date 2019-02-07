



import React, { Component } from 'react';
import { Button, Platform, StatusBar, Text, TouchableOpacity } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import { createAppContainer, createStackNavigator, SafeAreaView } from 'react-navigation';

import Splash from './components/Splash';
import ThumbnailViewer from './components/ThumbnailViewer';
import VideoScreen from './VideoScreen';


const overrideNavOptionsOnLoad = ({ navigation, screenProps }) => {
  // StatusBar.setBarStyle('dark-content', true);
  // Platform.OS == 'android' && StatusBar.setBackgroundColor('white', true);
  let toggleLangButton;
  if (Platform.OS == 'ios') {
    toggleLangButton =
      <Button
        onPress={screenProps.toggleLang}
        title={ screenProps.lang == 'chinese' ? 'EN' : '中文'}
        color="black"
      />;
  } else {
    toggleLangButton = 
      <TouchableOpacity 
        onPress={screenProps.toggleLang}
        style={{padding: 13, color:'black', fontSize:30}}>
        <Text style={{fontSize:20}}>
          {screenProps.lang == 'chinese' ? 'EN' : '中文'}
        </Text>
      </TouchableOpacity>;
  }

  return (
    {
      header: navigation.getParam('header', undefined),
      headerRight: toggleLangButton,
      gesturesEnabled: false,
    }
  );
};

class PlayerScreen extends Component {
  static navigationOptions = overrideNavOptionsOnLoad;
    
  constructor(props) {
    super(props);
    this.state = {isLoading: true, language:'english'};
  }
    
  render() {
    return (
      <VideoScreen
        navigation={this.props.navigation}
        lang={this.props.screenProps.lang}
      />
    );
  }
}

class DetailsScreen extends React.Component {
  static navigationOptions = overrideNavOptionsOnLoad;

  constructor(props) {
    super(props);
    this.state = {isLoading: true};
    fetch('https://d10dv4h5tx8rpj.cloudfront.net/manifest.brah')
      .then((response) => response.json())
      .then((body) => {
        this.setState({isLoading: false, manifest: body});
      })
      .catch((error) => { throw(error); });
  }
      
  render() {
    let home;
    if (this.state.isLoading) {
      home = null;
    } else {
      home = 
      <SafeAreaView>
        <ThumbnailViewer 
          navigation={this.props.navigation} 
          items={this.state.manifest}
          lang={this.props.screenProps.lang}
        />
      </SafeAreaView>;
    }
    return home;
  }
}

// class SplashScreen extends React.Component {
//   render() {
//     Orientation.lockToPortrait();
//     return (
//       <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//         <View>
//           <ActivityIndicator/>
//           <Text>Loading</Text>
//         </View>
//       </View>
//     );
//   }
// }

const AppNavigator = createStackNavigator(
  {
    Browse: DetailsScreen,
    Video: PlayerScreen
  },
  {
    initialRouteName: 'Browse',
    headerLayoutPreset: 'center',
    defaultNavigationOptions: {
      title: 'PRIVATE BETA',
      headerTintColor: 'black',
      headerTitleStyle: {
        flex: 1,
        fontWeight: '100',
        fontSize: 13,
        textAlign: 'center',
        alignSelf: 'center',
      }
    }
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {  
  constructor(props) {
    super(props);
    this.state = { lang : 'english' };
  }

  render() {
    return (
      <MenuProvider>
        <AppContainer screenProps={{ toggleLang : this.toggleLang, ...this.state}}/>
      </MenuProvider>
    );
  }

  toggleLang = () => {
    this.setState(({ lang }) => {
      let newLang;
      if (lang == 'chinese') {
        newLang = 'english';
      } else {
        newLang = 'chinese';
      }

      return { lang : newLang };
    });
  }
}