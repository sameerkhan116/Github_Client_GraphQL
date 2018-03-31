import React, { Component } from 'react';
import fetch from 'unfetch';
// gitstart components - awesome visual design langugage library
import {
  STATUS,
  Loading,
  Logo,
  Logotype,
  Container,
  Header
} from 'gitstar-components';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import Avatar from './Avatar';
import Repositories from './Repositories';

// these variables need to be setup as environment variables
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const AUTH_API_URI = process.env.REACT_APP_AUTH_API_URI;

// create apolloclient using Apollo Boost by passing it the graphql api from github.
// the token is retrieved  from local storage
// if the token exists in local storage then operation.setContext header will be 'Bearer + token'
const client = new ApolloClient({
  uri: 'https://api.github.com/graphql',
  request: operation => {
    const token = localStorage.getItem('github_token');
    if (token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
    }
  }
});

class App extends Component {
  // need two state variables, one to keep check on status and other to keep track of tokens
  state = {
    status: STATUS.INITIAL
  };

  /* 
    Lot of things needs to be done when component mounts:
    1. if local storage contains github token then set state toke to this token and status to authenticated.
    2. Check if there is an outgoing code, if there, set status to loading and,
       Fetch the data from the AUTH_API_URI and set the localstorage item for github.token
       When this is done, set the state to this token and status to finished loading
  */
  componentDidMount() {
    // console.log(process.env);
    const token = localStorage.getItem('github_token');
    if (token) {
      this.setState({
        token,
        status: STATUS.AUTHENTICATED
      });
      return;
    }
    const code =
      window.location.href.match(/\?code=(.*)/) &&
      window.location.href.match(/\?code=(.*)/)[1];
    if (code) {
      this.setState({
        status: STATUS.LOADING
      });
      fetch(`${AUTH_API_URI}${code}`)
        .then(res => res.json())
        .then(({ token }) => {
          localStorage.setItem('github_token', token);
          this.setState({ token, status: STATUS.FINISHED_LOADING });
        });
    }
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <Container>
          <Header>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Logo />
              <Logotype />
            </div>
            <Avatar
              style={{
                transform: `scale(${
                  this.state.status === STATUS.AUTHENTICATED ? '1' : '0'
                })`
              }}
            />
            <a
              style={{
                display:
                  this.state.status === STATUS.INITIAL ? 'inline' : 'none'
              }}
              href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user&redirect_uri=${REDIRECT_URI}`}
            >
              Login
            </a>
          </Header>
          <Loading
            status={this.state.status}
            callback={() => {
              if (this.props.status !== STATUS.AUTHENTICATED) {
                this.setState({
                  status: STATUS.AUTHENTICATED
                });
              }
            }}
          />
          {this.state.status === STATUS.AUTHENTICATED && <Repositories />}
        </Container>
      </ApolloProvider>
    );
  }
}

export default App;
