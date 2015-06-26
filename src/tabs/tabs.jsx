
let React = require('react/addons');
let TabTemplate = require('./tabTemplate');
let InkBar = require('../ink-bar');
let StylePropable = require('../mixins/style-propable');
let Events = require('../utils/events');



let Tabs = React.createClass({

  mixins: [StylePropable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    initialSelectedIndex: React.PropTypes.number,
    onActive: React.PropTypes.func,
    tabWidth: React.PropTypes.number,

    tabItemContainerStyle: React.PropTypes.object,
    contentContainerStyle: React.PropTypes.object,
  },

  getInitialState(){
    let selectedIndex = 0;

    if (this.props.initialSelectedIndex && this.props.initialSelectedIndex < this.props.children.length) {
      selectedIndex = this.props.initialSelectedIndex;
    }
    return {
      selectedIndex: selectedIndex
    };
  },

  getEvenWidth(){
    return (
      parseInt(window
        .getComputedStyle(React.findDOMNode(this))
        .getPropertyValue('width'), 10)
    );
  },

  componentDidMount() {
    this._updateTabWidth();
    Events.on(window, 'resize', this._updateTabWidth);
  },

  componentWillUnmount() {
    Events.off(window, 'resize', this._updateTabWidth);
  },

  componentWillReceiveProps(newProps) {
    if (newProps.hasOwnProperty('style')) this._updateTabWidth();
  },

  handleTouchTap(tabIndex, tab){
    if (this.props.onChange && this.state.selectedIndex !== tabIndex) {
      this.props.onChange(tabIndex, tab);
    }

    this.setState({selectedIndex: tabIndex});
    //default CB is _onActive. Can be updated in tab.jsx
    if (tab.props.onActive) tab.props.onActive(tab);
  },

  getStyles() {
    let themeVariables = this.context.muiTheme.component.tabs;

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


    let tabs = React.Children.map(this.props.children, (tab, index) => {
      if (tab.type.displayName === "Tab") {
        if (tab.props.children) {
          tabContent.push(React.createElement(TabTemplate, {
            key: index,
            selected: this.state.selectedIndex === index
          }, tab.props.children));
        }
        else {
          tabContent.push(undefined)
        }

        return React.addons.cloneWithProps(tab, {
          key: index,
          selected: this.state.selectedIndex === index,
          tabIndex: index,
          width: width,
          handleTouchTap: this.handleTouchTap
        });
      }
      else {
        let type = tab.type.displayName || tab.type;
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


  _tabWidthPropIsValid() {

    return this.props.tabWidth &&
      (this.props.tabWidth * this.props.children.length <= this.getEvenWidth());
  },

  // Validates that the tabWidth can fit all tabs on the tab bar. If not, the
  // tabWidth is recalculated and fixed.
  _updateTabWidth() {
    if (this._tabWidthPropIsValid()) {
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
