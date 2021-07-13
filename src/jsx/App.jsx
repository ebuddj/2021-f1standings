import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

const races = ['','BRN','ITA','POR','ESP','MON','AZB','FRA','AUT','AUT2'];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  componentDidMount() {
    const width = 600;
    const height = 600;
    const adj = 30;
    // we are appending SVG first
    const svg = d3.select('.' + style.chart_container).append('svg')
      //.attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '-' + adj + ' -' + adj + ' ' + (width + adj *3) + ' ' + (height + adj*3))
      .classed('svg-content', true);

    //-----------------------------DATA-----------------------------//
    const dataset = d3.csv('./data/data.csv');
    let data_points = [];

    d3.csv('./data/data - data.csv').then((data) => {
      let slices = data.map((values, i) => {
        return {
          color:(i === 0) ? '#0600ef' : (i === 1) ? '#00d2be' : 'rgba(0, 0, 0, 0.5)', 
          highlighted:(i < 2) ? true : false,
          name:values.name,
          values:races.map((race, j) => {
            let max = d3.max(data, function(d) { return +d[race]; });
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
      //----------------------------SCALES----------------------------//
      const xScale = d3.scaleLinear().range([0, width]);
      const yScale = d3.scaleLinear().range([height, 0]);

      xScale.domain([0, races.length - 1]);
      yScale.domain([0, 200]);

      //-----------------------------AXES-----------------------------//
      const yaxis = d3.axisLeft()
        .ticks(4)
        .scale(yScale);

      const xaxis = d3.axisBottom()
        .ticks(races.length - 1)
        .tickFormat((i) => { return races[i]; })
        .scale(xScale);

      //----------------------------LINES-----------------------------//
      const line = d3.line()
        .x((d, i) => { return xScale(i); })
        .y((d, i) => { return yScale(d.points); }); 

      //-------------------------2. DRAWING---------------------------//
      //-----------------------------AXES-----------------------------//
      svg.append('g')
        .attr('class', style.axis)
        .attr('transform', 'translate(0,' + height + ')')
        .call(xaxis);

       svg.append('g')
        .attr('class', style.axis)
        .call(yaxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '.75em')
        .attr('y', 6)
        .style('text-anchor', 'end')
        .text('Points');

      //----------------------------LINES-----------------------------//
      const lines = svg.selectAll('lines')
        .data(slices)
        .enter().append('g');

      lines.append('path')
        .attr('class', style.line)
        .attr('stroke', (d, i) => { return d.color; })
        .attr('stroke-width', (d) => { return (d.highlighted === true) ? '3px': '1px'; })
        .attr('d', (d) => { return line(d.values); });

      lines.append('text')
        .attr('class', style.serie_label)
        .datum((d) => {
          return {
            color:d.color,
            highlighted:d.highlighted,
            name:d.name,
            value:d.values[d.values.length - 1]
          }; 
        })
        .attr('fill', (d, i) => { return d.color; })
        .attr('transform', (d, i) => {
          return 'translate(' + (xScale(1) + 30) + ',' + (yScale(d.value.points) + 5 ) + ')'; 
        })
        .attr('x', 5)
        .text((d) => { return (d.highlighted == true) ? d.name : ''; });

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

      // Add points text.
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
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {

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