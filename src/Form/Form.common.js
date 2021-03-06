import React, { Component, PropTypes, Children, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';
import { mergeStyles } from '../Styling';
import Desktop from '../Desktop';
import Row from './Row.common/Row.common';
import RowWrapper from './Row.common/RowWrapper.common';
import Label from '../Label';
import LabelOSX from '../Label/Label.osx';
import LabelWindows from '../TextBlock/TextBlock.windows';

var styles = {
  table: {
    WebkitUserSelect: 'none',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  labelRowOsx: {
    marginBottom: '20px'
  },

  labelRowWin: {
    marginBottom: '10px'
  }
};

class Form extends Component {
  static Row = Row;

  labels = [];
  rows = [];

  static propTypes = {
    children: PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element, React.PropTypes.array]),
    style: PropTypes.object,
    onSubmit: PropTypes.func,
    visible: PropTypes.bool,
    display: PropTypes.bool
  };

  constructor(props) {
    super();
    this.state = { visible: props.visible !== false, display: props.display !== false };
  }

  registerRow(row) {
    this.rows = [...this.rows, row];
    if (Desktop.os === 'win') {
      this.applyWithToRows();
    }
  }


  registerLabel(label) {
    this.labels = [...this.labels, label];
    if (Desktop.os === 'osx') {
      this.applyWithToLabels();
      this.applyWithToRows();
    }
  }

  applyWithToLabels() {
    let maxWidth = 0;
    let labels = [];
    for (let label of this.labels) {
      label = findDOMNode(label);
      labels = [...labels, label];
      maxWidth =
        label.offsetWidth > maxWidth ? label.offsetWidth : maxWidth;
    }
    for (let label of labels) {
      label.style.width = `${maxWidth + 1}px`;
    }
  }

  applyWithToRows() {
    let maxWidth = 0;
    let rows = [];

    for (var prop in this.refs) {
      if (this.refs.hasOwnProperty(prop)) {
        let row = findDOMNode(this.refs[prop]);
        rows = [...rows, row];
        maxWidth =
          row.offsetWidth > maxWidth ? row.offsetWidth : maxWidth;
      }
    }

    for (let row of rows) {
      row.style.width = `${maxWidth}px`;
    }
  }

  submit = event => {
    event.preventDefault();
    if (this.props.onSubmit) {
      this.props.onSubmit();
    }
  };

  render() {
    let { onSubmit, children, style, ...props } = this.props;
    let componentStyle = mergeStyles(styles.table, style);

    children = Children.map(children, function (element, index) {
      const isLast = index + 1 === Children.count(children);
      if (isLast) {
        element = cloneElement(element, {
          style: mergeStyles(element.props.style, {marginBottom: '0'})
        });
      }

      if (element.type === Row) {
        const ref = `row-${index}`;
        return (
          <RowWrapper ref={ref} style={style}>
            {cloneElement(element, {form: this})}
          </RowWrapper>
        );
      } else if (element.type === Label || element.type === LabelOSX || element.type === LabelWindows) {
        const ref = `label-${index}`;
        return (
          <RowWrapper ref={ref} style={Desktop.os === 'win' ? styles.labelRowWin : styles.labelRowOsx}>
            {cloneElement(element, {form: this})}
          </RowWrapper>
        );
      }
      return element;
    }.bind(this));

    return (
      <form
        onSubmit={this.submit.bind(this)}
        style={componentStyle}
        {...props}
      >
        {children}
      </form>
    );
  }
}

export default Form;
