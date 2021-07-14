import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/Tarkeasy/round-flags
import { BH,IT,PT,ES,MC,AZ,FR,AT } from 'round-flags';

// https://www.iban.com/country-codes
let interval,
    flags = {};
flags['BHR'] = BH;
flags['ITA'] = IT;
flags['PRT'] = PT;
flags['ESP'] = ES;
flags['MCO'] = MC;
flags['AZE'] = AZ;
flags['FRA'] = FR;
flags['AUT'] = AT;
flags['AUT2'] = AT;


const getHashValue = (key) => {
  let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

const data_type = getHashValue('type') ? getHashValue('type') : 'drivers',
      title = getHashValue('title') ? getHashValue('title').replace(/%20/g, ' ') : 'Title battle 2021';

const max_y_axis_value = (data_type === 'drivers') ? 200 : 300,
      max_y_axis_step = (data_type === 'drivers') ? 25 : 50,
      title_offset = (data_type === 'drivers') ? 13 : 10,
      title_html = (data_type === 'drivers') ? '<div class="' + style.title_container + '"><h1>' + title + '</h1><div><h3 class="' + style.redbull + '"><span class="' + style.position + '">1</span><span class="' + style.name + '">Verstappen #33</span><span class="' + style.team + '">Red Bull</span></h3></div><div><h3 class="' + style.mercedes + '"><span class="' + style.position + '">2</span><span class="' + style.name + '">Hamilton #44</span><span class="' + style.team + '">Mercedes</span></h3></div></div>' : '<div class="' + style.title_container + '"><h1>' + title + '</h1><div><h3 class="' + style.redbull + '"><span class="' + style.position + '">1</span><span class="' + style.name + '">Red Bull Racing Honda</span></h3></div><div><h3 class="' + style.mercedes + '"><span class="' + style.position + '">2</span><span class="' + style.name + '">Mercedes AMG Petronas</span></h3></div></div>',
      races = ['','BHR','ITA','PRT','ESP','MCO','AZE','FRA','AUT','AUT2'];

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
          adj = 45;

    // We are appending SVG first.
    const svg = d3.select('.' + style.chart_container).append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '-' + adj + ' -' + adj + ' ' + (width + adj * 3) + ' ' + (height + adj * 3))
      .classed('svg-content', true);

    // Fetch the data.
    d3.csv('./data/data - ' + data_type + ' - data.csv').then((data) => {
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

      // Grid lines.
      const make_y_gridlines = () => {
        return d3.axisLeft(yScale).ticks(parseInt(max_y_axis_value / max_y_axis_step) - 1).tickValues(d3.range(0, max_y_axis_value, max_y_axis_step));
      }
      // Add the Y gridlines
      svg.append('g')
        .attr('class', style.grid)
        .call(make_y_gridlines()
            .tickSize(-width - 20)
            .tickFormat('')
        );

      // Grid Axes.
      const xaxis = d3.axisBottom().ticks(races.length - 1).tickFormat((i) => { return races[i]; }).scale(xScale);
      svg.append('g')
        .attr('class', style.axis + ' ' + style.xaxis)
        .attr('transform', 'translate(0,' + height + ')')
        .call(xaxis)
        .append('text')
        .attr('y', 43)
        .attr('x', 3)
        .attr('text-anchor', 'middle')
        .text('Races');

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
      const updateData = () => {
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
          return (d.position === 'top') ? '600' : '400';
        })
        .attr('class', style.dot_text)
        .text((d) => {
          return (d.highlighted === true) ? d.y : '';
        });

      svg.append('foreignObject')
        .attr('text-anchor', 'middle')
        .attr('width', 450)
        .attr('x', xScale(0.7))
        .attr('y', yScale(max_y_axis_value - title_offset))
        .attr('height', 200)
        .attr('alignment-baseline', 'central')
        .html(title_html);
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