import _ from 'lodash';
import React, { Component } from 'react';
import { ImageBackground, SectionList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card, Divider, Image } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-navigation';
  
class Thumbnail extends Component {
  render () {
    const thumbnailOverlay =
    <LinearGradient
      colors={['transparent', 'transparent', 'transparent', '#111111']}
      style={styles.thumbnailOverlay}>
      <Text style={this.props.titleStyle}>{this.props.title}</Text>
      <Text style={this.props.subtitleStyle}>{this.props.subtitle}</Text>
    </LinearGradient>;

    return (
      <Image 
        source={this.props.image} 
        style={this.props.imageStyle}
        ImageComponent={ImageBackground}>
        {thumbnailOverlay}
      </Image>
    );
  }
}
  
class VideoCard extends Component {
  constructor(props) {
    super(props);
    this.state = {viewCount : null};
    
    const viewCounterURI = 'https://twdiusa780.execute-api.us-west-2.amazonaws.com/default/updateViews?get=yes&ID=';
    fetch(viewCounterURI + this.props.item.key)
      .then((response) => response.text())
      .then((viewCount) => {
        this.setState({viewCount : Number(viewCount)});
      });
  }
  
  render () {
    const item = this.props.item;
    const viewsText = this.props.lang == 'chinese' ? '浏览量' : 'Views';
    const viewCounter = this.state.viewCount ? `${this.state.viewCount} ${viewsText}` : '';
    return (
        <Card
          containerStyle={styles.itemContainer}
          wrapperStyle={styles.itemContainerInner}>
          <TouchableOpacity onPress={this.clicked}>
            <Thumbnail 
              image={{ uri: item.image }}
              imageStyle={styles.itemImage}
              subtitle={viewCounter}
              subtitleStyle={styles.itemSubtitle}
              title={(this.props.lang == 'chinese') ? item.nameChinese : item.name}
              titleStyle={styles.itemTitle}/>
          </TouchableOpacity>
        </Card>
    );
  }

  clicked = () => {
    const item = this.props.item;
    this.props.navigation.navigate('Video', {
      videoID: item.key,
      englishInfo: {  date: item.date,
                      creator: item.creator,
                      videoTitle: item.name,
                      description: item.description
                   },
      chineseInfo: {  date: item.dateChinese,
                      creator: item.creatorChinese,
                      videoTitle: item.nameChinese,
                      description: item.descriptionChinese
                   },
      video: item.video,
    });
    
    // Modify viewCount after navigate away to playerScreen
    this.setState(({viewCount}) => ({viewCount: Number(viewCount) + 1}));
  };
}

export default class ThumbnailViewer extends Component {
  render () {
    const category = this.props.lang == 'chinese' ? 'categoryChinese' : 'category';
    const itemsByCategory = _.chain(this.props.items)
                             .groupBy(category)
                             .map((v, k) => ({'title' : k, 'data': v }))
                             .value();

    return (
      // <SafeAreaView>
        <SectionList
          sections={itemsByCategory}
          style={styles.thumbnailList}
          renderItem={({ item }) => {
            return (
              <VideoCard item={item} navigation={this.props.navigation} lang={this.props.lang} />
            );
          }}
          renderSectionHeader={({section: {title}}) => {          
            return (
              <Divider style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderTitle}>{title}</Text>
              </Divider>
            );
          }}
          stickySectionHeadersEnabled={true}>
        </SectionList>
        // </SafeAreaView>
    );
  }
}
        
const styles = StyleSheet.create({
  itemContainer: {
    borderRadius: 10,
    borderColor: 'transparent', 
    margin: 10, 
    marginBottom: 15, // override default {..., marginBottom: 0} in Themed.Card
    padding: 0,
    shadowOffset: {'height': 1, 'width': 1},
    shadowRadius: 3,
    elevation: 10,
  },
  itemContainerInner: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  itemImage: {
    aspectRatio: 16/9,
    width: '100%',
  },
  itemSubtitle: {
    color: 'white',
    fontSize: 8,
  },
  itemTitle: {
    color: 'white',
    //fontFamily: 'sans-serif-light',
    fontSize: 14,
  },
  thumbnailOverlay: {
    flex:1,
    justifyContent: 'flex-end',
    padding: 10, 
  },
  section: {
    alignItems: 'center',
    backgroundColor: '#6A89CC',
    borderRadius: 5,
    color: 'white',
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    margin: 5,
    padding: 5,
  },
  sectionHeader: {
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderColor: '#DAE0E2',
    borderBottomWidth: 0,
    borderRadius: 0, 
    flex: 1, 
    flexDirection: 'row', 
    height: 45, 
    justifyContent: 'space-between',  
    padding: 10,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    //fontFamily: 'sans-serif-thin', 
  },
  thumbnailList: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
});