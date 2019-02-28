import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image
} from 'react-native';

class RelatedVideoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return(
      <View>
        <View style={styles.thumbnailContainer}>
          <Image style={styles.thumbnail}
                 resizeMode='cover'
                 source={this.props.thumbnail}
                 defaultSource={require('../assets/thumbnail.png')} />
        </View>
        <Text>{this.props.name}</Text>
      </View>
    );
  }
}

export default class RelatedVideos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    console.log(this.props.data);
    const cardArr = this.props.data.map(video => (
      <RelatedVideoCard key={video.key}
                        thumbnail={{uri: video.image}}
                        video={video.video}
                        name={this.props.lang == 'chinese' ? video.nameChinese : video.name}
                        creator={this.props.lang == 'chinese' ? video.creatorChinese : video.creator} />
    ));
    return(
      <View>
        {cardArr}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  thumbnailContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 67.5,
    width: 120,
    //borderWidth: 2,
    backgroundColor: 'lightgrey',
    borderColor: 'black',
    //borderRadius: 8,
    overflow: 'hidden'
  },
  thumbnail: {
    flex: 1,
    alignSelf: 'stretch',
    height: undefined,
    width: undefined,
  }
});