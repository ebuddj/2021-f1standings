import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

import { IT,PT,ES,MC,AZ,FR,AT } from 'round-flags';

import BN from './../../media/img/BN.png';

let flags = {};
flags['BRN'] = BN;
flags['ITA'] = IT;
flags['POR'] = PT;
flags['ESP'] = ES;
flags['MON'] = MC;
flags['AZB'] = AZ;
flags['FRA'] = FR;
flags['AUT'] = AT;
flags['AUT2'] = AT;

let interval;
const max_y_axis_value = 200,
      max_y_axis_step = 25,
      races = ['','BRN','ITA','POR','ESP','MON','AZB','FRA','AUT','AUT2'];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  componentDidMount() {
    this.createChart();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  createChart() {
    const width = 600,
          height = 600,
          adj = 40;

    // We are appending SVG first.
    const svg = d3.select('.' + style.chart_container).append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '-' + adj + ' -' + adj + ' ' + (width + adj * 3) + ' ' + (height + adj * 3))
      .classed('svg-content', true);

    // Fetch the data.
    d3.csv('./data/data - data.csv').then((data) => {
      let data_points = [];
      let slices = data.map((values, i) => {
        return {
          color:(i === 0) ? '#0600ef' : (i === 1) ? '#00d2be' : 'rgba(0, 0, 0, 0.5)', 
          highlighted:(i < 2) ? true : false,
          name:values.name,
          values:races.map((race, j) => {
            let max = d3.max(data, (d) => { return +d[race]; });
            if (race !== '') {
              data_points.push({
                color:(i === 0) ? '#0600ef' : (i === 1) ? '#00d2be' : 'rgba(0, 0, 0, 0.5)', 
                highlighted:(i < 2) ? true : false,
                position:(parseInt(values[race]) >= max) ? 'top' : 'bottom',
                x:j,
                y:+values[race]
              });
            }
            return {
              points:(values[race]) ? +values[race] : 0,
              race:race
            }
          })
        }
      })

      // Prepare the initial data and store the rest for later use.
      let to_be_added_slices = {};
      slices = slices.map((slice, i) => {
        to_be_added_slices[i] = slice.values.splice(-slice.values.length + 1);
        return slice;
      });

      // Scales.
      const xScale = d3.scaleLinear().range([0, width]);
      const yScale = d3.scaleLinear().range([height, 0]);
      xScale.domain([0, races.length - 1]);
      yScale.domain([0, max_y_axis_value]);

      // Axes.
      const xaxis = d3.axisBottom().ticks(races.length - 1).tickFormat((i) => { return races[i]; }).scale(xScale);
      svg.append('g')
        .attr('class', style.axis)
        .attr('transform', 'translate(0,' + height + ')')
        .call(xaxis);

      svg.select('.' + style.axis).selectAll('text');
      svg.select('.' + style.axis).selectAll('.tick')
                    .data(races)
                    .append('svg:image')
                    .attr('class', style.axis_image)
                    .attr('xlink:href', (d) => { return flags[d]; })
                    .attr('height', 30).attr('width', 30).attr('x', -15).attr('y', 25);

      const yaxis = d3.axisLeft().ticks(parseInt(max_y_axis_value / max_y_axis_step)).tickValues(d3.range(0, max_y_axis_value + max_y_axis_step, max_y_axis_step)).scale(yScale);
      svg.append('g')
        .attr('class', style.axis)
        .call(yaxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '1em')
        .attr('y', 6)
        .style('text-anchor', 'end')
        .text('Points');

      // Create the lines with current data..
      const lines = svg.selectAll('lines').data(slices).enter().append('g');
      let updateData = () => {
        // Remove any old lines.
        svg.selectAll('.' + style.line).remove();

        // Add the lines.
        const line = d3.line()
          .x((d, i) => { return xScale(i); })
          .y((d, i) => { return yScale(d.points); });

        lines.append('path')
          .attr('class', style.line)
          .attr('stroke', (d, i) => { return d.color; })
          .attr('stroke-width', (d) => { return (d.highlighted === true) ? '3px': '1px'; })
          .attr('d', (d) => { return line(d.values); });
      };

      // Add data in an interval.
      interval = setInterval(() => {
        slices = slices.map((slice, i) => {
          slice.values.push(to_be_added_slices[i].shift());
          return slice;
        });
        if (to_be_added_slices[0].length === 0) {
          clearInterval(interval);
        }
        updateData();
      }, 1000);
      
      // Add dots.
      svg.selectAll('.' + style.dot)
        .data(data_points)
        .enter().append('circle')
        .attr('class', style.dot)
        .attr('cx', (d) => { return xScale(d.x) })
        .attr('cy', (d) => { return yScale(d.y) })
        .attr('fill', (d, i) => {
          return d.color;
        })
        .attr('r', (d) => {
          return (d.highlighted === true) ? 6 : 2;
        });

      // Add dot texts.
       svg.selectAll('.' + style.dot_text)
        .data(data_points)
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('x', (d) => { return xScale(d.x); })
        .attr('y', (d) => {
          return (d.position === 'top') ? yScale(d.y + 10) : yScale(d.y - 10);
        })
        .style('font-weight', (d, i) => {
          return (d.position === 'top') ? '700' : '300';
        })
        .attr('class', style.dot_text)
        .text((d) => {
          return (d.highlighted === true) ? d.y : '';
        });

      // lines.append('text')
      //   .attr('class', style.serie_label)
      //   .datum((d) => {
      //     return {
      //       color:d.color,
      //       highlighted:d.highlighted,
      //       name:d.name,
      //       value:d.values[d.values.length - 1]
      //     }; 
      //   })
      //   .attr('fill', (d, i) => { return d.color; })
      //   .attr('transform', (d, i) => {
      //     return 'translate(' + (xScale(1) + 30) + ',' + (yScale(d.value.points) + 5 ) + ')'; 
      //   })
      //   .attr('x', 5)
      //   .text((d) => { return (d.highlighted == true) ? d.name : ''; });
    });
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <div className={style.chart_container}>
        </div>
      </div>
    );
  }
}
export default App;