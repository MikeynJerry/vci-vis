import React from 'react';
import Select from 'react-select';
import Button from '@material-ui/core/Button';
import InputNumber from 'rc-input-number';
import Slider from 'rc-slider';
import 'rc-input-number/assets/index.css';
import 'rc-slider/assets/index.css';

export const TimeScale = props => (
  <div className="option">
    <div className="label">
      <b>Time Scale (1s - 3600s)</b>
    </div>
    <InputNumber min={1} max={3600} {...props} />
  </div>
);

export const StreamLength = props => (
  <div className="option">
    <div className="label">
      <b>Stream Length (100 - 20k)</b>
    </div>
    <InputNumber min={100} max={20000} {...props} />
  </div>
);

export const SeedPattern = props => (
  <div className="seed-pattern option">
    <div className="label">
      <b>Seed Pattern</b>
    </div>
    <Select {...props} />
  </div>
);

export const InputPlane = props => (
  <div className="input-plane option">
    <div className="label">
      <b>Input Plane (1 - 100 millibars)</b>
    </div>
    <InputNumber min={1} max={100} {...props} />
  </div>
);

export const Servers = props => (
  <div className="servers option">
    <div className="label">
      <b>Number of Servers</b>
    </div>
    <Slider
      min={1}
      max={6}
      marks={{ 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }}
      {...props}
    />
  </div>
);

export const Export = props => (
  <div className="option">
    <Button size="medium" {...props}>
      Export Options
    </Button>
  </div>
);

export const Import = props => (
  <div className="option">
    <Button size="medium" {...props}>
      Import Options
    </Button>
  </div>
);
