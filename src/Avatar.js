import React, { Component } from 'react';
import { Avatar } from 'gitstar-components';
import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';

// defining queries in GraphQl
const GET_AVATAR = gql`
  query {
    viewer {
      avatarUrl
    }
  }
`;

/* 
  If localStorage doesn't contain github token, that is, user is not signed in, pass current props to avatar
  Else use a query wrapper and pass the query defined above.
  Apollo will give us loading, error and data as response which we can use for our avatar.
  If loading, return a loading view, if error, return an error view, else,
  return avatar with url=avatarUrl from data returned
*/
class UserAvatar extends Component {
  render() {
    if (!localStorage.getItem('github_token')) {
      return <Avatar {...this.props} />;
    }
    return (
      <Query query={GET_AVATAR}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error!!</div>;
          return <Avatar url={data.viewer.avatarUrl} />;
        }}
      </Query>
    );
  }
}

export default UserAvatar;
