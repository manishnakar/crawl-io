import React, { Component } from 'react';
import { Card } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import Header from '../../../components/Header';
import strings from '../../../strings';

/* eslint-disable react/forbid-prop-types */

class Search extends Component {
    handleStartSearchClick = () => {
      this.props.navigateTo(`/results?searchTerm=${this.props.searchTerm}`);
    }

    render() {
      const { newSearchTerm } = this.props;
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Header />
          <Card style={{
            width: '80%',
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            }}
          >
            <form style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }} onSubmit={this.handleStartSearchClick}>
              <TextField
                onChange={event => newSearchTerm(event.target.value)}
                style={{ width: 350 }}
                hintText="Escribí el nombre del producto que buscás"
              />
              <br />
              <RaisedButton
                onClick={() => this.handleStartSearchClick()}
                label={strings.searchAction}
                secondary
                style={{ margin: 12 }}
              />
            </form>
          </Card>
        </div>
      );
    }
}

Search.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  newSearchTerm: PropTypes.func.isRequired,
  navigateTo: PropTypes.func.isRequired,
};

export default Search;
