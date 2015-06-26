var React = require('react/addons');
var TabTemplate = require('./tabTemplate');
var InkBar = require('../ink-bar');
var Paper = require('../paper');
var StylePropable = require('../mixins/style-propable.js');
var Events = require('../utils/events');


var Tabs = React.createClass({

  mixins: [StylePropable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    initialSelectedIndex: React.PropTypes.number,
    onActive: React.PropTypes.func,
    tabWidth: React.PropTypes.number,
    zDepth: React.PropTypes.oneOf([0,1,2,3,4,5]),
  },
  getDefaultProps: function() {
    return {
      zDepth: 0,
    };
  },
  getInitialState: function(){
    var selectedIndex = 0;
    if (this.props.initialSelectedIndex && this.props.initialSelectedIndex < this.props.children.length) {
      selectedIndex = this.props.initialSelectedIndex;
    }
    return {
      selectedIndex: selectedIndex
    };
  },

  getEvenWidth: function(){
    return (
      parseInt(window
        .getComputedStyle(React.findDOMNode(this))
        .getPropertyValue('width'), 10)
    );
  },

  componentDidMount: function() {
    this._updateTabWidth();
    Events.on(window, 'resize', this._updateTabWidth);
  },

  componentWillUnmount: function() {
    Events.off(window, 'resize', this._updateTabWidth);
  },

  componentWillReceiveProps: function(newProps) {
    if (newProps.hasOwnProperty('style')) this._updateTabWidth();
  },

  handleTouchTap: function(tabIndex, tab){
    if (this.props.onChange && this.state.selectedIndex !== tabIndex) {
      this.props.onChange(tabIndex, tab);
    }

    this.setState({selectedIndex: tabIndex});
    //default CB is _onActive. Can be updated in tab.jsx
    if(tab.props.onActive) tab.props.onActive(tab);
  },

  getStyles: function() {
    var themeVariables = this.context.muiTheme.component.tabs;

    return {
      tabItemContainer: {
        margin: '0',
        padding: '0',
        width: '100%',

        backgroundColor: themeVariables.backgroundColor,
        whiteSpace: 'nowrap',
        display: 'table'
      },
      tabBar: {
        height: '48px',
        zIndex: 100,
        width: '100%',
        boxShadow:  "0 2px 3px 0 rgba(0,0,0,0.22)",
        position:'absolute'
      },
      tabContent:{
        width: '100%'

      }
    };
  },


  render: function(){
    var styles = this.getStyles();

    var tabContent = []
    var itemWidth =  window.innerWidth / this.props.children.length;
    var width = this.state.fixedWidth ?
       itemWidth +'px' :
      this.props.tabWidth + 'px';

    var left = itemWidth * this.state.selectedIndex +"px";//'calc(' + width + '*' + this.state.selectedIndex + ')';

    var tabs = React.Children.map(this.props.children, function(tab, index){
      if(tab.type.displayName === "Tab") {

        if(tab.props.children) {
          tabContent.push(React.createElement(TabTemplate, {
            key: index,
            selected: this.state.selectedIndex === index
          }, tab.props.children));
        } else {
          tabContent.push(undefined)
        }

        return React.addons.cloneWithProps(tab, {
          key: index,
          selected: this.state.selectedIndex === index,
          tabIndex: index,
          width: width,
          handleTouchTap: this.handleTouchTap
        });
      } else {
        var type = tab.type.displayName || tab.type;
        throw 'Tabs only accepts Tab Components as children. Found ' +
              type + ' as child number ' + (index + 1) + ' of Tabs';
      }
    }, this);
    return (
      <div style={this.mergeAndPrefix(this.props.style)}>
        <div style={this.mergeAndPrefix(styles.tabBar, this.props.tabBarStyle)}>
        <div style={this.mergeAndPrefix(styles.tabItemContainer, this.props.tabItemContainerStyle)}>
          {tabs}
        </div>
          <InkBar left={left} width={width} />
        </div>
        <div style={this.mergeAndPrefix(styles.tabContent, this.props.tabContentStyle)}>
          {tabContent}
        </div>
      </div>
    )
  },
  _getZDepthShadows: function(zDepth) {
    var shadows = [
      '',
      'inset 0 -10px 10px -10px　rgba(0, 0, 0, 0.12)',
      'inset 0 -20px 20px -20px rgba(0, 0, 0, 0.16)',
      'inset 0 -30px 30px -30px rgba(0, 0, 0, 0.19)',
      'inset 0 -40px 40px -40px rgba(0, 0, 0, 0.25)',
      'inset 0 -60px 60px -60px rgba(0, 0, 0, 0.30)'
    ];

    return shadows[zDepth];
  },
  _tabWidthPropIsValid: function() {
    return this.props.tabWidth &&
      (this.props.tabWidth * this.props.children.length <= this.getEvenWidth());
  },

  // Validates that the tabWidth can fit all tabs on the tab bar. If not, the
  // tabWidth is recalculated and fixed.
  _updateTabWidth: function() {
    if(this._tabWidthPropIsValid()) {
      this.setState({
        fixedWidth: false
      });
    } else {
      this.setState({
        fixedWidth: true
      });
    }
  }

});

module.exports = Tabs;
