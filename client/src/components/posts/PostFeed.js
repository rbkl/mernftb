import React, { Component } from "react";
import PropTypes from "prop-types";
import PostItem from "./PostItem";

class PostFeed extends Component {

  render() {
    const { posts } = this.props;

    // Map through posts and return them
    return posts.map(post => <PostItem key={post._id} post={post} showActions={true} />);
  }
}

PostFeed.propTypes = {
  posts: PropTypes.array.isRequired
};

export default PostFeed;
