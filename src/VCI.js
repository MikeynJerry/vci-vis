import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import JSONPretty from 'react-json-pretty';
import './VCI.css';

import createScene from './CreateThreeScene';
import {
  TimeScale,
  StreamLength,
  SeedPattern,
  InputPlane,
  Servers,
  Export,
  Import
} from './Options';

const patternOptions = [
  { value: 'point', label: 'Point' },
  { value: 'circle', label: 'Circle' },
  { value: 'spiral', label: 'Spiral' },
  { value: 'square', label: 'Square' }
];
class VCI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      options: '',
      pattern: patternOptions[2],
      plane: 1,
      servers: 1,
      stream: 100,
      time: 1
    };
  }

  componentDidMount() {
    createScene(this.threeElement);
  }

  handleStateChange = key => value => {
    console.log(key, value);
    this.setState({ [key]: value });
  };

  tryImport = () => {
    const { options } = this.state;
    try {
      const parsedOptions = JSON.parse(options);
      return this.setState({ ...parsedOptions, openImport: false });
    } catch {}
  };

  render() {
    const {
      openExport,
      openImport,
      pattern,
      plane,
      servers,
      stream,
      time
    } = this.state;
    return (
      <div>
        <Modal
          open={openExport}
          onClose={() => this.setState({ openExport: false })}
        >
          <div className="modal">
            <Typography variant="subtitle1">
              <JSONPretty data={{ pattern, plane, servers, stream, time }} />
            </Typography>
          </div>
        </Modal>
        <Modal
          open={openImport}
          onClose={() => this.setState({ openImport: false })}
        >
          <div className="modal">
            <textarea
              className="textarea"
              onChange={e => this.handleStateChange('options')(e.target.value)}
            />
            <Button
              size="medium"
              className="import-button"
              onClick={this.tryImport}
            >
              Import
            </Button>
          </div>
        </Modal>
        <div className="header">Tapestry Studio</div>
        <div className="options-box">
          <div className="title-bar">Options</div>
          <TimeScale value={time} onChange={this.handleStateChange('time')} />
          <StreamLength
            value={stream}
            onChange={this.handleStateChange('stream')}
          />
          <SeedPattern
            options={patternOptions}
            onChange={this.handleStateChange('pattern')}
            value={pattern}
          />
          <InputPlane
            value={plane}
            onChange={this.handleStateChange('plane')}
          />
          <Servers
            value={servers}
            onChange={this.handleStateChange('servers')}
          />
          <Export onClick={() => this.setState({ openExport: true })} />
          <Import onClick={() => this.setState({ openImport: true })} />
        </div>
        <div className="vis" ref={ele => (this.threeElement = ele)} />
      </div>
    );
  }
}

export default VCI;
